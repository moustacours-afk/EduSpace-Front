<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nom', 'code', 'semestre', 'niveau', 'type_ue', 'nature',
        'coefficient', 'credits', 'vhs',
        'has_cours', 'duree_cours',
        'has_td',    'duree_td',
        'has_tp',    'duree_tp',
        'pct_examen', 'pct_td', 'pct_tp',
    ];

    protected $casts = [
        'semestre'    => 'integer',
        'coefficient' => 'integer',
        'credits'     => 'integer',
        'vhs'         => 'integer',
        'has_cours'   => 'boolean',
        'has_td'      => 'boolean',
        'has_tp'      => 'boolean',
        'pct_examen'  => 'integer',
        'pct_td'      => 'integer',
        'pct_tp'      => 'integer',
    ];

    // Exam-only when no TD and no TP sessions
    public function getIsExamOnlyAttribute(): bool
    {
        return !$this->has_td && !$this->has_tp;
    }

    // Verify percentages sum to 100 (helper used by controller)
    public function totalPct(): int
    {
        return $this->pct_examen + $this->pct_td + ($this->has_tp ? $this->pct_tp : 0);
    }
}
