<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Deliberation;
use App\Models\Enseignant;
use App\Models\EnseignantPermission;
use App\Models\Etudiant;
use App\Models\Evenement;
use App\Models\Module;
use App\Models\Note;
use App\Models\Notification;
use App\Models\Reinscription;
use App\Models\Salle;
use App\Models\Seance;
use App\Models\SoumissionNote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    private function agent(Request $request)
    {
        return $request->user()->agent;
    }

    // ─── Students ──────────────────────────────────────────────────────────────

    public function students(Request $request)
    {
        $q = Etudiant::with('user');
        if ($request->has('filiere')) $q->where('filiere', $request->filiere);
        if ($request->has('niveau')) $q->where('niveau', $request->niveau);
        if ($request->has('groupe')) $q->where('groupe', $request->groupe);
        if ($request->has('search')) {
            $s = $request->search;
            $q->where(fn ($qq) => $qq->where('nom', 'like', "%$s%")->orWhere('prenom', 'like', "%$s%")->orWhere('matricule', 'like', "%$s%"));
        }
        return response()->json($q->get()->map(fn ($s) => [
            'id'                  => $s->id,
            'matricule'           => $s->matricule,
            'nom'                 => $s->nom,
            'prenom'              => $s->prenom,
            'filiere'             => $s->filiere,
            'niveau'              => $s->niveau,
            'groupe'              => $s->groupe,
            'date_naissance'      => $s->date_naissance,
            'wilaya'              => $s->wilaya,
            'email'               => $s->user?->email ?? '',
            'initial_password'    => $s->user?->initial_password ?? '',
            'statut_compte'       => $s->statut_compte,
            'statut_reinscription' => $s->statut_reinscription,
        ]));
    }

    public function showStudent(Request $request, int $id)
    {
        $etudiant = Etudiant::with(['reinscriptions'])->findOrFail($id);
        return response()->json($etudiant);
    }

    public function storeStudent(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6',
            'nom'      => 'required|string',
            'prenom'   => 'required|string',
            'filiere'  => 'required|string',
            'niveau'   => 'required|string',
            'groupe'   => 'nullable|string',
        ]);

        $matricule = $request->matricule ?? '2025' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);

        // Auto-generate a unique internal email from the matricule
        $email = $matricule . '@eduspace.local';
        $counter = 1;
        while (User::where('email', $email)->exists()) {
            $email = $matricule . $counter++ . '@eduspace.local';
        }

        $user = User::create(['email' => $email, 'password' => $request->password, 'initial_password' => $request->password, 'role' => 'etudiant']);
        $etudiant = Etudiant::create([
            'user_id'        => $user->id,
            'matricule'      => $matricule,
            'nom'            => $request->nom,
            'prenom'         => $request->prenom,
            'filiere'        => $request->filiere,
            'niveau'         => $request->niveau,
            'groupe'         => $request->groupe ?? 'Groupe 1',
            'date_naissance' => $request->date_naissance,
            'wilaya'         => $request->wilaya,
        ]);

        return response()->json(array_merge($etudiant->toArray(), ['email' => $user->email]), 201);
    }

    public function updateStudent(Request $request, int $id)
    {
        $etudiant = Etudiant::findOrFail($id);
        $etudiant->update($request->only([
            'nom', 'prenom', 'filiere', 'niveau', 'groupe',
            'statut_compte', 'statut_reinscription', 'date_naissance', 'wilaya',
        ]));
        return response()->json($etudiant);
    }

    public function updateStudentAccount(Request $request, int $id)
    {
        $etudiant = Etudiant::with('user')->findOrFail($id);
        $request->validate(['statut_compte' => 'required|in:actif,suspendu,archive']);
        $etudiant->update(['statut_compte' => $request->statut_compte]);
        return response()->json($etudiant);
    }

    // ─── Teachers ──────────────────────────────────────────────────────────────

    public function teachers(Request $request)
    {
        $q = Enseignant::with('modules');
        if ($request->has('search')) {
            $s = $request->search;
            $q->where(fn ($qq) => $qq->where('nom', 'like', "%$s%")->orWhere('prenom', 'like', "%$s%"));
        }
        return response()->json($q->get()->map(fn ($e) => [
            'id' => $e->id,
            'matricule' => $e->matricule,
            'nom' => $e->nom,
            'prenom' => $e->prenom,
            'grade' => $e->grade,
            'departement' => $e->departement,
            'email' => $e->user->email,
            'username' => $e->user->email ? explode('@', $e->user->email)[0] : '',
            'initial_password' => $e->user?->initial_password ?? '',
            'modules' => $e->modules->count(),
            'modulesAssignes' => $e->modules->pluck('intitule'),
            'modulesDetails' => $e->modules_details ?? [],
            'statutCompte' => $e->statut_compte,
        ]));
    }

    public function storeTeacher(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6',
            'nom'      => 'required|string',
            'prenom'   => 'required|string',
        ]);

        // Derive username from provided value or first-initial.lastname
        $username = $request->username
            ?? strtolower(mb_substr($request->prenom, 0, 1) . '.' . $request->nom);

        // Auto-generate a unique internal email from the username
        $email = $username . '@eduspace.local';
        $counter = 1;
        while (User::where('email', $email)->exists()) {
            $email = $username . $counter++ . '@eduspace.local';
        }

        $user = User::create(['email' => $email, 'password' => $request->password, 'initial_password' => $request->password, 'role' => 'enseignant']);
        $ens = Enseignant::create([
            'user_id'     => $user->id,
            'matricule'   => $request->matricule ?? 'ENS' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
            'nom'         => $request->nom,
            'prenom'      => $request->prenom,
            'grade'       => $request->grade,
            'departement' => $request->departement,
        ]);

        return response()->json(array_merge($ens->toArray(), ['username' => $username]), 201);
    }

    public function updateTeacher(Request $request, int $id)
    {
        $ens = Enseignant::findOrFail($id);
        $ens->update($request->only(['nom', 'prenom', 'grade', 'departement', 'statut_compte', 'modules_details']));

        // Sync enseignant_module pivot so the teacher sees their assignments
        if ($request->has('modules_details') && is_array($request->modules_details)) {
            $syncData = [];
            foreach ($request->modules_details as $row) {
                // Prefer explicit moduleId, fall back to name lookup
                $moduleId = $row['moduleId'] ?? null;
                $module   = $moduleId ? Module::find((int) $moduleId) : null;
                if (! $module && ! empty($row['module'])) {
                    $module = Module::where('intitule', $row['module'])->first();
                }
                if (! $module) continue;

                $types  = $row['types'] ?? [];
                $role   = (in_array('CM', $types) && in_array('TP', $types)) ? 'cc+tp'
                        : (in_array('CM', $types) ? 'cc'
                        : (in_array('TP', $types) ? 'tp' : 'cc+tp'));
                $groups = array_values(array_unique(array_merge($row['tdGroups'] ?? [], $row['tpGroups'] ?? [])));
                $syncData[$module->id] = [
                    'role'        => $role,
                    'responsable' => ! empty($row['responsable']),
                    'groupes'     => json_encode($groups),
                ];
            }
            $ens->modules()->sync($syncData);
        }

        return response()->json($ens);
    }

    public function modules(Request $request)
    {
        $q = Module::query();
        if ($request->has('niveau'))   $q->where('niveau', $request->niveau);
        if ($request->has('filiere'))  $q->where('filiere', $request->filiere);
        return response()->json($q->orderBy('intitule')->get()->map(fn ($m) => [
            'id'       => $m->id,
            'intitule' => $m->intitule,
            'niveau'   => $m->niveau,
            'filiere'  => $m->filiere,
            'semestre' => $m->semestre,
        ]));
    }

    // ─── Grade submissions ──────────────────────────────────────────────────────

    public function gradeSubmissions(Request $request)
    {
        $q = SoumissionNote::with(['module', 'enseignant']);
        if ($request->has('statut')) $q->where('statut', $request->statut);
        $submissions = $q->orderByDesc('updated_at')->get()->map(fn ($s) => [
            'id' => $s->id,
            'module' => $s->module->intitule,
            'filiere' => $s->filiere,
            'niveau' => $s->niveau,
            'groupe' => $s->groupe,
            'enseignant' => $s->enseignant ? 'Dr. ' . $s->enseignant->nom : '—',
            'semestre' => $s->semestre,
            'statut' => $s->statut,
            'dateDepot' => $s->date_depot,
            'notesSoumises' => $s->notes_soumises,
            'nbEtudiants' => $s->nb_etudiants,
        ]);
        return response()->json($submissions);
    }

    public function showGradeSubmission(Request $request, int $id)
    {
        $sub = SoumissionNote::with(['module', 'enseignant'])->findOrFail($id);
        $notes = Note::with('etudiant')
            ->where('module_id', $sub->module_id)
            ->where('semestre', $sub->semestre)
            ->whereHas('etudiant', fn ($q) => $q->where('niveau', $sub->niveau)->where('groupe', $sub->groupe))
            ->get()
            ->map(fn ($n) => [
                'matricule' => $n->etudiant->matricule,
                'nom'       => $n->etudiant->nom,
                'prenom'    => $n->etudiant->prenom,
                'noteCC'    => $n->note_controle,
                'noteExam'  => $n->note_exam,
                'absent'    => (bool) $n->absent,
            ]);
        return response()->json([
            'id'          => $sub->id,
            'module'      => $sub->module->intitule,
            'filiere'     => $sub->filiere,
            'niveau'      => $sub->niveau,
            'groupe'      => $sub->groupe,
            'enseignant'  => $sub->enseignant ? 'Dr. ' . $sub->enseignant->nom : '—',
            'semestre'    => $sub->semestre,
            'statut'      => $sub->statut,
            'dateDepot'   => $sub->date_depot,
            'notesSoumises' => $sub->notes_soumises,
            'rejectionReason' => $sub->rejection_reason,
            'students'    => $notes,
        ]);
    }

    public function validateGradeSubmission(Request $request, int $id)
    {
        $agent = $this->agent($request);
        $sub = SoumissionNote::findOrFail($id);
        $sub->update([
            'statut' => 'valide',
            'valide_par' => $agent->id,
            'valide_le' => now(),
        ]);
        Note::where('module_id', $sub->module_id)
            ->where('semestre', $sub->semestre)
            ->whereHas('etudiant', fn ($q) => $q->where('niveau', $sub->niveau)->where('groupe', $sub->groupe))
            ->update(['statut' => 'valide']);
        return response()->json(['message' => 'Notes validées.']);
    }

    public function publishGradeSubmission(Request $request, int $id)
    {
        $sub = SoumissionNote::where('statut', 'valide')->findOrFail($id);
        $sub->update(['statut' => 'publie']);
        Note::where('module_id', $sub->module_id)
            ->where('semestre', $sub->semestre)
            ->whereHas('etudiant', fn ($q) => $q->where('niveau', $sub->niveau)->where('groupe', $sub->groupe))
            ->update(['statut' => 'publie']);

        // Notify all students in this group
        $etudiants = Etudiant::where('niveau', $sub->niveau)->where('groupe', $sub->groupe)->get();
        foreach ($etudiants as $e) {
            Notification::create([
                'user_id' => $e->user_id,
                'message' => "Les notes de {$sub->module->intitule} ont été publiées.",
                'type' => 'note',
            ]);
        }

        return response()->json(['message' => 'Notes publiées.']);
    }

    public function rejectGradeSubmission(Request $request, int $id)
    {
        $request->validate(['reason' => 'nullable|string']);
        $sub = SoumissionNote::findOrFail($id);
        $sub->update(['statut' => 'en_attente', 'rejection_reason' => $request->reason, 'notes_soumises' => false]);
        return response()->json(['message' => 'Soumission rejetée.']);
    }

    // ─── Rooms ────────────────────────────────────────────────────────────────

    public function salles(Request $request)
    {
        return response()->json(Salle::all());
    }

    public function storeSalle(Request $request)
    {
        $request->validate(['nom' => 'required|string|unique:salles', 'capacite' => 'required|integer', 'type' => 'required|string']);
        return response()->json(Salle::create($request->only(['nom', 'capacite', 'type', 'disponible'])), 201);
    }

    public function updateSalle(Request $request, int $id)
    {
        $salle = Salle::findOrFail($id);
        $salle->update($request->only(['nom', 'capacite', 'type', 'disponible']));
        return response()->json($salle);
    }

    public function destroySalle(Request $request, int $id)
    {
        Salle::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Seances ──────────────────────────────────────────────────────────────

    public function seances(Request $request)
    {
        $q = Seance::with(['module', 'enseignant', 'salle']);
        if ($request->has('filiere')) $q->where('filiere', $request->filiere);
        if ($request->has('niveau')) $q->where('niveau', $request->niveau);
        return response()->json($q->get()->map(fn ($s) => [
            'id' => $s->id,
            'moduleId' => $s->module_id,
            'module' => $s->module->intitule,
            'type' => $s->type,
            'jour' => $s->jour,
            'heureDebut' => $s->heure_debut,
            'heureFin' => $s->heure_fin,
            'salle' => $s->salle?->nom,
            'enseignant' => $s->enseignant ? 'Dr. ' . $s->enseignant->nom : null,
            'statut' => $s->statut,
            'groupes' => $s->groupes ?? [],
        ]));
    }

    public function storeSeance(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'type' => 'required|in:CM,TD,TP',
            'jour' => 'required|string',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
        ]);
        $seance = Seance::create($request->all());
        return response()->json($seance, 201);
    }

    public function updateSeance(Request $request, int $id)
    {
        $seance = Seance::findOrFail($id);
        $seance->update($request->all());
        return response()->json($seance);
    }

    public function destroySeance(Request $request, int $id)
    {
        Seance::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Calendar ──────────────────────────────────────────────────────────────

    public function evenements(Request $request)
    {
        return response()->json(Evenement::orderBy('date')->get());
    }

    public function storeEvenement(Request $request)
    {
        $request->validate(['date' => 'required|date', 'titre' => 'required|string', 'type' => 'required|in:green,red,blue,amber']);
        return response()->json(Evenement::create($request->only(['date', 'titre', 'description', 'type'])), 201);
    }

    public function updateEvenement(Request $request, int $id)
    {
        $evt = Evenement::findOrFail($id);
        $evt->update($request->only(['date', 'titre', 'description', 'type']));
        return response()->json($evt);
    }

    public function destroyEvenement(Request $request, int $id)
    {
        Evenement::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Deliberations ────────────────────────────────────────────────────────

    public function deliberations(Request $request)
    {
        return response()->json(Deliberation::with('agent')->get());
    }

    public function storeDeliberation(Request $request)
    {
        $agent = $this->agent($request);
        $request->validate([
            'filiere' => 'required|string',
            'niveau' => 'required|string',
            'semestre' => 'required|string',
            'annee_universitaire' => 'required|string',
        ]);

        // Compute stats from notes
        $notes = Note::whereHas('etudiant', fn ($q) => $q->where('filiere', $request->filiere)->where('niveau', $request->niveau))
            ->where('semestre', $request->semestre)->get();
        $admis = $notes->where('situation', 'admis')->count();
        $ajourne = $notes->where('situation', 'ajourne')->count();
        $rattrapage = $notes->where('situation', 'rattrapage')->count();

        $delibe = Deliberation::create([
            'filiere' => $request->filiere,
            'niveau' => $request->niveau,
            'semestre' => $request->semestre,
            'annee_universitaire' => $request->annee_universitaire,
            'statut' => 'terminee',
            'date_deliberation' => now()->toDateString(),
            'nb_admis' => $admis,
            'nb_ajourne' => $ajourne,
            'nb_rattrapage' => $rattrapage,
            'agent_id' => $agent->id,
        ]);

        return response()->json($delibe, 201);
    }

    // ─── Announcements ────────────────────────────────────────────────────────

    public function annonces(Request $request)
    {
        return response()->json(Annonce::orderByDesc('date_publication')->get());
    }

    public function storeAnnonce(Request $request)
    {
        $request->validate(['titre' => 'required|string', 'contenu' => 'required|string']);
        $annonce = Annonce::create(array_merge(
            $request->only(['titre', 'contenu', 'categorie', 'couleur', 'icon', 'audience', 'filiere', 'niveau']),
            ['auteur_id' => $request->user()->id, 'date_publication' => now()->toDateString()]
        ));
        return response()->json($annonce, 201);
    }

    public function updateAnnonce(Request $request, int $id)
    {
        $annonce = Annonce::findOrFail($id);
        $annonce->update($request->only(['titre', 'contenu', 'categorie', 'couleur', 'icon', 'audience']));
        return response()->json($annonce);
    }

    public function destroyAnnonce(Request $request, int $id)
    {
        Annonce::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Reinscriptions ──────────────────────────────────────────────────────

    public function reinscriptions(Request $request)
    {
        $q = Reinscription::with('etudiant');
        if ($request->has('statut')) $q->where('statut', $request->statut);
        return response()->json($q->orderByDesc('created_at')->get());
    }

    public function updateReinscription(Request $request, int $id)
    {
        $agent = $this->agent($request);
        $reinscription = Reinscription::findOrFail($id);
        $request->validate(['statut' => 'required|in:valide,en_attente,rejete,incomplet']);
        $reinscription->update([
            'statut' => $request->statut,
            'traite_par' => $agent->id,
            'traite_le' => now(),
        ]);
        return response()->json($reinscription);
    }

    // ─── Permissions enseignants ─────────────────────────────────────────────

    public function permissions(Request $request)
    {
        $enseignants = Enseignant::with(['user', 'permission.agent'])->get();
        return response()->json($enseignants->map(fn ($e) => [
            'id'              => $e->id,
            'nom'             => $e->nom,
            'prenom'          => $e->prenom,
            'grade'           => $e->grade,
            'departement'     => $e->departement,
            'peutSaisirCC'    => (bool) ($e->permission?->peut_saisir_cc ?? false),
            'peutSaisirExamen'=> (bool) ($e->permission?->peut_saisir_examen ?? false),
            'semestre'        => $e->permission?->semestre,
            'notesAdmin'      => $e->permission?->notes_admin,
            'grantedBy'       => $e->permission?->agent ? $e->permission->agent->prenom . ' ' . $e->permission->agent->nom : null,
            'grantedAt'       => $e->permission?->updated_at?->toDateString(),
        ]));
    }

    public function updatePermission(Request $request, int $enseignantId)
    {
        $agent = $this->agent($request);
        $request->validate([
            'peutSaisirCC'    => 'required|boolean',
            'peutSaisirExamen'=> 'required|boolean',
            'semestre'        => 'nullable|string',
            'notesAdmin'      => 'nullable|string|max:500',
        ]);

        EnseignantPermission::updateOrCreate(
            ['enseignant_id' => $enseignantId],
            [
                'agent_id'           => $agent->id,
                'peut_saisir_cc'     => $request->peutSaisirCC,
                'peut_saisir_examen' => $request->peutSaisirExamen,
                'semestre'           => $request->semestre,
                'notes_admin'        => $request->notesAdmin,
            ]
        );

        return response()->json(['message' => 'Permissions mises à jour.']);
    }

    public function revokePermission(Request $request, int $enseignantId)
    {
        EnseignantPermission::where('enseignant_id', $enseignantId)->delete();
        return response()->json(['message' => 'Permissions révoquées.']);
    }

    // ─── Stats ───────────────────────────────────────────────────────────────

    public function stats(Request $request)
    {
        return response()->json([
            'totalEtudiants' => Etudiant::count(),
            'totalEnseignants' => Enseignant::count(),
            'notesSoumises' => SoumissionNote::where('statut', 'soumis')->count(),
            'notesValidees' => SoumissionNote::whereIn('statut', ['valide', 'publie'])->count(),
            'recoursEnAttente' => \App\Models\Recour::where('statut', 'en_attente')->count(),
            'recoursAcceptes' => \App\Models\Recour::where('statut', 'accepte')->count(),
        ]);
    }
}
