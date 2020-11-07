<?php

namespace Src\Analytics;

use DatePeriod;
use DateTime;
use DateInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Analytics {
    protected $dbmodel;
    protected $params = [];

    const LINE_CHART = 'line';
    const BAR_CHART = 'bar';
    const HORIZONTAL_BAR_CHART = 'hbar';
    const DOUGHNUT_CHART = 'doughnut';
    const PIE_CHART = 'pie';
    const AREA_CHART = 'area';
    const SUMMARY_CARD = 'card';

    const AnalyticCharts = [
        self::LINE_CHART,
        self::BAR_CHART,
        self::HORIZONTAL_BAR_CHART,
        self::DOUGHNUT_CHART,
        self::PIE_CHART,
        self::AREA_CHART,
        self::SUMMARY_CARD
    ];

    /**
     * @param $fromDate
     * @param $toDate
     * @return array
     */
    public function getPeriodDayArray(string $fromDate, string $toDate) {

        $results = [];

        $period = new DatePeriod(
            new DateTime($fromDate),
            new DateInterval('P1D'),
            new DateTime($toDate)
        );

        foreach ($period as $key => $value) {
            array_push($results, $value->format('Y-m-d'));
        }

        return $results;
    }

    /**
     * @param $strLines
     * @return array
     */
    public function parseStrToLinesArray(string $strLines) {
        $lines_params = explode('|', $strLines);
        $lines = [];
            
        foreach ($lines_params as $line_params) {
            $split_array = explode(':', $line_params);

            // Add to lines
            array_push($lines, [
                'key' => $split_array[0],
                'value' => $split_array[1]
            ]);
        }

        return $lines;
    }

    /**
     * @param $strQueries
     * @return array
     */
    public function parseStrToQueriesArray(string $strQueries) {
        $queries_params = explode('|', $strQueries);
        $queries = [];

        foreach ($queries_params as $querie_params) {
            $split_array = explode(':', $querie_params);

            // Add to queries
            if (in_array($split_array[0], array_column($queries, 'key'))) {
                $index = array_search($split_array[0], array_column($queries, 'key'));

                $queries[$index]['value'] = array_merge(
                    $queries[$index]['value'],
                    array($split_array[1])
                );
            } else {
                array_push($queries, [
                    'key' => $split_array[0],
                    'value' => array($split_array[1])
                ]);
            }
        }

        return $queries;
    }

    /**
     * @param $lines
     * @param $queries
     * @return array
     */
    public function filterData($line, $queries, $group_by=true) {
        $queryBuilder = $this->dbmodel::where('created_at', '>=', $this->params['from'])
            ->where('created_at', '<=', $this->params['to'])
            ->where($line['key'], $line['value'])
            ->where(function ($query) use ($queries) {
                foreach ($queries as $key => $value) {
                    $query->whereIn($value['key'], $value['value']);
                }
            });

        if ($group_by) {
            $queryBuilder = $queryBuilder
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
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

    /**
     * @param $arrData
     * @param $labels
     * @return array
     */
    public function fillEmptyResults($arrData , $labels) {
        $results = [];
        foreach($labels as $label) {
            if (in_array($label, array_column($arrData, 'date'))) {
                $index = array_search($label, array_column($arrData, 'date'));
                array_push($results, $arrData[$index]['total']);
            } else {
                array_push($results, null);
            }
        }
        
        return $results;
    }

    /**
     * @param $arrData
     * @param $labels
     * @return array
     */
    public function fillZeroResults($arrData , $labels) {
        $results = [];
        foreach($labels as $label) {
            if (in_array($label, array_column($arrData, 'date'))) {
                $index = array_search($label, array_column($arrData, 'date'));
                array_push($results, $arrData[$index]['total']);
            } else {
                array_push($results, 0);
            }
        }
        
        return $results;
    }

    public function getAnalyticData() {
        if ($this->params['type'] == self::DOUGHNUT_CHART || $this->params['type'] == self::PIE_CHART) {
            $results = $this->getAnalyticDataNotGroupBy();
        } else if($this->params['type'] == self::SUMMARY_CARD){
            $results = $this->getAnalyticSummaryData();
        } else {
            $results = $this->getAnalyticDataGroupByDate();
        }
        return $results;
    }

    public function getAnalyticSummaryData(){
        $results = $this->getAnalyticDataGroupByDate();
        $sum = $this->summaryAnalyticData( $results['data']);

        $compare_sum = 0;
        if(strlen($this->params['compare']['from']) != 0 && strlen($this->params['compare']['to']) != 0){
            $this->params['from'] = $this->params['compare']['from'];
            $this->params['to'] = $this->params['compare']['to'];

            $results = $this->getAnalyticDataGroupByDate();
            $compare_sum = $this->summaryAnalyticData( $results['data']);
        }

        $results = [];
        $results ['value'] = $sum;
        $results ['diff'] = 0;

        if($compare_sum != 0 && $sum != 0){
            $results ['diff'] = round($sum*100/$compare_sum - 100,3);
        }
            
        return $results;
    }

    public function summaryAnalyticData($arr){
        $sum = 0;
        foreach( $arr as $obj){
            $sum += array_sum($obj);
        }
        return $sum;
    }

    public function getAnalyticDataGroupByDate() {
        $results = [
            'labels' => $this->getPeriodDayArray($this->params['from'], $this->params['to']),
            'data' => []
        ];

        $lines = $this->parseStrToLinesArray($this->params['lines']);
        $queries = [];
        if (isset($this->params['queries'])) {
            $queries = $this->parseStrToQueriesArray($this->params['queries']);
        } 

        if ($this->params['type'] != self::AREA_CHART) {
            foreach($lines as $line) {
                $counts = $this->filterData($line, $queries);
                array_push($results['data'], $this->fillEmptyResults($counts, $results['labels']));
            }
        } else {
            foreach($lines as $line) {
                $counts = $this->filterData($line, $queries);
                array_push($results['data'], $this->fillZeroResults($counts, $results['labels']));
            }
        }

        return $results;
    }

    public function getAnalyticDataNotGroupBy() {
        $results = [
            'labels' => [],
            'data' => []
        ];

        $lines = $this->parseStrToLinesArray($this->params['lines']);

        foreach($lines as $line) {
            array_push($results['labels'], $line['key'] . ':' . $line['value']);
        }

        $queries = [];
        if (isset($this->params['queries'])) {
            $queries = $this->parseStrToQueriesArray($this->params['queries']);
        } 

        foreach($lines as $line) {
            $counts = $this->filterData($line, $queries, false);
            array_push($results['data'], $counts[0]['total']);
        }

        return $results;
    }
}
