<?php

namespace Src\ElasticSearch\Templates\Contacts;

class QueryBuilder {

    public function buildQuery($dataSearch)
    {
        $query = ['bool' => ['should'=>[]]];
        foreach ($dataSearch as $value) {
            array_push($query['bool']['should'], $this->generateOrFilter($value));
        }
        return $query;
    }

    public function generateOrFilter($value){

        $query = ['bool'=>['must'=>[],'must_not'=>[]]];

        foreach($value as $data){
            $defaultField = ['first_name','dob','image','last_name','company','source','title','address_line','address_line_2','city','zipcode','state','country','email','phone'];
            $isNested = false;
            // check nested field
            if (!in_array($data['field'], $defaultField)) {
                $isNested = true;
            }
            switch ($data['condition']) {
                // Filter type text
                case "text_contains":
                    array_push($query['bool']['must'], $this->wildcardQuery($data['field'], $data['input'], $isNested));
                    break;
                case "text_does_not_contain":
                    array_push($query['bool']['must_not'], $this->wildcardQuery($data['field'], $data['input'],$isNested));
                    break;
                case 'text_exactly_matches':
                    array_push($query['bool']['must'],$this->matchQuery($data['field'],$data['input'],$isNested));
                    break;
                case 'text_does_not_exactly_match':
                    array_push($query['bool']['must_not'],$this->matchQuery($data['field'],$data['input'],$isNested));
                    break;
                case 'text_is_in':
                    array_push($query['bool']['must'],$this->queryStringQuery($data['field'],$data['input'],$isNested));
                    break;
                case 'text_is_not_in':
                    array_push($query['bool']['must_not'],$this->queryStringQuery($data['field'],$data['input'],$isNested));
                    break;
                case 'text_starts_with':
                    array_push($query['bool']['must'],$this->wildcardQuery($data['field'],$data['input'].'*',$isNested));
                    break;
                case 'text_ends_with':
                    array_push($query['bool']['must'],$this->wildcardQuery($data['field'],'*'.$data['input'],$isNested));
                    break;
                case 'text_between_with':
                    array_push($query['bool']['must'],$this->queryStringQuery($data['field'].'.keyword',strtolower('*'.$data['input'].'*'),$isNested));
                    break;
                case 'text_does_not_start_with':
                    array_push($query['bool']['must_not'],$this->wildcardQuery($data['field'],$data['input'].'*',$isNested));
                    break;
                case 'text_does_not_end_with':
                    array_push($query['bool']['must_not'],$this->wildcardQuery($data['field'],'*'.$data['input'],$isNested));
                    break;
                // Filter date_time
                case 'date_time_is':
                    array_push($query['bool']['must'],$this->matchQuery($data['field'], strtotime($data['input']), $isNested));
                    break;
                case 'date_time_equals':
                    array_push($query['bool']['must'],$this->matchQuery($data['field'], strtotime($data['input']), $isNested));
                    break;
                case 'date_time_before':
                    array_push($query['bool']['must'],$this->rangeQuery($data['field'],'',$data['input'], $isNested));
                    break;
                case 'date_time_after':
                    array_push($query['bool']['must'],$this->rangeQuery($data['field'],$data['input'],'', $isNested));
                    break;
                case 'date_time_between':
                    array_push($query['bool']['must'],$this->rangeQuery($data['field'],$data['input'],$data['input'], $isNested));
                    break;
                // Filter exist
                case 'exists':
                    array_push($query['bool']['must'],$this->existQuery($data['field'],$isNested));
                    break;
                case 'does_not_exist':
                    array_push($query['bool']['must_not'],$this->existQuery($data['field'],$isNested));
                    break;
                default:
                    break;
            }
        }
        return $query;
    }
    //match
    public function matchQuery($field, $input, $isNested){
        $results=['match' => [
            $field => $input
        ]];
        if($isNested){
            return $this -> nestedQuery($field, $input,'match');
        }
        return $results;
    }
    //term
    public function termQuery($field, $input,$isNested){
        $results=['term' => [
            $field => $input
        ]];
        if($isNested){
            return $this -> nestedQuery($field, $input,'term');
        }
        return $results;
    }
    //wildcard
    public function wildcardQuery($field, $input,$isNested){
        $results = ['wildcard' => [
            $field => $input
        ]];
        if($isNested){
            return $this -> nestedQuery($field, $input,'wildcard');
        }
        return $results;
    }
    //prefix
    public function prefixQuery($field, $input,$isNested){
        $results = ['prefix' => [
            $field => $input
        ]];
        if($isNested){
            return $this -> nestedQuery($field, $input,'prefix');
        }
        return $results;
    }
    //range
    public function rangeQuery($field, $gt, $lt, $isNested)
    {
        $results = ['range' => [
                $field => [
                    'gt' => $gt,
                    'lt' => $lt
                ]]];
        if($isNested){
            return ['nested'=>['path'=>'custom_fields','query'=>['bool'=>['must'=>['match' => [
                'custom_fields.field'=> $field
            ]],
            'should'=>[
                [
                    'range'=> [
                        'custom_fields.value_text'=>[
                            'gt'=>$gt,
                            'lt'=>$lt
                        ]],
                    'range'=> [
                        'custom_fields.value_string'=>[
                            'gt'=>$gt,
                            'lt'=>$lt
                        ]]
                    ,
                    'range'=> [
                        'custom_fields.value_numeric'=>[
                            'gt'=>$gt,
                            'lt'=>$lt
                        ]]
                ]
                ]]]]];
        }
        return $results;
    }
    //query_string
    public function queryStringQuery($field, $input, $isNested){
        $results = ['query_string' => [
                'default_field'=> $field,
                'query' => $input]];
        if($isNested){
            return ['nested'=>['path'=>'custom_fields','query'=>['bool'=>['must'=>['match' => [
                'custom_fields.field'=> $field
            ]],
            'should'=>[
                ['query_string'=> [
                    'default_field'=>'custom_fields.value_boolean',
                    'query' => $input]],
                ['query_string'=> [
                    'default_field'=>'custom_fields.value_text',
                    'query' => $input]],
                ['query_string'=> [
                    'default_field'=>'custom_fields.value_string',
                    'query' => $input]],
                ['query_string'=> [
                    'default_field'=>'custom_fields.value_numeric',
                    'query' => $input]]
            ]]
            ]]];
        }
        return $results;
    }
    //exist
    public function existQuery($field, $isNested){
        $results = ['exists'=>[
            'field'=> $field
        ]];
        if($isNested){
            return ['nested'=>['path'=>'custom_fields','query'=>['bool'=>['must'=>[['exists' => [
                'field'=> 'custom_fields.field'
            ]]]]]]];
        }
        return $results;
    }
    //nested query
    public function nestedQuery($field, $input, $type){
        $nestedQuery = ['nested'=> ['path'=> 'custom_fields', 'query' => ['bool' => ['must' => ['match' => [
            'custom_fields.field' => $field
        ]],
        'should'=>[
            
                [$type => ['custom_fields.value_string' => $input]],
                [$type => ['custom_fields.value_text' => $input]]
            
        ]
        ]]]];
        if($type !== 'wildcard'){
            array_push($nestedQuery['nested']['query']['bool']['should'], 
                [$type => ['custom_fields.value_boolean' => $input]],
                [$type => ['custom_fields.value_numeric' => $input]]
            );
        }
        if(is_array($input)){
            return;
        }
        return $nestedQuery;
    }
}
