<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'code', 'intitule', 'credits', 'filiere', 'niveau', 'semestre', 'enseignant_id',
        'type_ue', 'nature', 'coefficient', 'vhs',
        'has_cours', 'duree_cours', 'has_td', 'duree_td', 'has_tp', 'duree_tp',
        'pct_examen', 'pct_td', 'pct_tp',
    ];

    protected $casts = [
        'has_cours' => 'boolean',
        'has_td'    => 'boolean',
        'has_tp'    => 'boolean',
    ];

    public function enseignantResponsable()
    {
        return $this->belongsTo(Enseignant::class, 'enseignant_id');
    }

    public function enseignants()
    {
        return $this->belongsToMany(Enseignant::class, 'enseignant_module')
            ->withPivot('role', 'responsable', 'groupes')
            ->withTimestamps();
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function recours()
    {
        return $this->hasMany(Recour::class);
    }

    public function supports()
    {
        return $this->hasMany(Support::class);
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }

    public function soumissionsNotes()
    {
        return $this->hasMany(SoumissionNote::class);
    }
}
