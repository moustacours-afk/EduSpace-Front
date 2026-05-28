<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('filiere');
            $table->string('niveau');
            $table->string('groupe');
            $table->string('section')->nullable();
            $table->string('departement')->nullable();
            $table->string('universite')->nullable();
            $table->string('annee_universitaire')->default('2024-2025');
            $table->date('date_naissance')->nullable();
            $table->string('wilaya')->nullable();
            $table->enum('statut_compte', ['actif', 'suspendu', 'archive'])->default('actif');
            $table->enum('statut_reinscription', ['valide', 'en_attente', 'rejete', 'incomplet'])->default('en_attente');
            $table->enum('statut_paiement', ['paye', 'non_paye'])->default('non_paye');
            $table->decimal('montant_paye', 8, 2)->default(0);
            $table->string('methode_payment')->nullable();
            $table->string('reference_payment')->nullable();
            $table->date('date_payment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};
