<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * List modules with optional filters.
     * GET /api/modules?semestre=5&niveau=L3&type_ue=UEF
     */
    public function index(Request $request): JsonResponse
    {
        $query = Module::query();

        if ($request->filled('semestre')) {
            $query->where('semestre', $request->integer('semestre'));
        }
        if ($request->filled('niveau')) {
            $query->where('niveau', $request->input('niveau'));
        }
        if ($request->filled('type_ue')) {
            $query->where('type_ue', $request->input('type_ue'));
        }
        if ($request->filled('nature')) {
            $query->where('nature', $request->input('nature'));
        }

        return response()->json($query->orderBy('type_ue')->orderBy('nom')->get());
    }

    /**
     * Store a new module.
     * POST /api/modules
     */
    public function store(StoreModuleRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Enforce exam-only rule server-side before persisting
        if (!$data['has_td'] && !$data['has_tp']) {
            $data['pct_examen'] = 100;
            $data['pct_td']     = 0;
            $data['pct_tp']     = 0;
        }

        // Clear irrelevant duration fields
        if (!$data['has_cours']) $data['duree_cours'] = null;
        if (!$data['has_td'])    $data['duree_td']    = null;
        if (!$data['has_tp'])    $data['duree_tp']    = null;

        $module = Module::create($data);

        return response()->json([
            'message' => 'Module créé avec succès.',
            'data'    => $module,
        ], 201);
    }

    /**
     * Show a single module.
     * GET /api/modules/{id}
     */
    public function show(Module $module): JsonResponse
    {
        return response()->json($module);
    }

    /**
     * Update an existing module.
     * PUT /api/modules/{id}
     */
    public function update(StoreModuleRequest $request, Module $module): JsonResponse
    {
        $data = $request->validated();

        if (!$data['has_td'] && !$data['has_tp']) {
            $data['pct_examen'] = 100;
            $data['pct_td']     = 0;
            $data['pct_tp']     = 0;
        }

        if (!$data['has_cours']) $data['duree_cours'] = null;
        if (!$data['has_td'])    $data['duree_td']    = null;
        if (!$data['has_tp'])    $data['duree_tp']    = null;

        $module->update($data);

        return response()->json([
            'message' => 'Module mis à jour.',
            'data'    => $module->fresh(),
        ]);
    }

    /**
     * Soft-delete a module.
     * DELETE /api/modules/{id}
     */
    public function destroy(Module $module): JsonResponse
    {
        $module->delete();

        return response()->json(['message' => 'Module supprimé.']);
    }
}
