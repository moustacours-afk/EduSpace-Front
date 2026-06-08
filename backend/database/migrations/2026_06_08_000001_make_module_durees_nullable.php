<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A module session (Cours/TD/TP) can be disabled (has_cours/has_td/has_tp = false),
     * in which case the front-end sends an empty duration — converted to NULL by
     * Laravel's ConvertEmptyStringsToNull middleware. The columns were NOT NULL,
     * which crashed every update of a module with a disabled session.
     */
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->string('duree_cours')->nullable()->default(null)->change();
            $table->string('duree_td')->nullable()->default(null)->change();
            $table->string('duree_tp')->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->string('duree_cours')->default('1h30')->change();
            $table->string('duree_td')->default('1h30')->change();
            $table->string('duree_tp')->default('1h30')->change();
        });
    }
};
