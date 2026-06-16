<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseBudget extends Model
{
    protected $fillable = [
        'admin_user_id', 'expense_category_id', 'month', 'year', 'budget_amount',
    ];

    protected $casts = [
        'budget_amount' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
}
