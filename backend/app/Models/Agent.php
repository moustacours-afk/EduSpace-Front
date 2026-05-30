<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = ['user_id', 'nom', 'prenom', 'role', 'departement', 'statut', 'universite', 'faculte'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliberations()
    {
        return $this->hasMany(Deliberation::class);
    }
}
