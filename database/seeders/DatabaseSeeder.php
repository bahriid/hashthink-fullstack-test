<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Kasra Nourani',
            'email' => 'kasra@email.com',
        ]);

        $this->call([
            CurrencySeeder::class,
            ReceiverSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
