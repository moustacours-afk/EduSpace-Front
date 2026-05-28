<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recour extends Model
{
    protected $table = 'recours';

    protected $fillable = [
        'etudiant_id', 'module_id', 'semestre', 'note_type',
        'note_actuelle', 'motif', 'statut', 'note_proposee',
        'commentaire_enseignant', 'enseignant_id', 'agent_id',
        'notifie_etudiant', 'traite_le', 'valide_le',
    ];

    protected function casts(): array
    {
        return [
            'notifie_etudiant' => 'boolean',
            'traite_le' => 'datetime',
            'valide_le' => 'datetime',
        ];
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
