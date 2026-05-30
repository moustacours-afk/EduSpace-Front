<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('super_agents', function (Blueprint $table) {
            $table->string('universite')->nullable()->after('departement');
            $table->string('faculte')->nullable()->after('universite');
        });

        Schema::table('agents', function (Blueprint $table) {
            $table->string('universite')->nullable()->after('departement');
            $table->string('faculte')->nullable()->after('universite');
        });
    }

    public function down(): void
    {
        Schema::table('super_agents', function (Blueprint $table) {
            $table->dropColumn(['universite', 'faculte']);
        });
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn(['universite', 'faculte']);
        });
    }
};
