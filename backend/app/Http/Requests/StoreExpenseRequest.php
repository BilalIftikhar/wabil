<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount_pkr' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'date' => ['required', 'date'],
            'payment_method' => ['required', 'in:cash,card,bank,jazzcash,easypaisa'],
            'receipt_image' => ['nullable', 'image', 'max:5120'],
            'is_recurring' => ['boolean'],
            'recurrence' => ['nullable', 'in:daily,weekly,monthly'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
