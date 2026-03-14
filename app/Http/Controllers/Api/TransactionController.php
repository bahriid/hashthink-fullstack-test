<?php

namespace App\Http\Controllers\Api;

use App\Events\TransactionStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $receiverId = $request->integer('receiver_id');
        $currencyCode = $request->string('currency_code')->toString();
        $page = $request->integer('page', 1);

        $cacheKey = "transactions.r{$receiverId}.c{$currencyCode}.p{$page}";

        $result = Cache::remember($cacheKey, now()->addMinutes(2), function () use ($receiverId, $currencyCode) {
            $query = Transaction::with(['currency', 'receiver'])->latest();

            if ($receiverId) {
                $query->where('receiver_id', $receiverId);
            }

            if ($currencyCode) {
                $query->whereHas('currency', fn ($q) => $q->where('code', $currencyCode));
            }

            return $query->paginate(10);
        });

        return response()->json($result);
    }

    public function updateStatus(Request $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,cancelled,rejected,success'],
        ]);

        $transaction->update($validated);
        $transaction->refresh();

        // Invalidate cached transaction pages for this receiver
        Cache::tags !== null
            ? Cache::tags(['transactions'])->flush()
            : self::bustReceiverCache($transaction->receiver_id);

        TransactionStatusUpdated::dispatch($transaction);

        return response()->json($transaction);
    }

    /**
     * Bust all transaction cache keys for a given receiver across currencies and pages.
     */
    public static function bustReceiverCache(int $receiverId): void
    {
        foreach (['USD', 'AED', 'CAD', ''] as $code) {
            for ($page = 1; $page <= 10; $page++) {
                Cache::forget("transactions.r{$receiverId}.c{$code}.p{$page}");
            }
        }

        Cache::forget("receiver.{$receiverId}");
    }

    public function download(Transaction $transaction): StreamedResponse
    {
        $content = "Transaction Receipt\n";
        $content .= "===================\n";
        $content .= "Request ID: {$transaction->request_id}\n";
        $content .= "Type: {$transaction->type}\n";
        $content .= "To: {$transaction->to}\n";
        $content .= "Amount: {$transaction->amount}\n";
        $content .= "Status: {$transaction->status}\n";
        $content .= "Date: {$transaction->created_at}\n";

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, "transaction-{$transaction->request_id}.txt", [
            'Content-Type' => 'text/plain',
        ]);
    }
}
