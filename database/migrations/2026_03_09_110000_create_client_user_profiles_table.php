<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('client_contacts')->nullOnDelete();
            $table->string('role_label');
            $table->boolean('can_view_all_company_tickets')->default(false);
            $table->boolean('can_create_tickets')->default(true);
            $table->boolean('can_view_assets')->default(true);
            $table->boolean('can_manage_contacts')->default(false);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_user_profiles');
    }
};
