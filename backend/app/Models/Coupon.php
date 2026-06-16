<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value', 'expires_at', 'usage_limit', 'used_count', 'active'];

    protected $casts = [
        'expires_at' => 'date',
        'value' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function isValid(): bool
    {
        return $this->active
            && (! $this->expires_at || $this->expires_at->isFuture())
            && (! $this->usage_limit || $this->used_count < $this->usage_limit);
    }
}
