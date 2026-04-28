<?php

use Illuminate\Support\Facades\Route;

// Main admin dashboard entry point
Route::get('/admin/dashboard', function () {
    return view('app');
});

// Redirect root to admin dashboard
Route::get('/', function () {
    return redirect('/admin/dashboard');
});

// Catch-all for SPA routing
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
