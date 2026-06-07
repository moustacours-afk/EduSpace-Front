<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A module code (e.g. "UEF111") follows the LMD canevas of a single
     * (filière, niveau) programme, so the same code legitimately exists in
     * different programmes. Replace the global unique on `code` with a
     * composite unique scoped to (filiere, niveau, code).
     */
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropUnique('modules_code_unique');
            $table->unique(['filiere', 'niveau', 'code'], 'modules_filiere_niveau_code_unique');
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropUnique('modules_filiere_niveau_code_unique');
            $table->unique('code', 'modules_code_unique');
        });
    }
};
