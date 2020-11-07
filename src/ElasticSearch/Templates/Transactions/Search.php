<?php

namespace Src\ElasticSearch\Templates\Transactions;

use Src\ElasticSearch\Templates\ElasticTemplate;

class Search implements ElasticTemplate
{
    public function getTemplate(array $data, $from = null, $size = null)
    {
        return $this->template($data, $from, $size);
    }

    /**
     * @param array $data
     * @return array
     */
    public function parseResponse(array $data)
    {
        return [
            'total' => $data['hits']['total']['value'],
            'data' => $this->cleanTransactions($data['hits']['hits']),
            'aggs' => $data['aggregations']
        ];
    }

    /**
     * @param $data
     * @return array
     */
    public function cleanTransactions($data)
    {
        $cleanedRows = [];
        foreach ($data as $transaction) {
            $row = $transaction['_source'];
            unset($row['@timestamp']);
            unset($row['@version']);
            $cleanedRows[] = array_merge(['highlights' => $transaction['highlight'] ?? []], $row);
        }
        return $cleanedRows;
    }

    /**
     * @param $data
     * @param $from
     * @param $size
     * @return array
     */
    public function template($data, $from, $size)
    {
        $base =  [
            'index' => 'transaction_'.$data['business_id'][0],
            'body'  => [
                'aggs' => [
                    'actions' => [
                        'terms' => [
                            'field' => 'action'
                        ]
                    ]
                ],
                'from' => $from,
                'size' => $size,
                'sort' => [
                    [
                        'timestamp' => [
                            'order' => 'desc'
                        ],
                    ]
                ],
                'query' => [
                    'bool' => []
                ],
                'highlight' => [
                    'number_of_fragments' =>  10,
                    'pre_tags' => ['<span class="highlight">'],
                    'post_tags' => ['</span>'],
                    'fields' => [
                        '*' => new \stdClass()
                    ]
                ]
            ]
        ];

        if (!empty($size)) {
            $base['body']['size'] = $size ?? 10;
        }

        if (!empty($data['keyword'])) {
            $base['body']['query']['bool']['minimum_should_match'] = 1;
            $base['body']['query']['bool']['should'] = [$this->keywordQuery($data['keyword'])];
        }


        if (!empty($data['participants'])) {
            $base['body']['query']['bool']['filter'][] = $this->participantFilter($data['participants'], 'must');
        }



        if (!empty($data['identifiers'])) {
            $base['body']['query']['bool']['filter'][] = $this->participantFilter($data['identifiers'], 'should');
        }


        $keywordFilters = collect($data)->only([
            'app_id', 'integration_id', 'business_id', 'action', 'parent_id'
        ])->filter(function ($item) {
            if (!empty($item)) {
                return $item;
            }
        })->toArray();

        if (!empty($keywordFilters)) {
            $base['body']['query']['bool']['filter'][] = $this->keywordFilters($keywordFilters);
        }

        # if timestamp not defined
        if (empty($data['timestamp'])) {

            $data['timestamp'] = collect($data['timestamp'])->filter(function ($item) {
                if (!empty($item)) {
                    return $item;
                }
            })->toArray();


            if (!empty($data['timestamp'])) {
                $base['body']['query']['bool']['filter'][] = $this->rangeFilters([
                    'timestamp' => $data['timestamp']
                ]);
            }
        }

        return $base;
    }

    /**
     * @param $keywords
     * @return array
     */
    public function keywordQuery($keywords)
    {
        $shoulds = [];
        foreach ($keywords as $keyword) {

            $shoulds[] = [
                'match' => [
                    'subject' => $keyword
                ]
            ];

            $shoulds[] = [
                'match' => [
                    'content' => $keyword
                ]
            ];
        }

        return $shoulds;
    }

    /**
     * @param $participants
     * @return array
     */
    public function participantFilter($participants, $option)
    {
        foreach ($participants as $participant) {
            $filters["bool"][$option][] = [
                'nested' => [
                    'path' => 'participants',
                    'query' => [
                        'bool' => [
                            'should' => [
                                [
                                    'bool' => [
                                        'must' => [
                                            [
                                                'match' => [
                                                    'participants.email' => $participant['contact_info']
                                                ]
                                            ],
                                            [
                                                'match' => [
                                                    'participants.sender' => $participant['sender']
                                                ]
                                            ]
                                        ]
                                    ]
                                ],
                                [
                                    'bool' => [
                                        'must' => [
                                            [
                                                'match' => [
                                                    'participants.phone' => $participant['contact_info']
                                                ]
                                            ],
                                            [
                                                'match' => [
                                                    'participants.sender' => $participant['sender']
                                                ]
                                            ]
                                        ]
                                    ]
                                ],
                                [
                                    'bool' => [
                                        'must' => [
                                            [
                                                'match' => [
                                                    'participants.username' => $participant['contact_info']
                                                ]
                                            ],
                                            [
                                                'match' => [
                                                    'participants.sender' => $participant['sender']
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ];
        }

        return $filters;
    }

    /**
     * @param $keywordFilters
     * @return array
     */
    public function keywordFilters($keywordFilters)
    {
        $filters = [];
        foreach ($keywordFilters as $key => $keywordFilter) {
            $constructFilter = [];
            $constructFilter['bool']['should'] = [];
            foreach ($keywordFilter as $filter) {
                $constructFilter['bool']['should'][] = [
                    'term' => [
                        $key => $filter
                    ]
                ];
            }
            $filters[] = $constructFilter;
        }
        return $filters;
    }


    /**
     * @param $rangeFilters
     * @return array
     */
    public function rangeFilters($rangeFilters)
    {
        $filters = [];
        foreach ($rangeFilters as $key => $rangeFilter) {
            $constructFilter = [];
            $constructFilter['bool']['should'] = [];
            foreach ($rangeFilter as $filter) {
                $range = [];
                if (!empty($filter['min'])) {
                    $range['gte'] = $filter['min'];
                }
                if (!empty($filter['max'])) {
                    $range['lte'] = $filter['max'];
                }

                $constructFilter['bool']['should'][] = [
                    'range' => [
                        $key => $range
                    ]
                ];
            }
            $filters[] = $constructFilter;
        }
        return $filters;
    }
}
