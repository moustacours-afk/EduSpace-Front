<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn([
                'statut_reinscription',
                'montant_paye',
                'methode_payment',
                'reference_payment',
                'date_payment',
            ]);
        });

        Schema::table('reinscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'methode_payment',
                'reference_payment',
                'date_payment',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->enum('statut_reinscription', ['valide', 'en_attente', 'rejete', 'incomplet'])->default('en_attente');
            $table->decimal('montant_paye', 8, 2)->default(0);
            $table->string('methode_payment')->nullable();
            $table->string('reference_payment')->nullable();
            $table->date('date_payment')->nullable();
        });

        Schema::table('reinscriptions', function (Blueprint $table) {
            $table->string('methode_payment')->nullable();
            $table->string('reference_payment')->nullable();
            $table->date('date_payment')->nullable();
        });
    }
};
