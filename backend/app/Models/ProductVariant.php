<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'size', 'color', 'sku', 'stock', 'price_delta_pkr'];

    protected $casts = ['stock' => 'integer', 'price_delta_pkr' => 'decimal:2'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
