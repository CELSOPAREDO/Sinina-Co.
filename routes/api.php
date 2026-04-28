<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\NotificationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/products',             [ProductController::class, 'index']);
Route::get('/products/{id}',        [ProductController::class, 'show']);
Route::get('/categories',           [ProductController::class, 'categories']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/settings',             [SettingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read',  [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all',   [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}',     [NotificationController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/user/profile',      [AuthController::class, 'updateProfile']);
    Route::delete('/user/account',   [AuthController::class, 'deleteAccount']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);

    Route::get('/addresses',          [AddressController::class, 'index']);
    Route::post('/addresses',         [AddressController::class, 'store']);
    Route::put('/addresses/{id}',      [AddressController::class, 'update']);
    Route::delete('/addresses/{id}',   [AddressController::class, 'destroy']);
    Route::post('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    Route::get('/cart',               [CartController::class, 'index']);
    Route::post('/cart/add',          [CartController::class, 'add']);
    Route::put('/cart/item/{id}',     [CartController::class, 'updateItem']);
    Route::delete('/cart/item/{id}',  [CartController::class, 'removeItem']);

    Route::post('/checkout',         [OrderController::class, 'checkout']);
    Route::get('/orders',            [OrderController::class, 'index']);
    Route::get('/orders/{id}',       [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    Route::post('/orders/{id}/update-receipt', [OrderController::class, 'updateReceipt']);

    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    Route::middleware('auth:sanctum')->prefix('admin')->middleware('admin')->group(function () {
        // User management
        Route::get('/users',               [AdminController::class, 'users']);
        Route::post('/users',              [AdminController::class, 'createUser']);
        Route::put('/users/{id}',          [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}',       [AdminController::class, 'deleteUser']);

        // Category management
        Route::get('/categories',          [AdminController::class, 'categories']);
        Route::post('/categories',         [AdminController::class, 'createCategory']);
        Route::put('/categories/{id}',     [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}',  [AdminController::class, 'deleteCategory']);

        // Product management (formerly seller feature)
        Route::get('/products',            [AdminController::class, 'products']);
        Route::post('/products',           [AdminController::class, 'createProduct']);
        Route::put('/products/{id}',       [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}',    [AdminController::class, 'deleteProduct']);

        // Order management (formerly seller feature)
        Route::get('/orders',              [AdminController::class, 'orders']);
        Route::put('/orders/{id}/status',  [AdminController::class, 'updateOrderStatus']);

        // Reports
        Route::get('/reports',             [AdminController::class, 'reports']);

        // Settings
        Route::post('/settings',           [SettingController::class, 'update']);

        // Dashboard Analytics
        Route::get('/dashboard/stats',       [DashboardController::class, 'getStats']);
        Route::get('/dashboard/analytics',   [DashboardController::class, 'getSalesAnalytics']);
        Route::get('/dashboard/recent-orders', [DashboardController::class, 'getRecentOrders']);
        Route::get('/dashboard/top-selling', [DashboardController::class, 'getTopSelling']);
        Route::get('/dashboard/low-stock',   [DashboardController::class, 'getLowStock']);
    });
});
