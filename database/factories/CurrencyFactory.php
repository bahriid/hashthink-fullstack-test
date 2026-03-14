<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CurrencyFactory extends Factory
{
    public function definition(): array
    {
        $codes = ['EUR', 'GBP', 'JPY', 'AUD', 'CHF', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK'];

        return [
            'code' => $codes[array_rand($codes)].'_'.Str::random(3),
            'name' => 'Test Currency',
            'flag' => '🏳',
            'is_default' => false,
        ];
    }
}
