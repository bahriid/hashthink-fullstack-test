<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReceiverFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'type' => fake()->randomElement(['individual', 'business']),
            'country' => fake()->country(),
            'bank_name' => fake()->randomElement(['Bank of America', 'Chase', 'HSBC', 'Citibank', 'Wells Fargo']),
            'branch_name' => fake()->streetName().' Branch',
            'swift_bic' => strtoupper(fake()->bothify('????####')),
            'account_numbers' => [
                ['currency' => 'USD', 'number' => fake()->numerify('##############')],
                ['currency' => 'AED', 'number' => fake()->numerify('##############')],
                ['currency' => 'CAD', 'number' => fake()->numerify('##############')],
            ],
        ];
    }
}
