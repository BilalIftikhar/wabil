<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WABIL API routes
|--------------------------------------------------------------------------
| Priority: auth -> products -> orders -> expenses.
| Only the expense-tracker slice is fully implemented in this scaffold;
| storefront routes are stubbed below to show the intended surface.
*/

Route::prefix('v1')->group(function () {

    // ---- Public storefront ----
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    // Route::get('categories', [CategoryController::class, 'index']);
    // Route::post('checkout', [CheckoutController::class, 'store']);

    // ---- Auth (Sanctum) ----
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
    });

    // ---- Admin: Personal Expense Tracker ----
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/expenses')->group(function () {
        Route::get('overview', [ExpenseController::class, 'overview']);
        Route::get('/', [ExpenseController::class, 'index']);
        Route::post('/', [ExpenseController::class, 'store']);
        Route::put('{expense}', [ExpenseController::class, 'update']);
        Route::delete('bulk', [ExpenseController::class, 'bulkDestroy']);
        Route::delete('{expense}', [ExpenseController::class, 'destroy']);
    });
});
