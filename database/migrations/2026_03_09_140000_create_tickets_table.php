<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('client_company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requester_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('requester_contact_id')->nullable()->constrained('client_contacts')->nullOnDelete();
            $table->foreignId('asset_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->longText('description');
            $table->string('category', 120);
            $table->string('priority', 40);
            $table->unsignedTinyInteger('impact')->nullable();
            $table->unsignedTinyInteger('urgency')->nullable();
            $table->string('status', 40);
            $table->string('source', 80)->default('portal');
            $table->string('assigned_team', 120)->nullable();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('first_response_due_at')->nullable();
            $table->timestamp('resolution_due_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['client_company_id', 'status']);
            $table->index(['priority', 'updated_at']);
        });

        Schema::create('ticket_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year')->unique();
            $table->unsignedInteger('current_value')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_sequences');
        Schema::dropIfExists('tickets');
    }
};
