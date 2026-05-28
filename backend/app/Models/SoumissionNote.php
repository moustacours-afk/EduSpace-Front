<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoumissionNote extends Model
{
    protected $table = 'soumissions_notes';

    protected $fillable = [
        'module_id', 'enseignant_id', 'filiere', 'niveau', 'groupe',
        'semestre', 'type', 'nb_etudiants', 'statut', 'notes_soumises',
        'rejection_reason', 'date_depot', 'valide_par', 'valide_le',
    ];

    protected function casts(): array
    {
        return [
            'notes_soumises' => 'boolean',
            'valide_le' => 'datetime',
        ];
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function validePar()
    {
        return $this->belongsTo(Agent::class, 'valide_par');
    }
}
