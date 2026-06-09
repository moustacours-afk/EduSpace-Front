<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    protected $fillable = [
        'student_id', 'module_id', 'academic_year',
        'status', 'original_grade', 'retake_grade',
    ];

    protected function casts(): array
    {
        return [
            'status'         => 'boolean',
            'original_grade' => 'float',
            'retake_grade'   => 'float',
        ];
    }

    /** The student (étudiant) who carries the debt. */
    public function student()
    {
        return $this->belongsTo(Etudiant::class, 'student_id');
    }

    /** The failed module that must be re-sat. */
    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
    }
}
