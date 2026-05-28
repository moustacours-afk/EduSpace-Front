<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    protected $fillable = [
        'titre', 'contenu', 'categorie', 'couleur', 'icon',
        'audience', 'filiere', 'niveau', 'auteur_id', 'date_publication',
    ];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }
}
