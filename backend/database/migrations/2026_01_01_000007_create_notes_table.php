<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('semestre');
            $table->decimal('note_exam', 5, 2)->nullable();
            $table->decimal('note_controle', 5, 2)->nullable();
            $table->decimal('note_tp', 5, 2)->nullable();
            $table->decimal('moyenne', 5, 2)->nullable();
            $table->integer('credit_acquis')->default(0);
            $table->enum('situation', ['admis', 'ajourne', 'rattrapage'])->default('ajourne');
            $table->boolean('absent')->default(false);
            $table->enum('statut', ['en_attente', 'soumis', 'valide', 'publie'])->default('en_attente');
            $table->timestamps();
            $table->unique(['etudiant_id', 'module_id', 'semestre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
