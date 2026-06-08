<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reinscription extends Model
{
    protected $fillable = [
        'etudiant_id', 'annee_universitaire', 'statut', 'statut_paiement',
        'montant', 'documents', 'audit_trail', 'traite_par', 'traite_le',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'audit_trail' => 'array',
            'traite_le' => 'datetime',
        ];
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function traitePar()
    {
        return $this->belongsTo(Agent::class, 'traite_par');
    }
}
