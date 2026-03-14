<?php

namespace Database\Factories;

use App\Models\Currency;
use App\Models\Receiver;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'receiver_id' => Receiver::factory(),
            'currency_id' => Currency::factory(),
            'request_id' => strtoupper(Str::random(8)),
            'type' => fake()->randomElement(['Send Money', 'Add money', 'Conversion']),
            'subtype' => fake()->randomElement(['International', 'Domestic', null]),
            'to' => fake()->name(),
            'amount' => fake()->randomFloat(2, 100, 100000),
            'status' => fake()->randomElement(['pending', 'approved', 'cancelled', 'rejected', 'success']),
        ];
    }
}
