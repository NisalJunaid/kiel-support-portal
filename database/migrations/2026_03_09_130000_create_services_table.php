<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('service_type', 120);
            $table->string('status', 80);
            $table->unsignedBigInteger('sla_plan_id')->nullable()->index();
            $table->string('renewal_cycle', 80)->nullable();
            $table->date('start_date')->nullable();
            $table->date('renewal_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['client_company_id', 'status']);
            $table->index(['client_company_id', 'service_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
