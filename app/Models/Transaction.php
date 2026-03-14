<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'receiver_id', 'currency_id', 'request_id', 'type', 'subtype', 'to', 'amount', 'status',
    ];

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(Receiver::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
