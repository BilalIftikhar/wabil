<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'amount_pkr' => (float) $this->amount_pkr,
            'currency' => $this->currency,
            'converted_amount' => $this->converted_amount ? (float) $this->converted_amount : null,
            'exchange_rate' => $this->exchange_rate ? (float) $this->exchange_rate : null,
            'date' => $this->date->toDateString(),
            'payment_method' => $this->payment_method,
            'receipt_image' => $this->receipt_image,
            'is_recurring' => $this->is_recurring,
            'recurrence' => $this->recurrence,
            'tags' => $this->tags ?? [],
            'notes' => $this->notes,
            'category' => [
                'id' => $this->category?->id,
                'name' => $this->category?->name,
                'icon' => $this->category?->icon,
                'color_hex' => $this->category?->color_hex,
                'type' => $this->category?->type,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
