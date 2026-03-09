<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('asset_id')->constrained()->nullOnDelete();
            $table->foreignId('sla_plan_id')->nullable()->after('assigned_user_id')->constrained('sla_plans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_id');
            $table->dropConstrainedForeignId('sla_plan_id');
        });
    }
};
