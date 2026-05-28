<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = [
        'etudiant_id', 'module_id', 'semestre',
        'note_exam', 'note_controle', 'note_tp', 'moyenne',
        'credit_acquis', 'situation', 'absent', 'statut',
    ];

    protected function casts(): array
    {
        return ['absent' => 'boolean'];
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
