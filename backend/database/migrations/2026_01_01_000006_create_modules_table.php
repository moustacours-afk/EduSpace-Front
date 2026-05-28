<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('intitule');
            $table->integer('credits')->default(4);
            $table->string('filiere');
            $table->string('niveau');
            $table->string('semestre');
            $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->nullOnDelete();
            $table->timestamps();
        });

        // pivot: teacher assignments (enseignant <-> module with role)
        Schema::create('enseignant_module', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['cc', 'tp', 'cc+tp'])->default('cc+tp');
            $table->boolean('responsable')->default(false);
            $table->json('groupes')->nullable();
            $table->timestamps();
            $table->unique(['enseignant_id', 'module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignant_module');
        Schema::dropIfExists('modules');
    }
};
