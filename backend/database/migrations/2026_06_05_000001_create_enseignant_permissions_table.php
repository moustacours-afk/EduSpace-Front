<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignant_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('peut_saisir_cc')->default(false);
            $table->boolean('peut_saisir_examen')->default(false);
            $table->string('semestre')->nullable();
            $table->text('notes_admin')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignant_permissions');
    }
};
