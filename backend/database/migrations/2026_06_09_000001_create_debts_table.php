<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dedicated debt-tracking table. A debt is a module a student failed in a
     * previous academic year and must re-sit. It is intentionally decoupled from
     * the normal `notes` flow: the agent records a `retake_grade` here without
     * touching the original published note.
     */
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('etudiants')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('academic_year');                    // ex. "1ère Année"
            $table->boolean('status')->default(true);           // true = active (dette ouverte), false = soldée
            $table->decimal('original_grade', 5, 2)->nullable(); // moyenne initiale ayant généré la dette
            $table->decimal('retake_grade', 5, 2)->nullable();   // note de rattrapage saisie par l'agent
            $table->timestamps();

            $table->unique(['student_id', 'module_id', 'academic_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
