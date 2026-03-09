<?php

use App\Http\Controllers\Administration\ReadinessController;
use App\Http\Controllers\Administration\SystemReferenceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaceholderController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? redirect()->route('dashboard') : redirect()->route('login'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/administration', ReadinessController::class)
        ->middleware('role:super-admin|admin|staff')
        ->name('administration.readiness');

    Route::get('/administration/system-reference', SystemReferenceController::class)
        ->middleware('role:super-admin|admin|staff')
        ->name('administration.system-reference');

    Route::get('/{module}', PlaceholderController::class)
        ->whereIn('module', ['clients', 'contacts', 'assets', 'tickets', 'services', 'reports', 'settings'])
        ->name('module.show');
});
