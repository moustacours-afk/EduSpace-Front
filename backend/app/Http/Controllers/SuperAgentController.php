<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Deliberation;
use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\Module;
use App\Models\SoumissionNote;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAgentController extends Controller
{
    public function profile(Request $request)
    {
        $sa = $request->user()->superAgent;
        return response()->json([
            'id' => $sa->id,
            'nom' => $sa->nom,
            'prenom' => $sa->prenom,
            'email' => $request->user()->email,
            'role' => $sa->role,
            'departement' => $sa->departement,
        ]);
    }

    // ─── Agents Management ────────────────────────────────────────────────────

    public function agents(Request $request)
    {
        return response()->json(Agent::with('user')->get()->map(fn ($a) => [
            'id' => $a->id,
            'nom' => $a->nom,
            'prenom' => $a->prenom,
            'email' => $a->user->email,
            'role' => $a->role,
            'departement' => $a->departement,
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

        $user  = User::create(['email' => $email, 'password' => $request->password, 'role' => 'agent']);
        $agent = Agent::create([
            'user_id'     => $user->id,
            'nom'         => $request->nom,
            'prenom'      => $request->prenom,
            'departement' => $request->departement,
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

    // ─── Modules Management ───────────────────────────────────────────────────

    public function modules(Request $request)
    {
        $q = Module::with('enseignantResponsable');
        if ($request->has('filiere')) $q->where('filiere', $request->filiere);
        if ($request->has('niveau')) $q->where('niveau', $request->niveau);
        if ($request->has('semestre')) $q->where('semestre', $request->semestre);
        return response()->json($q->get()->map(fn ($m) => [
            'id' => $m->id,
            'code' => $m->code,
            'intitule' => $m->intitule,
            'credits' => $m->credits,
            'filiere' => $m->filiere,
            'niveau' => $m->niveau,
            'semestre' => $m->semestre,
            'enseignant' => $m->enseignantResponsable ? 'Dr. ' . $m->enseignantResponsable->nom : null,
        ]));
    }

    public function storeModule(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:modules',
            'intitule' => 'required|string',
            'credits' => 'required|integer|min:1|max:30',
            'filiere' => 'required|string',
            'niveau' => 'required|string',
            'semestre' => 'required|string',
        ]);
        $module = Module::create($request->only(['code', 'intitule', 'credits', 'filiere', 'niveau', 'semestre', 'enseignant_id']));
        return response()->json($module, 201);
    }

    public function updateModule(Request $request, int $id)
    {
        $module = Module::findOrFail($id);
        $module->update($request->only(['code', 'intitule', 'credits', 'filiere', 'niveau', 'semestre', 'enseignant_id']));
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
