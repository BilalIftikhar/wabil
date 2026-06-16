<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WABIL — Personal finance / expense tracker schema.
 * Lives in the admin panel; scoped per admin_user_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->default('wallet');       // lucide icon name
            $table->string('color_hex', 9)->default('#C9A96E');
            $table->enum('type', ['personal', 'business'])->default('personal');
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('expense_category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount_pkr', 14, 2);
            $table->string('currency', 3)->default('PKR');
            $table->decimal('converted_amount', 14, 2)->nullable();
            $table->decimal('exchange_rate', 14, 6)->nullable();
            $table->date('date');
            $table->enum('payment_method', ['cash', 'card', 'bank', 'jazzcash', 'easypaisa'])->default('cash');
            $table->string('receipt_image')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurrence', ['daily', 'weekly', 'monthly'])->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['admin_user_id', 'date']);
            $table->index('expense_category_id');
        });

        Schema::create('expense_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('expense_category_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month');   // 1-12
            $table->unsignedSmallInteger('year');
            $table->decimal('budget_amount', 14, 2);
            $table->timestamps();

            $table->unique(['admin_user_id', 'expense_category_id', 'month', 'year'], 'budget_unique');
        });

        Schema::create('expense_income', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('source');
            $table->decimal('amount_pkr', 14, 2);
            $table->date('date');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['admin_user_id', 'date']);
        });

        Schema::create('exchange_rate_cache', function (Blueprint $table) {
            $table->id();
            $table->string('base', 3)->default('USD');
            $table->json('rates');
            $table->timestamp('fetched_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rate_cache');
        Schema::dropIfExists('expense_income');
        Schema::dropIfExists('expense_budgets');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
