<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\SuperAgent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Matricule/username-based login for enseignant and etudiant
        if ($request->has('matricule')) {
            $identifier = $request->matricule;
            $password   = $request->password ?? '';
            $user       = null;

            // 1. Username login for enseignant: "m.hadj" → "m.hadj@eduspace.local"
            $user = User::where('email', $identifier . '@eduspace.local')->first();

            // 2. Full email match for enseignant (demo/seeded accounts)
            if (! $user) {
                $user = User::where('email', $identifier)->where('role', 'enseignant')->first();
            }

            // 2b. Full email match for agent (demo/seeded accounts)
            if (! $user) {
                $user = User::where('email', $identifier)->where('role', 'agent')->first();
            }

            // 3. Matricule lookup in enseignants table (fallback)
            if (! $user) {
                $ens = \App\Models\Enseignant::where('matricule', $identifier)->first();
                if ($ens) $user = $ens->user;
            }

            // 4. Matricule lookup in etudiants table
            if (! $user) {
                $etu = \App\Models\Etudiant::where('matricule', $identifier)->first();
                if ($etu) $user = $etu->user;
            }

            // 5. Username login for agent: "mbenali.agent" → "mbenali.agent@eduspace.local"
            if (! $user) {
                $user = User::where('email', $identifier . '@eduspace.local')
                            ->where('role', 'agent')->first();
            }

            if (! $user || ! Hash::check($password, $user->password)) {
                return response()->json(['message' => 'Identifiants incorrects.'], 401);
            }
        } else {
            // Email-based login for agent and super_agent
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Identifiants incorrects.'], 401);
            }
        }

        // Block suspended agents
        if ($user->role === 'agent') {
            $agentProfile = $user->agent;
            if ($agentProfile && $agentProfile->statut === 'suspendu') {
                return response()->json(['message' => 'Votre compte a été suspendu. Contactez l\'administration.'], 403);
            }
        }

        $profile = match ($user->role) {
            'etudiant'    => $user->etudiant,
            'enseignant'  => $user->enseignant,
            'agent'       => $user->agent,
            'super_agent' => $user->superAgent,
            default       => null,
        };

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'      => $user->id,
                'email'   => $user->email,
                'role'    => $user->role,
                'profile' => $profile,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = match ($user->role) {
            'etudiant' => $user->etudiant,
            'enseignant' => $user->enseignant,
            'agent' => $user->agent,
            'super_agent' => $user->superAgent,
            default => null,
        };

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'profile' => $profile,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:etudiant,enseignant,agent,super_agent',
            'nom' => 'required|string',
            'prenom' => 'required|string',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
        ]);

        match ($request->role) {
            'etudiant' => Etudiant::create([
                'user_id' => $user->id,
                'matricule' => $request->matricule ?? 'ETU' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'filiere' => $request->filiere ?? 'Informatique',
                'niveau' => $request->niveau ?? 'L1',
                'groupe' => $request->groupe ?? 'Groupe 1',
            ]),
            'enseignant' => Enseignant::create([
                'user_id' => $user->id,
                'matricule' => $request->matricule ?? 'ENS' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'grade' => $request->grade,
                'departement' => $request->departement,
            ]),
            'agent' => Agent::create([
                'user_id' => $user->id,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'departement' => $request->departement,
            ]),
            'super_agent' => SuperAgent::create([
                'user_id'    => $user->id,
                'nom'        => $request->nom,
                'prenom'     => $request->prenom,
                'departement' => $request->departement,
                'universite' => $request->universite,
                'faculte'    => $request->faculte,
            ]),
        };

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => ['id' => $user->id, 'email' => $user->email, 'role' => $user->role],
        ], 201);
    }
}
