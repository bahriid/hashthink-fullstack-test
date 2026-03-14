<?php

namespace App\Jobs;

use App\Events\NewTransactionCreated;
use App\Http\Controllers\Api\TransactionController;
use App\Models\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessNewTransaction implements ShouldQueue
{
    use Queueable;

    public function __construct(public array $transactionData) {}

    public function handle(): void
    {
        $transaction = Transaction::with(['currency', 'receiver'])->find(
            Transaction::create($this->transactionData)->id
        );

        // Invalidate cached pages for this receiver so fresh data is served
        TransactionController::bustReceiverCache($transaction->receiver_id);

        NewTransactionCreated::dispatch($transaction);
    }
}
