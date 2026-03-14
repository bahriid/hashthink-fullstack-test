<?php

namespace App\Http\Controllers;

use App\Models\Receiver;
use Inertia\Inertia;
use Inertia\Response;

class ReceiverPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('receivers', [
            'receiver' => Receiver::first(),
        ]);
    }
}
