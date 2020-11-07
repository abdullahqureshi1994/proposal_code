<?php

namespace Src\Analytics;

use App\CustomField;
use Src\Analytics\Analytics;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomFieldsAnalytics extends Analytics {

    public function __construct(CustomField $model, $params) {
        $this->dbmodel = $model;
        $this->params = $params;
    }

    public function filterData($line, $queries, $group_by=true) {
        $queryBuilder = $this->dbmodel::leftJoin('custom_field_values', 'custom_fields.id', '=', 'custom_field_values.custom_field_id')
                ->where('object', 'contact')        
                ->where($line['key'], $line['value'])
                ->where('custom_field_values.created_at', '>=', $this->params['from'])
                ->where('custom_field_values.created_at', '<=', $this->params['to'])
                ->whereNotNull('custom_field_values.id')
                ->where(function ($query) use ($queries) {
                    foreach ($queries as $key => $value) {
                        $query->whereIn($value['key'], $value['value']);
                    }
                });
        
        if ($group_by) {
            $queryBuilder = $queryBuilder
                ->select(DB::raw('DATE(custom_field_values.created_at) as date'), DB::raw('count(*) as total'))
                ->groupBy('date');
        } else {
            $queryBuilder = $queryBuilder
                ->select(DB::raw('count(*) as total'));
        }
        
        Log::debug($queryBuilder->toSql());

        $results = $queryBuilder->get()->toArray();

        Log::debug($results);
        
        return $results;
    }
}
