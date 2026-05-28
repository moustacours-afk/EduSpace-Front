<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliberations', function (Blueprint $table) {
            $table->id();
            $table->string('filiere');
            $table->string('niveau');
            $table->string('semestre');
            $table->string('annee_universitaire');
            $table->enum('statut', ['en_preparation', 'en_cours', 'terminee'])->default('en_preparation');
            $table->date('date_deliberation')->nullable();
            $table->integer('nb_admis')->default(0);
            $table->integer('nb_ajourne')->default(0);
            $table->integer('nb_rattrapage')->default(0);
            $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliberations');
    }
};
