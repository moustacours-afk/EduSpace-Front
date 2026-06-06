<?php

namespace Database\Seeders;

use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\Module;
use App\Models\Seance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Rebuilds every teacher's module assignments from the real timetable.
 *
 * For each (enseignant, module) it derives, from the séances:
 *   • the teaching type(s)  — CM / TD / TP
 *   • whether the teacher is the module's responsable
 *   • the groups they handle (per type), and the section(s) for CM
 *
 * Writes both:
 *   • the `enseignant_module` pivot (role cc/tp/cc+tp, responsable, groupes)
 *   • the `enseignants.modules_details` JSON (used by the agent "Comptes" editor)
 */
class TeacherAssignmentsSeeder extends Seeder
{
    public function run(): void
    {
        // group → section map, per filière+niveau, from real student records
        $groupSection = [];
        foreach (Etudiant::select('filiere', 'niveau', 'groupe', 'section')->whereNotNull('groupe')->get() as $e) {
            if ($e->section) $groupSection["{$e->filiere}|{$e->niveau}|{$e->groupe}"] = $e->section;
        }

        $modules = Module::all()->keyBy('id');

        // Aggregate per (enseignant, module): which types + which groups per type
        $agg = [];
        $touch = function (int $ens, int $mod) use (&$agg) {
            $k = "$ens|$mod";
            $agg[$k] ??= ['ens' => $ens, 'mod' => $mod, 'types' => [], 'groupsByType' => ['CM' => [], 'TD' => [], 'TP' => []]];
            return $k;
        };

        foreach (Seance::whereNotNull('enseignant_id')->whereNotNull('module_id')->get() as $s) {
            $k = $touch($s->enseignant_id, $s->module_id);
            $agg[$k]['types'][$s->type] = true;
            foreach (($s->groupes ?? []) as $g) {
                $agg[$k]['groupsByType'][$s->type][$g] = true;
            }
        }

        // Ensure each module's responsable is present (even with no séance) as CM
        foreach ($modules as $m) {
            if (! $m->enseignant_id) continue;
            $k = $touch((int) $m->enseignant_id, (int) $m->id);
            if (empty($agg[$k]['types'])) $agg[$k]['types']['CM'] = true;
        }

        // Build pivot rows + per-teacher modules_details
        $pivotRows = [];
        $detailsByTeacher = [];

        foreach ($agg as $a) {
            $m = $modules[$a['mod']] ?? null;
            if (! $m) continue;

            $types   = array_keys(array_filter($a['types']));
            $cmGroups = array_keys($a['groupsByType']['CM']);
            $tdGroups = array_keys($a['groupsByType']['TD']);
            $tpGroups = array_keys($a['groupsByType']['TP']);
            $allGroups = array_values(array_unique([...$cmGroups, ...$tdGroups, ...$tpGroups]));

            $hasCC = in_array('CM', $types, true) || in_array('TD', $types, true);
            $hasTP = in_array('TP', $types, true);
            $role  = $hasCC && $hasTP ? 'cc+tp' : ($hasTP ? 'tp' : 'cc');
            $responsable = (int) $m->enseignant_id === (int) $a['ens'];

            $pivotRows[] = [
                'enseignant_id' => $a['ens'],
                'module_id'     => $a['mod'],
                'role'          => $role,
                'responsable'   => $responsable,
                'groupes'       => json_encode($allGroups),
                'created_at'    => now(),
                'updated_at'    => now(),
            ];

            // sections covered by CM (map groups → section names)
            $sections = [];
            foreach ($cmGroups as $g) {
                $sec = $groupSection["{$m->filiere}|{$m->niveau}|{$g}"] ?? null;
                if ($sec && ! in_array($sec, $sections, true)) $sections[] = $sec;
            }

            $detailsByTeacher[$a['ens']][] = [
                'id'          => 'm' . $m->id,
                'module'      => $m->intitule,
                'moduleId'    => (int) $m->id,
                'niveau'      => $m->niveau,
                'semestre'    => $m->semestre,
                'types'       => $types,
                'sections'    => $sections,
                'tdGroups'    => $tdGroups,
                'tpGroups'    => $tpGroups,
                'responsable' => $responsable,
            ];
        }

        DB::transaction(function () use ($pivotRows, $detailsByTeacher) {
            DB::table('enseignant_module')->delete();
            foreach (array_chunk($pivotRows, 500) as $chunk) {
                DB::table('enseignant_module')->insert($chunk);
            }
            foreach (Enseignant::all() as $e) {
                $e->update(['modules_details' => $detailsByTeacher[$e->id] ?? []]);
            }
        });

        $this->command?->info('Teacher assignments rebuilt: ' . count($pivotRows) . ' module links across ' . count($detailsByTeacher) . ' teachers.');
    }
}
