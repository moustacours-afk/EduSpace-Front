<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('super_agents', function (Blueprint $table) {
            $table->enum('statut', ['actif', 'suspendu'])->default('actif')->after('faculte');
        });
    }

    public function down(): void
    {
        Schema::table('super_agents', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};
