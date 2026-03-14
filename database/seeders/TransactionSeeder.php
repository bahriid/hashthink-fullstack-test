<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\Receiver;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    private static array $types = [
        ['type' => 'Send Money', 'subtype' => 'International'],
        ['type' => 'Send Money', 'subtype' => 'Domestic'],
        ['type' => 'Add money', 'subtype' => null],
        ['type' => 'Conversion', 'subtype' => null],
    ];

    private static array $statuses = ['pending', 'approved', 'success', 'cancelled', 'rejected'];

    public function run(): void
    {
        $receivers = Receiver::all();
        $currencies = Currency::all()->keyBy('code');

        foreach ($receivers as $receiver) {
            foreach ($currencies as $currency) {
                // Skip if this receiver+currency combo already has transactions
                if (Transaction::where('receiver_id', $receiver->id)
                    ->where('currency_id', $currency->id)
                    ->exists()) {
                    continue;
                }

                $count = mt_rand(3, 8);
                for ($i = 0; $i < $count; $i++) {
                    $typeData = self::$types[array_rand(self::$types)];
                    $status = self::$statuses[array_rand(self::$statuses)];
                    $amount = number_format(mt_rand(50000, 8000000) / 100, 2, '.', '');
                    $daysAgo = mt_rand(0, 180);
                    $secondsAgo = mt_rand(0, 86400);

                    Transaction::create([
                        'receiver_id' => $receiver->id,
                        'currency_id' => $currency->id,
                        'request_id' => strtoupper(Str::random(8)),
                        'type' => $typeData['type'],
                        'subtype' => $typeData['subtype'],
                        'to' => $receiver->name,
                        'amount' => $amount,
                        'status' => $status,
                        'created_at' => now()->subDays($daysAgo)->subSeconds($secondsAgo),
                    ]);
                }
            }
        }
    }
}
