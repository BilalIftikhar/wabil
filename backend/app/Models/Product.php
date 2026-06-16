<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'category_id', 'brand_id', 'description',
        'price_pkr', 'compare_pkr', 'rating', 'status', 'seo_title', 'seo_description',
    ];

    protected $casts = [
        'price_pkr' => 'decimal:2',
        'compare_pkr' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }
}
