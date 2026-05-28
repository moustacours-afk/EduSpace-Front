<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('contenu');
            $table->string('categorie')->nullable();
            $table->string('couleur')->nullable();
            $table->string('icon')->nullable();
            $table->enum('audience', ['all', 'etudiant', 'enseignant', 'agent'])->default('all');
            $table->string('filiere')->nullable();
            $table->string('niveau')->nullable();
            $table->foreignId('auteur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date_publication')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
