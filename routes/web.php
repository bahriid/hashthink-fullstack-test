<?php

use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\ReceiverController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReceiverPageController;
use App\Http\Controllers\TransactionController as WebTransactionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('receivers', ReceiverPageController::class)->name('receivers');
    Route::post('transactions', [WebTransactionController::class, 'store'])->name('transactions.store');

    // API routes (auth-protected JSON endpoints)
    Route::prefix('api')->group(function () {
        Route::get('currencies', [CurrencyController::class, 'index'])->name('api.currencies.index');
        Route::get('receivers', [ReceiverController::class, 'index'])->name('api.receivers.index');
        Route::get('receivers/{receiver}', [ReceiverController::class, 'show'])->name('api.receivers.show');
        Route::get('transactions', [TransactionController::class, 'index'])->name('api.transactions.index');
        Route::patch('transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('api.transactions.update-status');
        Route::get('transactions/{transaction}/download', [TransactionController::class, 'download'])->name('api.transactions.download');
    });
});

require __DIR__.'/settings.php';
