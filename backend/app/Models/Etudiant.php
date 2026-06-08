<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $fillable = [
        'user_id', 'matricule', 'nom', 'prenom', 'filiere', 'niveau', 'groupe',
        'section', 'departement', 'universite', 'annee_universitaire',
        'date_naissance', 'wilaya', 'statut_compte', 'statut_paiement',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function recours()
    {
        return $this->hasMany(Recour::class);
    }

    public function reinscriptions()
    {
        return $this->hasMany(Reinscription::class);
    }
}
