<?php

namespace Src\ElasticSearch\Templates\Contacts;

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
                        'country' => [
                            'type' => 'text',
                        ],
                        'image' => [
                            'type' => 'text',
                        ],
                        'address_line' => [
                            'type' => 'text',
                        ],
                        'city' => [
                            'type' => 'text',
                        ],
                        'created_at' => [
                            'type' => 'date',
                        ],
                        'last_name' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'contact_id' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'title' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'zipcode' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'updated_at' => [
                            'type' => 'date',
                        ],
                        'phone' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'dob' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'domain' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'company' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        '@version' => [
                            'type' => 'text',
                        ],

                        'id' => [
                            'type' => 'long',
                        ],

                        'state' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'business_id' => [
                            'type' => 'long',
                        ],
                        'first_name' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'email' => [
                            'type' => 'text',
                            'fields' => [
                                'keyword' => [
                                    'type' => 'keyword',
                                ],
                            ],
                        ],
                        'custom_fields' => [
                            'type' => 'nested',
                            'properties' => [
                                'field' => [
                                    'type' => 'text',
                                ],
                                'updated_at' => [
                                    'type' => 'text',
                                ],
                                'value_text' => [
                                    'type' => 'text',
                                    'fields' => [
                                        'keyword' => [
                                            'type' => 'keyword',
                                        ],
                                    ],
                                ],
                                'value_string' => [
                                    'type' => 'text',
                                    'fields' => [
                                        'keyword' => [
                                            'type' => 'keyword',
                                        ],
                                    ],
                                ],
                                'created_at' => [
                                    'type' => 'text',
                                    'fields' => [
                                        'keyword' => [
                                            'type' => 'keyword',
                                        ],
                                    ],
                                ],
                                'id' => [
                                    'type' => 'long',
                                ],
                                'value_numeric' => [
                                    'type' => 'long',
                                ],
                                'identifiers_set_id' => [
                                    'type' => 'long',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public function parseResponse(array $data)
    {
        return null;
    }
}
