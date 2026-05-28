<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reinscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained()->cascadeOnDelete();
            $table->string('annee_universitaire');
            $table->enum('statut', ['valide', 'en_attente', 'rejete', 'incomplet'])->default('en_attente');
            $table->enum('statut_paiement', ['paye', 'non_paye'])->default('non_paye');
            $table->decimal('montant', 8, 2)->default(2500);
            $table->string('methode_payment')->nullable();
            $table->string('reference_payment')->nullable();
            $table->date('date_payment')->nullable();
            $table->json('documents')->nullable();
            $table->json('audit_trail')->nullable();
            $table->foreignId('traite_par')->nullable()->constrained('agents')->nullOnDelete();
            $table->timestamp('traite_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reinscriptions');
    }
};
