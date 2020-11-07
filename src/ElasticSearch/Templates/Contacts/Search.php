<?php

namespace Src\ElasticSearch\Templates\Contacts;

use Src\ElasticSearch\Templates\ElasticTemplate;
use Src\ElasticSearch\Templates\Contacts\QueryBuilder;
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
            'data' => $this->cleanContacts($data['hits']['hits']),
            'aggs' => $data['aggregations']
        ];
    }

    /**
     * @param $data
     * @return array
     */
    public function cleanContacts($data)
    {
        $cleanedRows = [];
        foreach ($data as $contact) {
            $row = $contact['_source'];
            unset($row['@timestamp']);
            unset($row['@version']);
            $cleanedRows[] = array_merge($row);
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
        $queryBuilder = new QueryBuilder();
        $base =  [
            'index' => 'contact_'.$data['business_id'],
            'body'  => [
                'aggs' => [
                    'actions' => [
                        'terms' => [
                            'field' => 'type'
                        ]
                    ]
                ],
                'from' => $from,
                'size' => $size,
                'sort' => [
                    [
                        'updated_at' => [
                            'order' => 'desc'
                        ],
                    ]
                ],
                'query' =>  []
            ]
        ];
        if(empty($data['search'])){
            $base['body']['query'] = ['match_all'=> new \stdClass()];
        }else {
            if(!empty($data['search']['condition_1']) && !empty($data['search']['condition_2'])){
                $base['body']['query'] = ['bool'=>['must'=>[]]];
                array_push($base['body']['query']['bool']['must'], $queryBuilder -> buildQuery($data['search']['condition_1']));
                array_push($base['body']['query']['bool']['must'], $queryBuilder -> buildQuery($data['search']['condition_2']));
            }
            else {
                $base['body']['query'] = $queryBuilder -> buildQuery($data['search']);
            }
        }
        return $base;
    }
}
