<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CurrencyController extends Controller
{
    public function index(): JsonResponse
    {
        $currencies = Cache::remember('currencies', now()->addHour(), fn () => Currency::all());

        return response()->json($currencies);
    }
}
