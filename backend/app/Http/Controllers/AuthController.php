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
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        $profile = match ($user->role) {
            'etudiant' => $user->etudiant,
            'enseignant' => $user->enseignant,
            'agent' => $user->agent,
            'super_agent' => $user->superAgent,
            default => null,
        };

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
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
                'user_id' => $user->id,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'departement' => $request->departement,
            ]),
        };

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => ['id' => $user->id, 'email' => $user->email, 'role' => $user->role],
        ], 201);
    }
}
