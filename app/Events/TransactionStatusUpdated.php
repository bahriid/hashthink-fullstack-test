<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionStatusUpdated implements ShouldBroadcast
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
        return 'transaction.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->transaction->id,
            'status' => $this->transaction->status,
            'receiver_id' => $this->transaction->receiver_id,
            'currency_id' => $this->transaction->currency_id,
        ];
    }
}
