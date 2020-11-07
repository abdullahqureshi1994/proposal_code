<?php

namespace Src\ElasticSearch\Templates;

/**
 * Interface iTemplate
 * Interface for defining elasticsearch templates
 */
interface ElasticTemplate
{
    public function getTemplate(array $data, $from = null, $size = null);
    public function parseResponse(array $data);
}
