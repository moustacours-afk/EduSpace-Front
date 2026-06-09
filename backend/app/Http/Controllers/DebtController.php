<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Etudiant;
use Illuminate\Http\Request;

/**
 * Debt management for the Agent Pédagogique.
 *
 * Debts are derived from failed, non-compensated modules (LMD: a teaching unit
 * whose credit-weighted average reaches 10/20 compensates its failing modules)
 * and persisted in the dedicated `debts` table. The agent then records a
 * `retake_grade`; a debt clears when that grade reaches 10/20. This flow is
 * independent of the normal grading flow — it never mutates published notes.
 */
class DebtController extends Controller
{
    private function agent(Request $request)
    {
        return $request->user()->agent;
    }

    /**
     * Département de l'agent connecté, normalisé pour correspondre au champ
     * `filiere` des étudiants. "Département d'Informatique" → "Informatique".
     */
    private function agentDept(Request $request): ?string
    {
        $agent = $this->agent($request);
        if (! $agent || ! $agent->departement) return null;
        $stripped = preg_replace(
            "/^d[ée]partement\\s+(d['’]\\s*|de\\s+|des\\s+|du\\s+)/iu",
            '',
            $agent->departement
        );
        return trim($stripped) ?: $agent->departement;
    }

    /** "S1"/"S2" → "1ère Année", "S3"/"S4" → "2ème Année", … */
    private function yearLabel(?string $semestre): string
    {
        $num  = (int) preg_replace('/\D/', '', (string) $semestre);
        $year = $num > 0 ? (int) ceil($num / 2) : 0;
        $labels = [1 => '1ère Année', 2 => '2ème Année', 3 => '3ème Année', 4 => '4ème Année', 5 => '5ème Année'];
        return $labels[$year] ?? ($year . 'ème Année');
    }

    /**
     * UE key derived from a module code "{type}{sem}{ue}{course}" — e.g. UEF111
     * and UEF112 share the unit "UEF11". Falls back to the UE type, then title.
     */
    private function ueKey($module): string
    {
        $code = $module->code;
        if ($code && strlen($code) > 1) return substr($code, 0, -1);
        return $module->type_ue ?? $module->intitule ?? 'UE';
    }

    /**
     * Reconcile the `debts` table with the student's current notes:
     *  - create an active debt for every failed, non-compensated module;
     *  - drop stale, untouched (no retake yet) debts that no longer apply.
     * Debts that already carry a retake_grade are preserved as history.
     */
    private function syncDebtsForStudent(Etudiant $student): void
    {
        $notes = $student->notes()->with('module')->get()->filter(fn ($n) => $n->module);
        if ($notes->isEmpty()) return;

        // Credit-weighted UE averages → which units are compensated (≥ 10/20).
        $compensated = [];
        foreach ($notes->groupBy(fn ($n) => $n->semestre . '|' . $this->ueKey($n->module)) as $key => $rows) {
            $totalCr = 0; $sum = 0;
            foreach ($rows as $r) {
                if ($r->moyenne === null) continue;
                $cr = (int) ($r->module->credits ?? 0);
                $totalCr += $cr;
                $sum     += $r->moyenne * $cr;
            }
            $compensated[$key] = $totalCr > 0 && ($sum / $totalCr) >= 10;
        }

        foreach ($notes as $n) {
            $year = $this->yearLabel($n->semestre);
            $key  = $n->semestre . '|' . $this->ueKey($n->module);
            $isDebt = $n->situation !== 'admis' && ! ($compensated[$key] ?? false);

            if ($isDebt) {
                $debt = Debt::firstOrNew([
                    'student_id'    => $student->id,
                    'module_id'     => $n->module_id,
                    'academic_year' => $year,
                ]);
                $debt->original_grade = $n->moyenne;
                if (! $debt->exists) $debt->status = true; // new debts start active
                $debt->save();
            } else {
                // No longer a debt — clear it only if the agent hasn't acted on it.
                Debt::where('student_id', $student->id)
                    ->where('module_id', $n->module_id)
                    ->where('academic_year', $year)
                    ->whereNull('retake_grade')
                    ->delete();
            }
        }
    }

    /**
     * GET /agent/debts — debt-carrying students of the agent's department,
     * each with their list of debts. Optional ?niveau=&section=&groupe= filters.
     */
    public function index(Request $request)
    {
        $studentsQ = Etudiant::query();
        if ($dept = $this->agentDept($request)) $studentsQ->where('filiere', $dept);
        if ($request->filled('niveau'))  $studentsQ->where('niveau', $request->niveau);
        if ($request->filled('section')) $studentsQ->where('section', $request->section);
        if ($request->filled('groupe'))  $studentsQ->where('groupe', $request->groupe);

        $result = [];
        foreach ($studentsQ->get() as $student) {
            $this->syncDebtsForStudent($student);

            $debts = Debt::with('module')
                ->where('student_id', $student->id)
                ->get()
                ->sortBy(fn ($d) => [$d->module->semestre ?? '', $d->module->code ?? ''])
                ->map(fn ($d) => [
                    'id'            => $d->id,
                    'moduleId'      => $d->module_id,
                    'module'        => $d->module->intitule ?? '—',
                    'code'          => $d->module->code,
                    'semestre'      => $d->module->semestre,
                    'credits'       => $d->module->credits,
                    'coefficient'   => $d->module->coefficient,
                    'academicYear'  => $d->academic_year,
                    'originalGrade' => $d->original_grade,
                    'retakeGrade'   => $d->retake_grade,
                    'status'        => $d->status,   // true = active
                    'cleared'       => ! $d->status,
                ])
                ->values();

            if ($debts->isNotEmpty()) {
                $result[] = [
                    'student' => [
                        'id'        => $student->id,
                        'matricule' => $student->matricule,
                        'nom'       => $student->nom,
                        'prenom'    => $student->prenom,
                        'niveau'    => $student->niveau,
                        'section'   => $student->section,
                        'groupe'    => $student->groupe,
                    ],
                    'debts'        => $debts,
                    'activeCount'  => $debts->where('status', true)->count(),
                    'clearedCount' => $debts->where('status', false)->count(),
                ];
            }
        }

        return response()->json($result);
    }

    /**
     * PATCH /agent/debts/{id} — record/replace the retake grade. The debt clears
     * automatically once the retake reaches 10/20.
     */
    public function update(Request $request, int $id)
    {
        $debt = Debt::with('module')->findOrFail($id);

        // An agent may only touch debts of students in their own department.
        if ($dept = $this->agentDept($request)) {
            if ($debt->student->filiere !== $dept) abort(403, 'Étudiant hors de votre département.');
        }

        $validated = $request->validate([
            'retake_grade' => 'required|numeric|min:0|max:20',
        ]);

        $retake = round((float) $validated['retake_grade'], 2);
        $debt->update([
            'retake_grade' => $retake,
            'status'       => $retake < 10, // active while still below the pass mark
        ]);

        return response()->json([
            'id'          => $debt->id,
            'retakeGrade' => $debt->retake_grade,
            'status'      => $debt->status,
            'cleared'     => ! $debt->status,
        ]);
    }
}
