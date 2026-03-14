<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'flag' => '🇺🇸', 'is_default' => true],
            ['code' => 'AED', 'name' => 'UAE Dirham', 'flag' => '🇦🇪', 'is_default' => false],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'flag' => '🇨🇦', 'is_default' => false],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency);
        }
    }
}
