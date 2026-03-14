<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewTransactionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Transaction $transaction) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('transactions'),
            new Channel('receiver.'.$this->transaction->receiver_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'transaction.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->transaction->id,
            'receiver_id' => $this->transaction->receiver_id,
            'currency_id' => $this->transaction->currency_id,
            'request_id' => $this->transaction->request_id,
            'type' => $this->transaction->type,
            'subtype' => $this->transaction->subtype,
            'to' => $this->transaction->to,
            'amount' => $this->transaction->amount,
            'status' => $this->transaction->status,
            'created_at' => $this->transaction->created_at,
            'currency' => $this->transaction->currency,
            'receiver' => $this->transaction->receiver,
        ];
    }
}
