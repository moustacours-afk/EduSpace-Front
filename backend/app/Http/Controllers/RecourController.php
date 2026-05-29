<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Notification;
use App\Models\Recour;
use Illuminate\Http\Request;

class RecourController extends Controller
{
    public function index(Request $request)
    {
        $etudiant = $request->user()->etudiant;
        $recours = $etudiant->recours()->with('module')->orderByDesc('created_at')->get()->map(fn ($r) => [
            'id' => $r->id,
            'moduleId' => $r->module_id,
            'moduleName' => $r->module->intitule,
            'semestre' => $r->semestre,
            'noteType' => $r->note_type,
            'currentNote' => $r->note_actuelle,
            'reason' => $r->motif,
            'status' => $r->statut,
            'proposedNote' => $r->note_proposee,
            'teacherComment' => $r->commentaire_enseignant,
            'notifiedStudent' => $r->notifie_etudiant,
            'createdAt' => $r->created_at,
            'updatedAt' => $r->updated_at,
        ]);
        return response()->json($recours);
    }

    public function store(Request $request)
    {
        $etudiant = $request->user()->etudiant;

        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'semestre' => 'required|string',
            'note_type' => 'required|in:exam,controle,tp,generale',
            'note_actuelle' => 'required|numeric|min:0|max:20',
            'motif' => 'required|string|min:10',
        ]);

        $existing = Recour::where([
            'etudiant_id' => $etudiant->id,
            'module_id' => $request->module_id,
            'note_type' => $request->note_type,
        ])->whereNotIn('statut', ['refuse'])->first();

        if ($existing) {
            return response()->json(['message' => 'Un recours est déjà en cours pour ce module.'], 422);
        }

        $module = Module::findOrFail($request->module_id);

        $recour = Recour::create([
            'etudiant_id' => $etudiant->id,
            'module_id' => $request->module_id,
            'semestre' => $request->semestre,
            'note_type' => $request->note_type,
            'note_actuelle' => $request->note_actuelle,
            'motif' => $request->motif,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'id' => $recour->id,
            'moduleId' => $recour->module_id,
            'moduleName' => $module->intitule,
            'status' => $recour->statut,
        ], 201);
    }

    public function markNotified(Request $request, int $id)
    {
        $etudiant = $request->user()->etudiant;
        $recour = Recour::where('etudiant_id', $etudiant->id)->findOrFail($id);
        $recour->update(['notifie_etudiant' => true]);
        return response()->json(['ok' => true]);
    }

    public function forModule(Request $request)
    {
        $etudiant = $request->user()->etudiant;
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'semestre'  => 'required|string',
            'note_type' => 'required|in:exam,controle,tp,generale',
        ]);

        $recour = Recour::where([
            'etudiant_id' => $etudiant->id,
            'module_id'   => $request->module_id,
            'semestre'    => $request->semestre,
            'note_type'   => $request->note_type,
        ])->first();

        return response()->json($recour ? [
            'id' => $recour->id,
            'status' => $recour->statut,
            'proposedNote' => $recour->note_proposee,
            'teacherComment' => $recour->commentaire_enseignant,
            'notifiedStudent' => $recour->notifie_etudiant,
        ] : null);
    }

    // Agent: list recours accepted, awaiting agent validation
    public function pendingAgent(Request $request)
    {
        $recours = Recour::with(['etudiant', 'module', 'enseignant'])
            ->where('statut', 'accepte')
            ->orderByDesc('traite_le')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'etudiant' => $r->etudiant->prenom . ' ' . $r->etudiant->nom,
                'matricule' => $r->etudiant->matricule,
                'module' => $r->module->intitule,
                'semestre' => $r->semestre,
                'noteType' => $r->note_type,
                'noteActuelle' => $r->note_actuelle,
                'noteProposee' => $r->note_proposee,
                'commentaireEnseignant' => $r->commentaire_enseignant,
                'enseignant' => $r->enseignant ? 'Dr. ' . $r->enseignant->nom : '—',
                'traiteLe' => $r->traite_le,
            ]);
        return response()->json($recours);
    }

    public function validateAgent(Request $request, int $id)
    {
        $agent = $request->user()->agent;
        $recour = Recour::with(['etudiant', 'module'])->where('statut', 'accepte')->findOrFail($id);

        $recour->update([
            'statut' => 'valide_agent',
            'agent_id' => $agent->id,
            'valide_le' => now(),
        ]);

        // Apply the new note if proposed
        if ($recour->note_proposee !== null) {
            $note = \App\Models\Note::where([
                'etudiant_id' => $recour->etudiant_id,
                'module_id' => $recour->module_id,
                'semestre' => $recour->semestre,
            ])->first();

            if ($note) {
                $field = match ($recour->note_type) {
                    'exam' => 'note_exam',
                    'controle' => 'note_controle',
                    'tp' => 'note_tp',
                    default => null,
                };
                if ($field) {
                    $note->$field = $recour->note_proposee;
                    if ($note->note_controle !== null && $note->note_exam !== null) {
                        $moy = ($note->note_controle * 0.4) + ($note->note_exam * 0.6);
                        $note->moyenne = round($moy, 2);
                        $note->situation = $moy >= 10 ? 'admis' : ($moy >= 8 ? 'rattrapage' : 'ajourne');
                    }
                    $note->save();
                }
            }
        }

        Notification::create([
            'user_id' => $recour->etudiant->user_id,
            'message' => "Votre recours pour \"{$recour->module->intitule}\" a été validé par l'agent pédagogique." . ($recour->note_proposee !== null ? " Nouvelle note officielle : {$recour->note_proposee}/20" : ''),
            'type' => 'recours',
        ]);

        return response()->json(['message' => 'Recours validé.']);
    }
}
