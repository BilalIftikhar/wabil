<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /** Public catalogue with filters, sort & pagination. */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['category', 'images'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas('category', fn ($c) => $c->where('slug', $request->category)))
            ->when($request->filled('min'), fn ($q) => $q->where('price_pkr', '>=', $request->min))
            ->when($request->filled('max'), fn ($q) => $q->where('price_pkr', '<=', $request->max))
            ->when($request->filled('rating'), fn ($q) => $q->where('rating', '>=', $request->rating))
            ->when($request->filled('q'), fn ($q) => $q->where('name', 'ilike', "%{$request->q}%"));

        match ($request->get('sort')) {
            'price-asc' => $query->orderBy('price_pkr'),
            'price-desc' => $query->orderByDesc('price_pkr'),
            'rating' => $query->orderByDesc('rating'),
            default => $query->latest(),
        };

        return ProductResource::collection($query->paginate($request->get('per_page', 12)))->response();
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'images', 'variants', 'reviews'])
            ->where('slug', $slug)
            ->firstOrFail();

        return (new ProductResource($product))->response();
    }
}
