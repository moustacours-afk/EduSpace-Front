<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deliberation extends Model
{
    protected $fillable = [
        'filiere', 'niveau', 'semestre', 'annee_universitaire',
        'statut', 'date_deliberation', 'nb_admis', 'nb_ajourne', 'nb_rattrapage', 'agent_id',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
