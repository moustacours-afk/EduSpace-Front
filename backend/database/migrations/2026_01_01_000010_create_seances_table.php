<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->nullOnDelete();
            $table->foreignId('salle_id')->nullable()->constrained('salles')->nullOnDelete();
            $table->enum('type', ['CM', 'TD', 'TP']);
            $table->string('jour');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->json('groupes')->nullable();
            $table->enum('statut', ['normal', 'annule', 'reporte'])->default('normal');
            $table->string('filiere')->nullable();
            $table->string('niveau')->nullable();
            $table->string('semestre')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seances');
    }
};
