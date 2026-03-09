<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->foreignId('asset_type_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('asset_code')->unique();
            $table->string('service_category')->nullable();
            $table->string('status');
            $table->string('environment')->nullable();
            $table->string('criticality');
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('start_date')->nullable();
            $table->date('renewal_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('vendor')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['client_company_id', 'status']);
            $table->index(['asset_type_id', 'criticality']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
