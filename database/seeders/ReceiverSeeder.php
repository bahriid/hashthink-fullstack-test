<?php

namespace Database\Seeders;

use App\Models\Receiver;
use Illuminate\Database\Seeder;

class ReceiverSeeder extends Seeder
{
    public function run(): void
    {
        Receiver::create([
            'name' => 'John Bonham',
            'email' => 'john@email.com',
            'type' => 'individual',
            'country' => 'United States',
            'bank_name' => 'Bank of America',
            'branch_name' => 'Main Street Branch',
            'swift_bic' => 'KJA98127',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '1982631287368'],
                ['currency' => 'AED', 'number' => '1982631287368'],
                ['currency' => 'CAD', 'number' => '1982631287368'],
            ],
        ]);

        Receiver::factory(9)->create();
    }
}
