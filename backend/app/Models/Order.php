<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'reference', 'user_id', 'status', 'subtotal_pkr', 'shipping_pkr',
        'discount_pkr', 'total_pkr', 'currency', 'payment_method',
        'payment_status', 'shipping_address', 'coupon_id',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'subtotal_pkr' => 'decimal:2',
        'shipping_pkr' => 'decimal:2',
        'discount_pkr' => 'decimal:2',
        'total_pkr' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
