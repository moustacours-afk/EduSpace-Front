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

            // ── Informations générales ──────────────────────────────────────
            $table->string('nom');
            $table->string('code', 10)->unique()->comment('Ex: UEF111');

            // ── Contexte académique ─────────────────────────────────────────
            $table->unsignedTinyInteger('semestre')->comment('1–6');
            $table->string('niveau')->comment('Ex: L3 — Informatique');

            // ── Unité d\'enseignement ────────────────────────────────────────
            $table->enum('type_ue', ['UEF', 'UEM', 'UED', 'UET']);

            // ── Nature ──────────────────────────────────────────────────────
            $table->enum('nature', ['obligatoire', 'optionnelle'])->default('obligatoire');

            // ── Poids & crédits ─────────────────────────────────────────────
            $table->unsignedTinyInteger('coefficient');
            $table->unsignedTinyInteger('credits');

            // ── Volume horaire ──────────────────────────────────────────────
            $table->unsignedSmallInteger('vhs')->comment('Volume Horaire Semestriel (heures)');

            $table->boolean('has_cours')->default(false);
            $table->string('duree_cours', 10)->nullable()->comment('Ex: 1h30');

            $table->boolean('has_td')->default(false);
            $table->string('duree_td', 10)->nullable();

            $table->boolean('has_tp')->default(false);
            $table->string('duree_tp', 10)->nullable();

            // ── Mode d\'évaluation (%) ───────────────────────────────────────
            $table->unsignedTinyInteger('pct_examen')->default(60);
            $table->unsignedTinyInteger('pct_td')->default(40);
            $table->unsignedTinyInteger('pct_tp')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
