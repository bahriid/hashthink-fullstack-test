<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Jobs\ProcessNewTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        ProcessNewTransaction::dispatch([
            'receiver_id' => $request->integer('receiver_id'),
            'currency_id' => $request->integer('currency_id'),
            'request_id' => strtoupper(Str::random(8)),
            'type' => $request->string('type'),
            'subtype' => $request->input('subtype'),
            'to' => $request->string('to'),
            'amount' => $request->input('amount'),
            'status' => 'pending',
        ]);

        return back();
    }
}
