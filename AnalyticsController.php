<?php

namespace App\Http\Controllers\API;

use App\Business;
use App\Integration;
use App\Transaction;
use App\CustomField;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterAnalytics;
use Illuminate\Http\Request;
use Src\ElasticSearch\ElasticSearch;
use Src\Analytics\TransactionsAnalytics;
use Src\Analytics\CustomFieldsAnalytics;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }


    public function snippet(Request $request, $business_id, ElasticSearch $es)
    {
        $user = $request->user();

        if (Business::where('user_id', $user->id)->exists()) {
            $esIndex = 'transaction_' . $business_id;
            $stats = $es->getIndexStats($esIndex);
            $integrationCount = Integration::nonDeletedIntegrations(['business_id' => $business_id])->count();
            $indexSize = $es->getIndexSize($esIndex, $stats);
            return [
                'transaction_count' => $es->getIndexCount($esIndex),
                'index_size_in_gb' => round($indexSize, 2),
                'integration_count' => $integrationCount
            ];
        }

        abort(403, "This action is unauthorized.");

    }

    /**
     * @param FilterAnalytics $request
     * @return mixed
     */
    public function index(FilterAnalytics $request)
    {
        $params = $request->validated();
        $results = [];

        if ($params['source'] === 'transactions') {
            $analytic = new TransactionsAnalytics(new Transaction(), $params);
            $results = $analytic->getAnalyticData();
        } else if ($params['source'] === 'contacts') {
            $analytic = new CustomFieldsAnalytics(new CustomField(), $params);
            $results = $analytic->getAnalyticData();
        }
        
        return $results;
    } 
}
