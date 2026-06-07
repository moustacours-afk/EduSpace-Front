<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuperAgent extends Model
{
    protected $table = 'super_agents';

    protected $fillable = ['user_id', 'nom', 'prenom', 'role', 'departement', 'universite', 'faculte', 'statut'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
