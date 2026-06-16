<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'price_pkr' => (float) $this->price_pkr,
            'compare_pkr' => $this->compare_pkr ? (float) $this->compare_pkr : null,
            'rating' => (float) $this->rating,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'images' => $this->whenLoaded('images', fn () => $this->images->pluck('url')),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($v) => [
                'size' => $v->size,
                'color' => $v->color,
                'stock' => $v->stock,
            ])),
        ];
    }
}
