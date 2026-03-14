<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\Receiver;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $receivers = Receiver::all();
        $currencies = Currency::all()->keyBy('code');

        $types = [
            ['type' => 'Send Money', 'subtype' => 'International'],
            ['type' => 'Send Money', 'subtype' => 'Domestic'],
            ['type' => 'Add money', 'subtype' => null],
            ['type' => 'Conversion', 'subtype' => null],
        ];

        $statuses = ['pending', 'approved', 'success', 'cancelled', 'rejected'];

        foreach ($receivers as $receiver) {
            foreach ($currencies as $currency) {
                $count = rand(3, 8);
                for ($i = 0; $i < $count; $i++) {
                    $typeData = fake()->randomElement($types);
                    Transaction::create([
                        'receiver_id' => $receiver->id,
                        'currency_id' => $currency->id,
                        'request_id' => strtoupper(Str::random(8)),
                        'type' => $typeData['type'],
                        'subtype' => $typeData['subtype'],
                        'to' => $receiver->name,
                        'amount' => fake()->randomFloat(2, 500, 80000),
                        'status' => fake()->randomElement($statuses),
                        'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
                    ]);
                }
            }
        }
    }
}
