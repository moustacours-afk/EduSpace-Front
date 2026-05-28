<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    protected $fillable = [
        'module_id', 'enseignant_id', 'salle_id', 'type',
        'jour', 'heure_debut', 'heure_fin', 'groupes', 'statut',
        'filiere', 'niveau', 'semestre',
    ];

    protected function casts(): array
    {
        return ['groupes' => 'array'];
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}
