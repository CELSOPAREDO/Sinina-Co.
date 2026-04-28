<?php

use Illuminate\Support\Facades\Route;

// Main admin dashboard entry point
Route::get('/admin/dashboard', function () {
    return view('app');
});

// Main landing page entry point
Route::get('/', function () {
    return view('app');
});

// Catch-all for SPA routing
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
