<?php

namespace Src\Analytics;

use App\Transaction;
use Src\Analytics\Analytics;

class TransactionsAnalytics extends Analytics {

    public function __construct(Transaction $model, $params) {
        $this->dbmodel = $model;
        $this->params = $params;
    }

}
