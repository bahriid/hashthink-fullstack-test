<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $transactions = Transaction::with(['currency', 'receiver'])
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
        ]);
    }
}
