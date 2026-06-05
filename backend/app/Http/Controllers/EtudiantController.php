<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Notification;
use App\Models\Seance;
use App\Models\Support;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    private function etudiant(Request $request)
    {
        return $request->user()->etudiant;
    }

    public function notes(Request $request)
    {
        $etudiant = $this->etudiant($request);
        $notes = $etudiant->notes()->with('module')->where('statut', 'publie')->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'moduleId' => $n->module_id,
                'module' => $n->module->intitule,
                'semestre' => $n->semestre,
                'exam' => $n->note_exam,
                'controle' => $n->note_controle,
                'tp' => $n->note_tp,
                'moyenne' => $n->moyenne,
                'creditAcquis' => $n->credit_acquis,
                'situation' => $n->situation,
                'statut' => $n->statut,
            ];
        });

        return response()->json($notes);
    }

    public function emploiDuTemps(Request $request)
    {
        $etudiant = $this->etudiant($request);
        $seances = Seance::with(['module', 'enseignant', 'salle'])
            ->where('filiere', $etudiant->filiere)
            ->where('niveau', $etudiant->niveau)
            ->where(function ($q) use ($etudiant) {
                $q->whereJsonContains('groupes', $etudiant->groupe)
                  ->orWhereNull('groupes');
            })
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'moduleId' => $s->module_id,
                'module' => $s->module->intitule,
                'type' => $s->type,
                'jour' => $s->jour,
                'heureDebut' => $s->heure_debut,
                'heureFin' => $s->heure_fin,
                'salle' => $s->salle?->nom ?? '—',
                'enseignant' => $s->enseignant ? 'Dr. ' . $s->enseignant->nom : '—',
                'statut' => $s->statut,
                'groupes' => $s->groupes ?? [],
            ]);

        return response()->json($seances);
    }

    public function supports(Request $request)
    {
        $etudiant = $this->etudiant($request);
        $moduleIds = $etudiant->notes()->pluck('module_id');
        $supports = Support::with(['module', 'enseignant'])
            ->whereIn('module_id', $moduleIds)
            ->orderByDesc('date_upload')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'moduleId' => $s->module_id,
                'module' => $s->module->intitule,
                'nom' => $s->nom,
                'type' => $s->type,
                'format' => $s->format,
                'taille' => $s->taille,
                'uploadDate' => $s->date_upload,
                'enseignantId' => $s->enseignant_id,
            ]);

        return response()->json($supports);
    }

    public function annonces(Request $request)
    {
        $etudiant = $this->etudiant($request);
        $annonces = Annonce::where(function ($q) use ($etudiant) {
                $q->where('audience', 'all')
                  ->orWhere('audience', 'etudiant');
            })
            ->where(function ($q) use ($etudiant) {
                $q->whereNull('filiere')
                  ->orWhere('filiere', $etudiant->filiere);
            })
            ->orderByDesc('date_publication')
            ->get();

        return response()->json($annonces);
    }

    public function notifications(Request $request)
    {
        $notifs = $request->user()->notifications()->orderByDesc('created_at')->get();
        return response()->json($notifs);
    }

    public function markNotificationRead(Request $request, int $id)
    {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->update(['lu' => true]);
        return response()->json(['ok' => true]);
    }

    public function markAllNotificationsRead(Request $request)
    {
        $request->user()->notifications()->update(['lu' => true]);
        return response()->json(['ok' => true]);
    }

    public function profile(Request $request)
    {
        $etudiant = $this->etudiant($request);
        return response()->json([
            'id' => $etudiant->id,
            'matricule' => $etudiant->matricule,
            'nom' => $etudiant->nom,
            'prenom' => $etudiant->prenom,
            'email' => $request->user()->email,
            'filiere' => $etudiant->filiere,
            'niveau' => $etudiant->niveau,
            'groupe' => $etudiant->groupe,
            'section' => $etudiant->section,
            'departement' => $etudiant->departement,
            'universite' => $etudiant->universite,
            'anneeUniversitaire' => $etudiant->annee_universitaire,
            'statutCompte' => $etudiant->statut_compte,
            'statutReinscription' => $etudiant->statut_reinscription,
            'statutPaiement' => $etudiant->statut_paiement,
        ]);
    }
}
