<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnseignantPermission extends Model
{
    protected $fillable = [
        'enseignant_id', 'agent_id',
        'peut_saisir_cc', 'peut_saisir_examen',
        'semestre', 'notes_admin',
    ];

    protected $casts = [
        'peut_saisir_cc'      => 'boolean',
        'peut_saisir_examen'  => 'boolean',
    ];

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
