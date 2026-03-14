<?php

namespace Database\Factories;

use App\Models\Currency;
use App\Models\Receiver;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TransactionFactory extends Factory
{
    private static array $types = ['Send Money', 'Add money', 'Conversion'];

    private static array $subtypes = ['International', 'Domestic', null];

    private static array $statuses = ['pending', 'approved', 'cancelled', 'rejected', 'success'];

    public function definition(): array
    {
        return [
            'receiver_id' => Receiver::factory(),
            'currency_id' => Currency::factory(),
            'request_id' => strtoupper(Str::random(8)),
            'type' => self::$types[array_rand(self::$types)],
            'subtype' => self::$subtypes[array_rand(self::$subtypes)],
            'to' => 'Test Recipient',
            'amount' => number_format(mt_rand(10000, 10000000) / 100, 2, '.', ''),
            'status' => self::$statuses[array_rand(self::$statuses)],
        ];
    }
}
