<?php

namespace Src\ElasticSearch\Templates\Transactions;

use Src\ElasticSearch\Templates\ElasticTemplate;

class Create implements ElasticTemplate
{
    public function getTemplate(array $data, $from = null, $size = null)
    {
        return [
            'index' => $data['index'],
            'body' => [
                'mappings' => [
                    'properties' => [
                        'text_id' => [
                            'type' => 'keyword'
                        ],
                        'object_id' => [
                          'type' => 'keyword'
                        ],
                        'parent_id' => [
                            'type' => 'keyword'
                        ],
                        'type' => [
                            'type' => 'keyword'
                        ],
                        'duration' => [
                            'type' => 'keyword'
                        ],
                        'integration_id' => [
                            'type' => 'integer'
                        ],
                        'business_id' => [
                            'type' => 'integer'
                        ],
                        'content' => [
                            'type' => 'text'
                        ],
                        'snippet' => [
                            'type' => 'text'
                        ],
                        'subject' => [
                            'type' => 'text'
                        ],
                        'action' => [
                            'type' => 'keyword'
                        ],
                        'app_id' => [
                            'type' => 'integer'
                        ],
                        'timestamp' => [
                            'type' => 'integer'
                        ],
                        'link' => [
                            'type' => 'keyword'
                        ],
                        'participants' => [
                            'type' => 'nested',
                            'properties' => [
                                'email' => [
                                    'type' => 'keyword'
                                ],
                                'sender' => [
                                    'type' => 'integer'
                                ],
                                'phone' => [
                                    'type' => 'keyword'
                                ],
                                'username' => [
                                    'type' => 'keyword'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }


    public function parseResponse(array $data)
    {
        return null;
    }
}
