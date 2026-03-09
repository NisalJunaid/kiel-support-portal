<?php

use App\Http\Controllers\Administration\ReadinessController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\Administration\SystemReferenceController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ClientCompanyController;
use App\Http\Controllers\ClientContactController;
use App\Http\Controllers\ClientPortal\AssetController as ClientPortalAssetController;
use App\Http\Controllers\ClientPortal\ContactController as ClientPortalContactController;
use App\Http\Controllers\ClientPortal\DashboardController as ClientPortalDashboardController;
use App\Http\Controllers\ClientPortal\TicketController as ClientPortalTicketController;
use App\Http\Controllers\ClientUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Settings\BrandingSettingsController;
use App\Http\Controllers\SlaPlanController;
use App\Http\Controllers\TicketAttachmentController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketMessageController;
use App\Http\Controllers\TicketWorkflowController;
use App\Support\Roles;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    return redirect()->route('home');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/home', function () {
        $user = request()->user();

        if ($user?->hasRole(Roles::CLIENT_USER)) {
            return redirect()->route('portal.dashboard');
        }

        return redirect()->route('dashboard');
    })->name('home');

    Route::middleware('role:super-admin|admin|staff|support-agent|asset-manager')->group(function () {
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
        Route::resource('sla-plans', SlaPlanController::class)->parameters(['sla-plans' => 'sla_plan']);
        Route::resource('tickets', TicketController::class);
        Route::get('/activity', [ActivityController::class, 'index'])
            ->middleware('role:super-admin|admin|staff')
            ->name('activity.index');

        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('tickets/{ticket}/messages', [TicketMessageController::class, 'store'])->name('tickets.messages.store');
        Route::patch('tickets/{ticket}/workflow/assignment', [TicketWorkflowController::class, 'assign'])->name('tickets.workflow.assignment');
        Route::patch('tickets/{ticket}/workflow/status', [TicketWorkflowController::class, 'status'])->name('tickets.workflow.status');
        Route::patch('tickets/{ticket}/workflow/priority', [TicketWorkflowController::class, 'priority'])->name('tickets.workflow.priority');
        Route::post('tickets/{ticket}/workflow/resolve', [TicketWorkflowController::class, 'resolve'])->name('tickets.workflow.resolve');
        Route::post('tickets/{ticket}/workflow/close', [TicketWorkflowController::class, 'close'])->name('tickets.workflow.close');
        Route::post('tickets/{ticket}/workflow/reopen', [TicketWorkflowController::class, 'reopen'])->name('tickets.workflow.reopen');
        Route::get('tickets/{ticket}/attachments/{attachment}', [TicketAttachmentController::class, 'show'])->name('tickets.attachments.show');

        Route::get('/reports', ReportsController::class)
            ->middleware('role:super-admin|admin|staff')
            ->name('reports.index');

        Route::get('/settings/branding', [BrandingSettingsController::class, 'edit'])
            ->middleware('role:super-admin')
            ->name('settings.branding.edit');
        Route::patch('/settings/branding', [BrandingSettingsController::class, 'update'])
            ->middleware('role:super-admin')
            ->name('settings.branding.update');

    });

    Route::middleware('role:client-user')->prefix('portal')->name('portal.')->group(function () {
        Route::get('/dashboard', ClientPortalDashboardController::class)->name('dashboard');
        Route::get('/tickets', [ClientPortalTicketController::class, 'index'])->name('tickets.index');
        Route::get('/tickets/create', [ClientPortalTicketController::class, 'create'])->name('tickets.create');
        Route::post('/tickets', [ClientPortalTicketController::class, 'store'])->name('tickets.store');
        Route::get('/tickets/{ticket}', [ClientPortalTicketController::class, 'show'])->name('tickets.show');
        Route::post('/tickets/{ticket}/messages', [TicketMessageController::class, 'store'])->name('tickets.messages.store');
        Route::get('/assets', [ClientPortalAssetController::class, 'index'])->name('assets.index');
        Route::get('/contacts', [ClientPortalContactController::class, 'index'])->name('contacts.index');
    });
});
