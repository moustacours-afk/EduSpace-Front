<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Support extends Model
{
    protected $fillable = [
        'module_id', 'enseignant_id', 'nom', 'type', 'format',
        'taille', 'chemin_fichier', 'date_upload',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }
}
