<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receiver;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ReceiverController extends Controller
{
    public function index(): JsonResponse
    {
        $receivers = Receiver::all();

        return response()->json($receivers);
    }

    public function show(Receiver $receiver): JsonResponse
    {
        $receiver = Cache::remember(
            "receiver.{$receiver->id}",
            now()->addMinutes(10),
            fn () => $receiver->load('transactions.currency')
        );

        return response()->json($receiver);
    }
}
