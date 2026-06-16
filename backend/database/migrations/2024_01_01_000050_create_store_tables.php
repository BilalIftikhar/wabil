<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WABIL — core storefront schema (catalogue, cart, orders, coupons, reviews).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('price_pkr', 12, 2);
            $table->decimal('compare_pkr', 12, 2)->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->enum('status', ['active', 'draft'])->default('draft');
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->string('sku')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->decimal('price_delta_pkr', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('subtotal_pkr', 12, 2);
            $table->decimal('shipping_pkr', 12, 2)->default(0);
            $table->decimal('discount_pkr', 12, 2)->default(0);
            $table->decimal('total_pkr', 12, 2);
            $table->string('currency', 3)->default('PKR');
            $table->enum('payment_method', ['card', 'jazzcash', 'easypaisa', 'cod'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->json('shipping_address');
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('variant')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('price_pkr', 12, 2);
            $table->timestamps();
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('type', ['percent', 'fixed']);
            $table->decimal('value', 12, 2);
            $table->date('expires_at')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reply')->nullable();
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price_pkr', 12, 2)->default(0);
            $table->string('eta_days')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        foreach ([
            'wishlists', 'shipping_methods', 'reviews', 'coupons',
            'order_status_history', 'order_items', 'orders',
            'product_images', 'product_variants', 'products', 'brands', 'categories',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
