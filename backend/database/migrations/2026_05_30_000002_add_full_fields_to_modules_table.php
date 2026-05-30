<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->string('type_ue')->nullable()->after('semestre');          // UEF, UEM, UED, UET
            $table->string('nature')->default('obligatoire')->after('type_ue'); // obligatoire / optionnelle
            $table->integer('coefficient')->default(2)->after('nature');
            $table->integer('vhs')->default(45)->after('coefficient');          // volume horaire semestriel
            $table->boolean('has_cours')->default(true)->after('vhs');
            $table->string('duree_cours')->default('1h30')->after('has_cours');
            $table->boolean('has_td')->default(true)->after('duree_cours');
            $table->string('duree_td')->default('1h30')->after('has_td');
            $table->boolean('has_tp')->default(false)->after('duree_td');
            $table->string('duree_tp')->default('1h30')->after('has_tp');
            $table->integer('pct_examen')->default(60)->after('duree_tp');
            $table->integer('pct_td')->default(40)->after('pct_examen');
            $table->integer('pct_tp')->default(0)->after('pct_td');
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn([
                'type_ue', 'nature', 'coefficient', 'vhs',
                'has_cours', 'duree_cours', 'has_td', 'duree_td', 'has_tp', 'duree_tp',
                'pct_examen', 'pct_td', 'pct_tp',
            ]);
        });
    }
};
