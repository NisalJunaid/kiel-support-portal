<?php

use App\Http\Controllers\Administration\ReadinessController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\Administration\SystemReferenceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ClientCompanyController;
use App\Http\Controllers\ClientContactController;
use App\Http\Controllers\ClientUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaceholderController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TicketController;
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

    Route::resource('clients', ClientCompanyController::class)->parameters(['clients' => 'client']);

    Route::patch('contacts/{contact}/toggle-active', [ClientContactController::class, 'toggleActive'])->name('contacts.toggle-active');
    Route::resource('contacts', ClientContactController::class);

    Route::resource('client-users', ClientUserController::class)
        ->parameters(['client-users' => 'clientUser']);

    Route::resource('assets', AssetController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('tickets', TicketController::class);

    Route::get('/{module}', PlaceholderController::class)
        ->whereIn('module', ['reports', 'settings'])
        ->name('module.show');
});
