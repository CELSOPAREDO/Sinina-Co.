<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\AdminController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/products',             [ProductController::class, 'index']);
Route::get('/products/{id}',        [ProductController::class, 'show']);
Route::get('/categories',           [ProductController::class, 'categories']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    Route::get('/cart',               [CartController::class, 'index']);
    Route::post('/cart/add',          [CartController::class, 'add']);
    Route::put('/cart/item/{id}',     [CartController::class, 'updateItem']);
    Route::delete('/cart/item/{id}',  [CartController::class, 'removeItem']);

    Route::post('/checkout',         [OrderController::class, 'checkout']);
    Route::get('/orders',            [OrderController::class, 'index']);
    Route::get('/orders/{id}',       [OrderController::class, 'show']);

    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    Route::middleware('auth:sanctum')->prefix('seller')->group(function () {
        Route::get('/products',         [SellerController::class, 'products']);
        Route::post('/products',        [ProductController::class, 'store']);
        Route::put('/products/{id}',    [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::get('/orders',           [SellerController::class, 'orders']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::get('/reports',          [SellerController::class, 'reports']);
    });

    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::get('/users',               [AdminController::class, 'users']);
        Route::put('/users/{id}',          [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}',       [AdminController::class, 'deleteUser']);
        Route::get('/categories',          [AdminController::class, 'categories']);
        Route::post('/categories',         [AdminController::class, 'createCategory']);
        Route::delete('/categories/{id}',  [AdminController::class, 'deleteCategory']);
        Route::get('/reports',             [AdminController::class, 'reports']);
    });
});
