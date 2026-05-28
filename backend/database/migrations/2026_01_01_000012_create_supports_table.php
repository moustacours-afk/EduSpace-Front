<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->nullOnDelete();
            $table->string('nom');
            $table->enum('type', ['cours', 'td', 'tp', 'corriges', 'autre']);
            $table->enum('format', ['pdf', 'ppt', 'doc', 'zip', 'autre'])->default('pdf');
            $table->string('taille')->nullable();
            $table->string('chemin_fichier')->nullable();
            $table->date('date_upload')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supports');
    }
};
