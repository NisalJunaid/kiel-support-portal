<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_companies', function (Blueprint $table) {
            $table->foreignId('sla_plan_id')->nullable()->after('account_manager_id')->constrained('sla_plans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('client_companies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sla_plan_id');
        });
    }
};
