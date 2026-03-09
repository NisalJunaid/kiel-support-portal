<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaceholderController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', DashboardController::class)->name('dashboard');

Route::get('/{module}', PlaceholderController::class)
    ->whereIn('module', ['clients', 'contacts', 'assets', 'tickets', 'services', 'reports', 'settings', 'administration'])
    ->name('module.show');
