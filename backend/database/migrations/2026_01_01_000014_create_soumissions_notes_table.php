<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soumissions_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enseignant_id')->constrained('enseignants')->cascadeOnDelete();
            $table->string('filiere');
            $table->string('niveau');
            $table->string('groupe');
            $table->string('semestre');
            $table->enum('type', ['Examen Final', 'Contrôle 1', 'Contrôle 2', 'TP Final', 'CC+Examen'])->default('CC+Examen');
            $table->integer('nb_etudiants')->default(0);
            $table->enum('statut', ['en_attente', 'soumis', 'valide', 'publie'])->default('en_attente');
            $table->boolean('notes_soumises')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->date('date_depot')->nullable();
            $table->foreignId('valide_par')->nullable()->constrained('agents')->nullOnDelete();
            $table->timestamp('valide_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soumissions_notes');
    }
};
