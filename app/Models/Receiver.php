<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receiver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'email', 'type', 'country', 'bank_name', 'branch_name', 'swift_bic', 'account_numbers',
    ];

    protected function casts(): array
    {
        return [
            'account_numbers' => 'array',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
