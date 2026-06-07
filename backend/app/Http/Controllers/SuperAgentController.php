<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Deliberation;
use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\Module;
use App\Models\Note;
use App\Models\SoumissionNote;
use App\Models\SuperAgent;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAgentController extends Controller
{
    /** The authenticated super-agent (Director or Doyen). */
    private function sa(Request $request): SuperAgent
    {
        return $request->user()->superAgent;
    }

    /** A super-agent with a faculté is a Doyen (faculty account); otherwise a Director. */
    private function isDoyen(SuperAgent $sa): bool
    {
        return ! empty($sa->faculte);
    }

    public function profile(Request $request)
    {
        $sa = $this->sa($request);
        return response()->json([
            'id'          => $sa->id,
            'nom'         => $sa->nom,
            'prenom'      => $sa->prenom,
            'email'       => $request->user()->email,
            'role'        => $sa->role,
            'departement' => $sa->departement,
            'universite'  => $sa->universite,
            'faculte'     => $sa->faculte,
            'accountType' => $this->isDoyen($sa) ? 'doyen' : 'directeur',
        ]);
    }

    // ─── Agents Management ────────────────────────────────────────────────────

    public function agents(Request $request)
    {
        $sa = $this->sa($request);
        $q  = Agent::with('user');
        // Director sees every agent of their université; a Doyen only their faculté.
        if ($sa->universite) $q->where('universite', $sa->universite);
        if ($this->isDoyen($sa)) $q->where('faculte', $sa->faculte);

        return response()->json($q->get()->map(fn ($a) => [
            'id' => $a->id,
            'nom' => $a->nom,
            'prenom' => $a->prenom,
            'email' => $a->user->email,
            'role' => $a->role,
            'departement' => $a->departement,
            'faculte' => $a->faculte,
            'universite' => $a->universite,
            'statut' => $a->statut ?? 'actif',
        ]));
    }

    public function toggleAgentStatus(Request $request, int $id)
    {
        $request->validate(['statut' => 'required|in:actif,suspendu']);
        $agent = Agent::findOrFail($id);
        $agent->update(['statut' => $request->statut]);
        return response()->json(['ok' => true, 'statut' => $agent->statut]);
    }

    public function storeAgent(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6',
            'nom'      => 'required|string',
            'prenom'   => 'required|string',
        ]);

        // Build username from prenom+nom if not provided
        $username = $request->username
            ?? strtolower(mb_substr($request->prenom, 0, 1) . $request->nom) . '.agent';
        $username = preg_replace('/[^a-z0-9._-]/', '', strtolower($username));

        // Ensure unique email
        $email   = $username . '@eduspace.local';
        $counter = 1;
        while (User::where('email', $email)->exists()) {
            $email = $username . $counter++ . '@eduspace.local';
        }

        // A Doyen always creates agents inside their own faculté/université —
        // never trust client-supplied scope. A Director may pass them explicitly.
        $sa         = $this->sa($request);
        $universite = $this->isDoyen($sa) ? $sa->universite : $request->universite;
        $faculte    = $this->isDoyen($sa) ? $sa->faculte    : $request->faculte;

        $user  = User::create(['email' => $email, 'password' => $request->password, 'role' => 'agent']);
        $agent = Agent::create([
            'user_id'     => $user->id,
            'nom'         => $request->nom,
            'prenom'      => $request->prenom,
            'departement' => $request->departement,
            'universite'  => $universite,
            'faculte'     => $faculte,
        ]);
        return response()->json(array_merge($agent->toArray(), ['username' => $username]), 201);
    }

    public function updateAgent(Request $request, int $id)
    {
        $agent = Agent::findOrFail($id);
        $agent->update($request->only(['nom', 'prenom', 'role', 'departement']));
        return response()->json($agent);
    }

    public function destroyAgent(Request $request, int $id)
    {
        $agent = Agent::findOrFail($id);
        $user = $agent->user;
        $agent->delete();
        $user->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Doyens Management (Director only) ────────────────────────────────────
    // A Doyen is a super_agent scoped to a faculté. The Director creates and
    // manages them; each Doyen in turn manages the agents of their faculté.

    public function doyens(Request $request)
    {
        $director = $this->sa($request);
        $q = SuperAgent::with('user')->whereNotNull('faculte')->where('faculte', '!=', '');
        if ($director->universite) $q->where('universite', $director->universite);

        return response()->json($q->get()->map(fn ($d) => [
            'id'         => $d->id,
            'nom'        => $d->nom,
            'prenom'     => $d->prenom,
            'email'      => $d->user?->email ?? '',
            'faculte'    => $d->faculte,
            'universite' => $d->universite,
            'statut'     => $d->statut ?? 'actif',
        ]));
    }

    public function storeDoyen(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6',
            'nom'      => 'required|string',
            'prenom'   => 'required|string',
            'faculte'  => 'required|string',
        ]);

        $director = $this->sa($request);

        // Build username from prenom+nom if not provided, suffixed ".doyen".
        $username = $request->username
            ?? strtolower(mb_substr($request->prenom, 0, 1) . $request->nom) . '.doyen';
        $username = preg_replace('/[^a-z0-9._-]/', '', strtolower($username));

        $email   = $username . '@eduspace.local';
        $counter = 1;
        while (User::where('email', $email)->exists()) {
            $email = $username . $counter++ . '@eduspace.local';
        }

        $user  = User::create(['email' => $email, 'password' => $request->password, 'role' => 'super_agent']);
        $doyen = SuperAgent::create([
            'user_id'    => $user->id,
            'nom'        => $request->nom,
            'prenom'     => $request->prenom,
            'role'       => 'Doyen',
            'universite' => $director->universite,
            'faculte'    => $request->faculte,
        ]);
        return response()->json(array_merge($doyen->toArray(), ['username' => $username]), 201);
    }

    public function updateDoyen(Request $request, int $id)
    {
        $doyen = SuperAgent::findOrFail($id);
        $doyen->update($request->only(['nom', 'prenom', 'faculte']));
        return response()->json($doyen);
    }

    public function toggleDoyenStatus(Request $request, int $id)
    {
        $request->validate(['statut' => 'required|in:actif,suspendu']);
        $doyen = SuperAgent::findOrFail($id);
        $doyen->update(['statut' => $request->statut]);
        return response()->json(['ok' => true, 'statut' => $doyen->statut]);
    }

    public function destroyDoyen(Request $request, int $id)
    {
        $doyen = SuperAgent::findOrFail($id);
        $user  = $doyen->user;
        $doyen->delete();
        $user?->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Student promotion statistics ─────────────────────────────────────────
    // Annual outcome (passage to the next year) derived from per-module notes:
    //   normale    = all graded modules admis (passed in the first session)
    //   rattrapage = at least one module went to the rattrapage session
    //   dettes     = progresses owing modules (≥ half the year's credits acquired)
    //   ajourne    = insufficient credits → repeats the year
    // Thresholds follow the LMD scheme and are easy to tune below.

    public function studentStats(Request $request)
    {
        $sa = $this->sa($request);

        $q = Etudiant::query();
        if ($sa->universite) $q->where('universite', $sa->universite);
        if ($request->filled('filiere')) $q->where('filiere', $request->filiere);
        if ($request->filled('niveau'))  $q->where('niveau', $request->niveau);

        $counts = ['normale' => 0, 'rattrapage' => 0, 'dettes' => 0, 'ajourne' => 0, 'total' => 0];

        foreach ($q->get() as $stu) {
            $notes = Note::where('etudiant_id', $stu->id)->get();
            if ($notes->isEmpty()) continue; // pas encore de résultats

            $yearTotal = (int) Module::where('filiere', $stu->filiere)
                ->where('niveau', $stu->niveau)->sum('credits');
            if ($yearTotal <= 0) $yearTotal = 60;

            $acquired      = (int) $notes->where('situation', 'admis')->sum('credit_acquis');
            $hasRattrapage = $notes->contains('situation', 'rattrapage');
            $hasAjourne    = $notes->contains('situation', 'ajourne');
            $allAdmis      = ! $hasRattrapage && ! $hasAjourne;

            if ($allAdmis) {
                $counts['normale']++;
            } elseif ($hasRattrapage) {
                $counts['rattrapage']++;
            } elseif ($acquired >= $yearTotal / 2) {
                $counts['dettes']++;
            } else {
                $counts['ajourne']++;
            }
            $counts['total']++;
        }

        return response()->json($counts);
    }

    // ─── Modules Management ───────────────────────────────────────────────────

    public function modules(Request $request)
    {
        $q = Module::with('enseignantResponsable');
        if ($request->has('filiere')) $q->where('filiere', $request->filiere);
        if ($request->has('niveau')) $q->where('niveau', $request->niveau);
        if ($request->has('semestre')) $q->where('semestre', $request->semestre);
        return response()->json($q->get()->map(fn ($m) => [
            'id'          => $m->id,
            'code'        => $m->code,
            'intitule'    => $m->intitule,
            'credits'     => $m->credits,
            'filiere'     => $m->filiere,
            'niveau'      => $m->niveau,
            'semestre'    => $m->semestre,
            'type_ue'     => $m->type_ue,
            'nature'      => $m->nature,
            'coefficient' => $m->coefficient,
            'vhs'         => $m->vhs,
            'has_cours'   => (bool) $m->has_cours,
            'duree_cours' => $m->duree_cours,
            'has_td'      => (bool) $m->has_td,
            'duree_td'    => $m->duree_td,
            'has_tp'      => (bool) $m->has_tp,
            'duree_tp'    => $m->duree_tp,
            'pct_examen'  => $m->pct_examen,
            'pct_td'      => $m->pct_td,
            'pct_tp'      => $m->pct_tp,
            'enseignant'  => $m->enseignantResponsable ? 'Dr. ' . $m->enseignantResponsable->nom : null,
        ]));
    }

    // ─── Auto-generated module codes (LMD canevas) ────────────────────────────
    // Code = UE-type letters + semester digit + UE order + course order.
    //   e.g. UEF111 = 1st course of the 1st Fundamental UE of Semester 1.
    // Codes are generated server-side and are unique per (filière, niveau).

    /** Numeric part of a semestre label: "S5" → 5, "Semestre 3" → 3. */
    private function semesterDigit(string $semestre): int
    {
        return preg_match('/(\d+)/', $semestre, $m) ? (int) $m[1] : 1;
    }

    /**
     * Existing UE-format codes in a (filière, niveau, semestre) scope, mapped as
     * ueOrder => ['max' => maxCourseOrder, 'count' => n]. Only codes matching the
     * given UE type + semester are considered (legacy/other codes are ignored).
     * Returns ['base' => "UEF5", 'map' => [...]].
     */
    private function ueScopeMap(string $filiere, string $niveau, string $semestre, string $typeUe): array
    {
        $base  = strtoupper($typeUe) . $this->semesterDigit($semestre); // e.g. "UEF5"
        $map   = [];
        $codes = Module::where('filiere', $filiere)->where('niveau', $niveau)
            ->where('semestre', $semestre)->pluck('code');
        foreach ($codes as $code) {
            if (! str_starts_with((string) $code, $base)) continue;
            $rest = substr((string) $code, strlen($base));
            if (! preg_match('/^(\d)(\d)$/', $rest, $mm)) continue; // UE order, course order
            $u = (int) $mm[1]; $c = (int) $mm[2];
            $map[$u]['max']   = max($map[$u]['max'] ?? 0, $c);
            $map[$u]['count'] = ($map[$u]['count'] ?? 0) + 1;
        }
        ksort($map);
        return ['base' => $base, 'map' => $map];
    }

    /** Next module code. $ueOrder = null → start a new UE; else add to that UE. */
    private function generateModuleCode(string $filiere, string $niveau, string $semestre, string $typeUe, ?int $ueOrder): string
    {
        ['base' => $base, 'map' => $map] = $this->ueScopeMap($filiere, $niveau, $semestre, $typeUe);
        if ($ueOrder === null) {
            $u = (count($map) ? max(array_keys($map)) : 0) + 1;
            $c = 1;
        } else {
            $u = $ueOrder;
            $c = ($map[$u]['max'] ?? 0) + 1;
        }
        return $base . $u . $c;
    }

    /** Existing UEs + the next-new UE — drives the create-module picker/preview. */
    public function moduleUeOptions(Request $request)
    {
        $request->validate([
            'filiere'  => 'required|string',
            'niveau'   => 'required|string',
            'semestre' => 'required|string',
            'type_ue'  => 'required|string',
        ]);
        ['base' => $base, 'map' => $map] = $this->ueScopeMap(
            $request->filiere, $request->niveau, $request->semestre, $request->type_ue
        );
        $existing = [];
        foreach ($map as $u => $info) {
            $next = ($info['max'] ?? 0) + 1;
            $existing[] = [
                'ue_order'   => $u,
                'ue_code'    => $base . $u,
                'count'      => $info['count'] ?? 0,
                'next_order' => $next,
                'next_code'  => $base . $u . $next,
            ];
        }
        $newOrder = (count($map) ? max(array_keys($map)) : 0) + 1;
        return response()->json([
            'prefix'         => strtoupper($request->type_ue),
            'semester_digit' => $this->semesterDigit($request->semestre),
            'existing'       => $existing,
            'new_ue'         => [
                'ue_order'   => $newOrder,
                'ue_code'    => $base . $newOrder,
                'first_code' => $base . $newOrder . '1',
            ],
        ]);
    }

    public function storeModule(Request $request)
    {
        $request->validate([
            'intitule' => 'required|string',
            'credits'  => 'required|integer|min:1|max:30',
            'filiere'  => 'required|string',
            'niveau'   => 'required|string',
            'semestre' => 'required|string',
            'type_ue'  => 'required|string',
            'ue_order' => 'nullable|integer|min:1',
        ]);

        // is_new_ue defaults to true → a brand-new Teaching Unit.
        $isNewUe = $request->boolean('is_new_ue', true);
        $ueOrder = $isNewUe ? null : (int) $request->ue_order;

        $fields = $request->only([
            'intitule', 'credits', 'filiere', 'niveau', 'semestre', 'enseignant_id',
            'type_ue', 'nature', 'coefficient', 'vhs',
            'has_cours', 'duree_cours', 'has_td', 'duree_td', 'has_tp', 'duree_tp',
            'pct_examen', 'pct_td', 'pct_tp',
        ]);

        // The code is ALWAYS generated server-side — never accepted from the client.
        for ($attempt = 0; $attempt < 6; $attempt++) {
            $code = $this->generateModuleCode(
                $request->filiere, $request->niveau, $request->semestre, $request->type_ue, $ueOrder
            );
            try {
                $module = Module::create(array_merge($fields, ['code' => $code]));
                return response()->json($module, 201);
            } catch (\Illuminate\Database\QueryException $e) {
                if (! str_contains($e->getMessage(), 'UNIQUE')) throw $e;
                // Code collided (rare race) → re-read scope and regenerate.
            }
        }
        return response()->json(['message' => 'Impossible de générer un code unique pour ce module.'], 409);
    }

    public function updateModule(Request $request, int $id)
    {
        $module = Module::findOrFail($id);
        // 'code' is intentionally excluded — it is generated, never edited by hand.
        $module->update($request->only([
            'intitule', 'credits', 'enseignant_id',
            'type_ue', 'nature', 'coefficient', 'vhs',
            'has_cours', 'duree_cours', 'has_td', 'duree_td', 'has_tp', 'duree_tp',
            'pct_examen', 'pct_td', 'pct_tp',
        ]));
        return response()->json($module);
    }

    public function destroyModule(Request $request, int $id)
    {
        Module::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // ─── Overview stats ───────────────────────────────────────────────────────

    public function stats(Request $request)
    {
        return response()->json([
            'totalEtudiants' => Etudiant::count(),
            'totalEnseignants' => Enseignant::count(),
            'totalAgents' => Agent::count(),
            'totalModules' => Module::count(),
            'deliberations' => Deliberation::count(),
            'gradeSubmissions' => SoumissionNote::count(),
        ]);
    }
}
