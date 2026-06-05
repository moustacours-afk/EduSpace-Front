<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $fillable = ['user_id', 'matricule', 'nom', 'prenom', 'grade', 'departement', 'statut_compte', 'modules_details'];

    protected $casts = ['modules_details' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'enseignant_module')
            ->withPivot('role', 'responsable', 'groupes')
            ->withTimestamps();
    }

    public function modulesResponsable()
    {
        return $this->hasMany(Module::class);
    }

    public function soumissionsNotes()
    {
        return $this->hasMany(SoumissionNote::class);
    }

    public function supports()
    {
        return $this->hasMany(Support::class);
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }

    public function recours()
    {
        return $this->hasMany(Recour::class);
    }

    public function permission()
    {
        return $this->hasOne(EnseignantPermission::class);
    }
}
