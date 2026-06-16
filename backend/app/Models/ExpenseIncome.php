<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseIncome extends Model
{
    protected $table = 'expense_income';

    protected $fillable = ['admin_user_id', 'source', 'amount_pkr', 'date', 'note'];

    protected $casts = [
        'date' => 'date',
        'amount_pkr' => 'decimal:2',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
