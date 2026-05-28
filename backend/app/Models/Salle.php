<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = ['nom', 'capacite', 'type', 'disponible'];

    protected function casts(): array
    {
        return ['disponible' => 'boolean'];
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
