<?php
/**
 * Created by PhpStorm.
 * User: rkesserwani
 * Date: 1/11/20
 * Time: 9:29 AM
 */

namespace Src\ElasticSearch;

use App\Contact;
use Elasticsearch\Client;
use Src\ElasticSearch\Templates\ElasticTemplate;

class ElasticSearch
{
    private $client;


    const BYTES_IN_A_GIGABYTE = 1073741824;

    /**
     * ElasticSearch constructor.
     * @param Client $client
     */
    public function __construct(Client $client)
    {
        $this->client = $client;
    }


    /**
     * @param ElasticTemplate $elasticTemplate
     * @param array $data
     * @param $from
     * @param $size
     * @return mixed
     * @throws \Exception
     */
    public function search(ElasticTemplate $elasticTemplate, array $data, $from, $size)
    {
        if (empty($data['business_id'])) {
            throw new \Exception("Must supply business_id");
        }


        return $elasticTemplate->parseResponse($this->client->search(
            $elasticTemplate->getTemplate($data, $from, $size)
        ));
    }


    /**
     * @param ElasticTemplate $elasticTemplate
     * @param $business_id
     * @return array
     */
    public function createIndex(ElasticTemplate $elasticTemplate, $index)
    {
        return $this->client->indices()->create(
            $elasticTemplate->getTemplate([
                'index' => $index
            ])
        );
    }


    /**
     * @return Client
     */
    public function getClient()
    {
        return $this->client;
    }


    /**
     * @param $index
     * @return mixed
     */
    public function getIndexStats($index)
    {
        return $this->client->indices()->stats([
            'index' => $index
        ]) ;
    }


    /**
     * @param $index
     * @param null $response
     * @return float|int
     */
    public function getIndexSize($index, $response = null)
    {
        if (!$response) {
            $response = $this->client->indices()->stats([
                'index' => $index
            ]);
        }

        return $response['indices'][$index]['total']['store']['size_in_bytes'] / self::BYTES_IN_A_GIGABYTE;
    }


    /**
     * @param $index
     * @param null $response
     * @return mixed
     */
    public function getIndexCount($index, $response = null)
    {
        if (!$response) {
            $response = $this->client->count([
                'index' => $index
            ]);
        }


        return $response['count'];
    }
}
