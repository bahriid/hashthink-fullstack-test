<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'receiver_id' => ['required', 'exists:receivers,id'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'type' => ['required', 'in:Send Money,Add money,Conversion'],
            'subtype' => ['nullable', 'in:International,Domestic'],
            'to' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:1'],
        ];
    }
}
