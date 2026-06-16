<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseCategory extends Model
{
    protected $fillable = ['name', 'icon', 'color_hex', 'type'];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(ExpenseBudget::class);
    }
}
