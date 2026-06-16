<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'admin_user_id', 'expense_category_id', 'title', 'description',
        'amount_pkr', 'currency', 'converted_amount', 'exchange_rate',
        'date', 'payment_method', 'receipt_image', 'is_recurring',
        'recurrence', 'tags', 'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'tags' => 'array',
        'is_recurring' => 'boolean',
        'amount_pkr' => 'decimal:2',
        'converted_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
