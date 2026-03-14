<?php

namespace Database\Seeders;

use App\Models\Receiver;
use Illuminate\Database\Seeder;

class ReceiverSeeder extends Seeder
{
    private static array $receivers = [
        [
            'name' => 'John Bonham',
            'email' => 'john@email.com',
            'type' => 'individual',
            'country' => 'United States',
            'bank_name' => 'Bank of America',
            'branch_name' => 'Main Street Branch',
            'swift_bic' => 'KJA98127',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '1982631287368'],
                ['currency' => 'AED', 'number' => '1982631287369'],
                ['currency' => 'CAD', 'number' => '1982631287370'],
            ],
        ],
        [
            'name' => 'Alice Johnson',
            'email' => 'alice.johnson@example.com',
            'type' => 'individual',
            'country' => 'United Kingdom',
            'bank_name' => 'Barclays',
            'branch_name' => 'Oxford Street Branch',
            'swift_bic' => 'BARCGB22',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '2001234567890'],
                ['currency' => 'AED', 'number' => '2001234567891'],
                ['currency' => 'CAD', 'number' => '2001234567892'],
            ],
        ],
        [
            'name' => 'Bob Martinez',
            'email' => 'bob.martinez@example.com',
            'type' => 'business',
            'country' => 'Canada',
            'bank_name' => 'Chase',
            'branch_name' => 'Downtown Branch',
            'swift_bic' => 'CHAS2291',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '3001234567890'],
                ['currency' => 'AED', 'number' => '3001234567891'],
                ['currency' => 'CAD', 'number' => '3001234567892'],
            ],
        ],
        [
            'name' => 'Carol Williams',
            'email' => 'carol.williams@example.com',
            'type' => 'individual',
            'country' => 'Australia',
            'bank_name' => 'HSBC',
            'branch_name' => 'Sydney Branch',
            'swift_bic' => 'HSBCAU2S',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '4001234567890'],
                ['currency' => 'AED', 'number' => '4001234567891'],
                ['currency' => 'CAD', 'number' => '4001234567892'],
            ],
        ],
        [
            'name' => 'David Brown',
            'email' => 'david.brown@example.com',
            'type' => 'individual',
            'country' => 'Germany',
            'bank_name' => 'Deutsche Bank',
            'branch_name' => 'Berlin Branch',
            'swift_bic' => 'DEUTDE3B',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '5001234567890'],
                ['currency' => 'AED', 'number' => '5001234567891'],
                ['currency' => 'CAD', 'number' => '5001234567892'],
            ],
        ],
        [
            'name' => 'Emma Davis',
            'email' => 'emma.davis@example.com',
            'type' => 'business',
            'country' => 'France',
            'bank_name' => 'BNP Paribas',
            'branch_name' => 'Paris Branch',
            'swift_bic' => 'BNPAFRPP',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '6001234567890'],
                ['currency' => 'AED', 'number' => '6001234567891'],
                ['currency' => 'CAD', 'number' => '6001234567892'],
            ],
        ],
        [
            'name' => 'Frank Wilson',
            'email' => 'frank.wilson@example.com',
            'type' => 'individual',
            'country' => 'Singapore',
            'bank_name' => 'Standard Chartered',
            'branch_name' => 'Orchard Road Branch',
            'swift_bic' => 'SCBLSG22',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '7001234567890'],
                ['currency' => 'AED', 'number' => '7001234567891'],
                ['currency' => 'CAD', 'number' => '7001234567892'],
            ],
        ],
        [
            'name' => 'Grace Taylor',
            'email' => 'grace.taylor@example.com',
            'type' => 'individual',
            'country' => 'UAE',
            'bank_name' => 'Citibank',
            'branch_name' => 'Dubai Branch',
            'swift_bic' => 'CITIAEADXXX',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '8001234567890'],
                ['currency' => 'AED', 'number' => '8001234567891'],
                ['currency' => 'CAD', 'number' => '8001234567892'],
            ],
        ],
        [
            'name' => 'Henry Anderson',
            'email' => 'henry.anderson@example.com',
            'type' => 'business',
            'country' => 'Japan',
            'bank_name' => 'Wells Fargo',
            'branch_name' => 'Tokyo Branch',
            'swift_bic' => 'WFBIUS6W',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '9001234567890'],
                ['currency' => 'AED', 'number' => '9001234567891'],
                ['currency' => 'CAD', 'number' => '9001234567892'],
            ],
        ],
        [
            'name' => 'Isabella Thomas',
            'email' => 'isabella.thomas@example.com',
            'type' => 'individual',
            'country' => 'United States',
            'bank_name' => 'Bank of America',
            'branch_name' => 'Beverly Hills Branch',
            'swift_bic' => 'BOFAUS3N',
            'account_numbers' => [
                ['currency' => 'USD', 'number' => '1101234567890'],
                ['currency' => 'AED', 'number' => '1101234567891'],
                ['currency' => 'CAD', 'number' => '1101234567892'],
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::$receivers as $data) {
            Receiver::firstOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
