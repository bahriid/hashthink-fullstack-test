<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ReceiverFactory extends Factory
{
    private static int $counter = 0;

    private static array $names = [
        'Alice Johnson', 'Bob Martinez', 'Carol Williams', 'David Brown',
        'Emma Davis', 'Frank Wilson', 'Grace Taylor', 'Henry Anderson',
        'Isabella Thomas', 'James Jackson',
    ];

    private static array $banks = [
        'Bank of America', 'Chase', 'HSBC', 'Citibank', 'Wells Fargo',
        'Barclays', 'Deutsche Bank', 'BNP Paribas', 'Standard Chartered',
    ];

    private static array $countries = [
        'United States', 'United Kingdom', 'Canada', 'Australia',
        'Germany', 'France', 'Singapore', 'UAE', 'Japan',
    ];

    public function definition(): array
    {
        $index = self::$counter++ % count(self::$names);
        $name = self::$names[$index];
        $slug = strtolower(str_replace(' ', '.', $name));

        return [
            'name' => $name,
            'email' => $slug.'_'.Str::random(4).'@example.com',
            'type' => $index % 3 === 0 ? 'business' : 'individual',
            'country' => self::$countries[$index % count(self::$countries)],
            'bank_name' => self::$banks[$index % count(self::$banks)],
            'branch_name' => 'Main Street Branch',
            'swift_bic' => strtoupper(Str::random(4)).mt_rand(1000, 9999),
            'account_numbers' => [
                ['currency' => 'USD', 'number' => (string) mt_rand(1000000000000, 9999999999999)],
                ['currency' => 'AED', 'number' => (string) mt_rand(1000000000000, 9999999999999)],
                ['currency' => 'CAD', 'number' => (string) mt_rand(1000000000000, 9999999999999)],
            ],
        ];
    }
}
