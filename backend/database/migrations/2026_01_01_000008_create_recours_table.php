<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('semestre');
            $table->enum('note_type', ['exam', 'controle', 'tp', 'generale']);
            $table->decimal('note_actuelle', 5, 2);
            $table->text('motif');
            $table->enum('statut', ['en_attente', 'accepte', 'refuse', 'valide_agent'])->default('en_attente');
            $table->decimal('note_proposee', 5, 2)->nullable();
            $table->text('commentaire_enseignant')->nullable();
            $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->boolean('notifie_etudiant')->default(false);
            $table->timestamp('traite_le')->nullable();
            $table->timestamp('valide_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recours');
    }
};
