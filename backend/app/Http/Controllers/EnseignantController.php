<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Etudiant;
use App\Models\Module;
use App\Models\Note;
use App\Models\Notification;
use App\Models\Recour;
use App\Models\SoumissionNote;
use App\Models\Support;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EnseignantController extends Controller
{
    private function enseignant(Request $request)
    {
        return $request->user()->enseignant;
    }

    public function profile(Request $request)
    {
        $e = $this->enseignant($request);
        $modules = $e->modules()->get()->map(fn ($m) => $m->intitule);
        return response()->json([
            'id' => $e->id,
            'nom' => $e->nom,
            'prenom' => $e->prenom,
            'email' => $request->user()->email,
            'grade' => $e->grade,
            'departement' => $e->departement,
            'modules' => $modules,
        ]);
    }

    public function modules(Request $request)
    {
        $e = $this->enseignant($request);
        $assignments = $e->modules()->get()->map(fn ($m) => [
            'id'          => $m->id,
            'key'         => $m->pivot->responsable ? 'resp-' . $m->id : 'tp-' . $m->id,
            'intitule'    => $m->intitule,
            'niveau'      => $m->niveau,
            'semestre'    => $m->semestre,
            'responsable' => (bool) $m->pivot->responsable,
            'role'        => $m->pivot->role,
            'groupes'     => $m->pivot->groupes ? json_decode($m->pivot->groupes, true) : [],
        ]);
        return response()->json($assignments);
    }

    public function mySupports(Request $request)
    {
        $e = $this->enseignant($request);
        return response()->json(
            Support::with('module')->where('enseignant_id', $e->id)
                ->orderByDesc('date_upload')->get()->map(fn ($s) => [
                    'id'         => $s->id,
                    'moduleId'   => $s->module_id,
                    'module'     => $s->module->intitule,
                    'nom'        => $s->nom,
                    'type'       => $s->type,
                    'format'     => $s->format,
                    'taille'     => $s->taille,
                    'uploadDate' => $s->date_upload,
                ])
        );
    }

    public function deleteSupport(Request $request, int $id)
    {
        $e = $this->enseignant($request);
        $support = Support::where('enseignant_id', $e->id)->findOrFail($id);
        if ($support->chemin_fichier) {
            Storage::disk('public')->delete($support->chemin_fichier);
        }
        $support->delete();
        return response()->json(['ok' => true]);
    }

    public function storeAnnonce(Request $request)
    {
        $e = $this->enseignant($request);
        $request->validate(['titre' => 'required|string', 'contenu' => 'required|string']);
        $annonce = Annonce::create([
            'titre'            => $request->titre,
            'contenu'          => $request->contenu,
            'categorie'        => $request->categorie ?? 'Pédagogique',
            'audience'         => 'etudiant',
            'filiere'          => $e->departement,
            'auteur_id'        => $request->user()->id,
            'date_publication' => now()->toDateString(),
        ]);
        return response()->json($annonce, 201);
    }

    public function submitGrades(Request $request)
    {
        $e = $this->enseignant($request);
        $request->validate([
            'module_id'           => 'required|exists:modules,id',
            'niveau'              => 'required|string',
            'groupe'              => 'required|string',
            'semestre'            => 'required|string',
            'session'             => 'required|in:Session normale,Session rattrapage',
            'students'            => 'required|array',
            'students.*.matricule'=> 'required|string',
            'students.*.noteCC'   => 'nullable|numeric|min:0|max:20',
            'students.*.noteExam' => 'nullable|numeric|min:0|max:20',
            'students.*.noteTP'   => 'nullable|numeric|min:0|max:20',
            'students.*.absent'   => 'boolean',
        ]);

        $module = Module::findOrFail($request->module_id);

        DB::transaction(function () use ($request, $e, $module) {
            $sub = SoumissionNote::firstOrCreate(
                [
                    'module_id'    => $request->module_id,
                    'enseignant_id'=> $e->id,
                    'niveau'       => $request->niveau,
                    'groupe'       => $request->groupe,
                    'semestre'     => $request->semestre,
                ],
                [
                    'filiere'        => $e->departement,
                    'type'           => 'CC+Examen',
                    'nb_etudiants'   => count($request->students),
                    'statut'         => 'en_attente',
                    'notes_soumises' => false,
                ]
            );

            foreach ($request->students as $row) {
                $etudiant = Etudiant::where('matricule', $row['matricule'])->first();
                if (! $etudiant) continue;

                $note = Note::firstOrNew([
                    'etudiant_id' => $etudiant->id,
                    'module_id'   => $request->module_id,
                    'semestre'    => $request->semestre,
                ]);
                $note->absent = $row['absent'] ?? false;

                if ($request->session === 'Session normale') {
                    $note->note_controle = $note->absent ? null : ($row['noteCC'] ?? null);
                    $note->note_tp       = $note->absent ? null : ($row['noteTP'] ?? null);
                    $note->note_exam     = $note->absent ? null : ($row['noteExam'] ?? null);
                } else {
                    $note->note_exam = $note->absent ? null : ($row['noteExam'] ?? null);
                }

                if ($note->note_controle !== null && $note->note_exam !== null) {
                    $moy = ($note->note_controle * 0.4) + ($note->note_exam * 0.6);
                    $note->moyenne   = round($moy, 2);
                    $note->situation = $moy >= 10 ? 'admis' : ($moy >= 8 ? 'rattrapage' : 'ajourne');
                }
                $note->statut = 'soumis';
                $note->save();
            }

            $sub->update([
                'statut'         => 'soumis',
                'notes_soumises' => true,
                'date_depot'     => now()->toDateString(),
                'nb_etudiants'   => count($request->students),
            ]);
        });

        return response()->json(['message' => 'Notes soumises avec succès.']);
    }

    public function students(Request $request)
    {
        $e = $this->enseignant($request);
        $niveau = $request->query('niveau', 'L3');
        $groupe = $request->query('groupe');
        $q = Etudiant::where('niveau', $niveau);
        if ($groupe) {
            $q->where('groupe', $groupe);
        }
        $students = $q->get()->map(fn ($s) => [
            'id' => $s->id,
            'matricule' => $s->matricule,
            'nom' => $s->nom,
            'prenom' => $s->prenom,
            'groupe' => $s->groupe,
        ]);
        return response()->json($students);
    }

    public function soumissionsNotes(Request $request)
    {
        $e = $this->enseignant($request);
        $subs = SoumissionNote::with('module')
            ->where('enseignant_id', $e->id)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'module' => $s->module->intitule,
                'filiere' => $s->filiere,
                'niveau' => $s->niveau,
                'groupe' => $s->groupe,
                'enseignant' => 'Dr. ' . $e->nom,
                'semestre' => $s->semestre,
                'statut' => $s->statut,
                'dateDepot' => $s->date_depot,
                'notesSoumises' => $s->notes_soumises,
                'rejectionReason' => $s->rejection_reason,
                'nbEtudiants' => $s->nb_etudiants,
            ]);
        return response()->json($subs);
    }

    public function soumissionsNotesStudents(Request $request, int $id)
    {
        $e = $this->enseignant($request);
        $sub = SoumissionNote::with('module')->where('enseignant_id', $e->id)->findOrFail($id);

        $notes = Note::with('etudiant')
            ->where('module_id', $sub->module_id)
            ->whereHas('etudiant', fn ($q) => $q->where('niveau', $sub->niveau)->where('groupe', $sub->groupe))
            ->get()
            ->map(fn ($n) => [
                'matricule' => $n->etudiant->matricule,
                'nom' => $n->etudiant->nom,
                'prenom' => $n->etudiant->prenom,
                'noteCC' => $n->note_controle,
                'noteExam' => $n->note_exam,
                'absent' => $n->absent,
            ]);

        return response()->json(['soumission' => $sub, 'students' => $notes]);
    }

    public function soumettrNotes(Request $request, int $id)
    {
        $e = $this->enseignant($request);
        $sub = SoumissionNote::where('enseignant_id', $e->id)->findOrFail($id);

        $request->validate([
            'students' => 'required|array',
            'students.*.matricule' => 'required|string',
            'students.*.noteCC' => 'nullable|numeric|min:0|max:20',
            'students.*.noteExam' => 'nullable|numeric|min:0|max:20',
            'students.*.absent' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $sub) {
            foreach ($request->students as $row) {
                $etudiant = Etudiant::where('matricule', $row['matricule'])->first();
                if (! $etudiant) continue;

                $note = Note::firstOrNew(['etudiant_id' => $etudiant->id, 'module_id' => $sub->module_id, 'semestre' => $sub->semestre]);
                $note->note_controle = $row['noteCC'] ?? null;
                $note->note_exam = $row['noteExam'] ?? null;
                $note->absent = $row['absent'] ?? false;
                if ($note->note_controle !== null && $note->note_exam !== null) {
                    $moy = ($note->note_controle * 0.4) + ($note->note_exam * 0.6);
                    $note->moyenne = round($moy, 2);
                    $note->situation = $moy >= 10 ? 'admis' : ($moy >= 8 ? 'rattrapage' : 'ajourne');
                }
                $note->statut = 'soumis';
                $note->save();
            }
            $sub->update(['statut' => 'soumis', 'notes_soumises' => true, 'date_depot' => now()->toDateString()]);
        });

        return response()->json(['message' => 'Notes soumises avec succès.']);
    }

    public function uploadSupport(Request $request)
    {
        $e = $this->enseignant($request);
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'nom' => 'required|string',
            'type' => 'required|in:cours,td,tp,corriges,autre',
            'format' => 'required|in:pdf,ppt,doc,zip,autre',
            'fichier' => 'nullable|file|max:51200',
        ]);

        $path = null;
        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('supports', 'public');
        }

        $support = Support::create([
            'module_id' => $request->module_id,
            'enseignant_id' => $e->id,
            'nom' => $request->nom,
            'type' => $request->type,
            'format' => $request->format,
            'taille' => $request->hasFile('fichier') ? round($request->file('fichier')->getSize() / 1024, 1) . ' KB' : null,
            'chemin_fichier' => $path,
            'date_upload' => now()->toDateString(),
        ]);

        return response()->json($support, 201);
    }

    public function annonces(Request $request)
    {
        $userId = $request->user()->id;
        $annonces = Annonce::where(function ($q) use ($userId) {
            $q->where('audience', 'all')
              ->orWhere('audience', 'enseignant')
              ->orWhere('auteur_id', $userId); // always show teacher's own announcements
        })->orderByDesc('date_publication')->get();
        return response()->json($annonces);
    }

    public function recours(Request $request)
    {
        $e = $this->enseignant($request);
        $moduleIds = $e->modules()->pluck('modules.id');

        $recours = Recour::with(['etudiant', 'module'])
            ->whereIn('module_id', $moduleIds)
            ->where('statut', 'en_attente')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'etudiant' => $r->etudiant->prenom . ' ' . $r->etudiant->nom,
                'matricule' => $r->etudiant->matricule,
                'module' => $r->module->intitule,
                'semestre' => $r->semestre,
                'noteType' => $r->note_type,
                'noteActuelle' => $r->note_actuelle,
                'motif' => $r->motif,
                'statut' => $r->statut,
                'createdAt' => $r->created_at,
            ]);

        return response()->json($recours);
    }

    public function decidRecours(Request $request, int $id)
    {
        $e = $this->enseignant($request);
        $recour = Recour::whereIn('module_id', $e->modules()->pluck('modules.id'))->findOrFail($id);

        $request->validate([
            'decision' => 'required|in:accepte,refuse',
            'commentaire' => 'nullable|string',
            'note_proposee' => 'nullable|numeric|min:0|max:20',
        ]);

        $recour->update([
            'statut' => $request->decision,
            'enseignant_id' => $e->id,
            'commentaire_enseignant' => $request->commentaire,
            'note_proposee' => $request->decision === 'accepte' ? $request->note_proposee : null,
            'traite_le' => now(),
        ]);

        // Notify student
        $etudiantUserId = $recour->etudiant->user_id;
        Notification::create([
            'user_id' => $etudiantUserId,
            'message' => $request->decision === 'accepte'
                ? "Votre recours pour \"{$recour->module->intitule}\" a été accepté." . ($request->note_proposee ? " Nouvelle note : {$request->note_proposee}/20" : '')
                : "Votre recours pour \"{$recour->module->intitule}\" a été refusé." . ($request->commentaire ? " Motif : {$request->commentaire}" : ''),
            'type' => 'recours',
        ]);

        return response()->json(['message' => 'Décision enregistrée.', 'recour' => $recour]);
    }
}
