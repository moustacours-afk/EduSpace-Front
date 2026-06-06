<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EnseignantController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\RecourController;
use App\Http\Controllers\SuperAgentController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/ping', fn () => response()->json(['status' => 'ok', 'app' => 'EduSpace API v1']));

// ─── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ─── Étudiant ────────────────────────────────────────────────────────────
    Route::middleware('role:etudiant')->prefix('etudiant')->group(function () {
        Route::get('/profile', [EtudiantController::class, 'profile']);
        Route::get('/notes', [EtudiantController::class, 'notes']);
        Route::get('/emploi-du-temps', [EtudiantController::class, 'emploiDuTemps']);
        Route::get('/supports', [EtudiantController::class, 'supports']);
        Route::get('/annonces', [EtudiantController::class, 'annonces']);
        Route::get('/notifications', [EtudiantController::class, 'notifications']);
        Route::patch('/notifications/{id}/read', [EtudiantController::class, 'markNotificationRead']);
        Route::patch('/notifications/read-all', [EtudiantController::class, 'markAllNotificationsRead']);

        // Recours
        Route::get('/recours', [RecourController::class, 'index']);
        Route::post('/recours', [RecourController::class, 'store']);
        Route::get('/recours/for-module', [RecourController::class, 'forModule']);
        Route::patch('/recours/{id}/notified', [RecourController::class, 'markNotified']);
    });

    // ─── Enseignant ───────────────────────────────────────────────────────────
    Route::middleware('role:enseignant')->prefix('enseignant')->group(function () {
        Route::get('/profile', [EnseignantController::class, 'profile']);
        Route::get('/modules', [EnseignantController::class, 'modules']);
        Route::get('/students', [EnseignantController::class, 'students']);
        Route::get('/annonces', [EnseignantController::class, 'annonces']);

        // Grade submissions
        Route::get('/soumissions', [EnseignantController::class, 'soumissionsNotes']);
        Route::get('/soumissions/{id}/students', [EnseignantController::class, 'soumissionsNotesStudents']);
        Route::post('/soumissions/{id}/submit', [EnseignantController::class, 'soumettrNotes']);

        // Supports
        Route::get('/supports', [EnseignantController::class, 'mySupports']);
        Route::post('/supports', [EnseignantController::class, 'uploadSupport']);
        Route::delete('/supports/{id}', [EnseignantController::class, 'deleteSupport']);

        // Grades (direct submit, creates soumission if needed)
        Route::post('/grades', [EnseignantController::class, 'submitGrades']);
        Route::get('/my-permissions', [EnseignantController::class, 'myPermissions']);

        // Announcements (teacher-authored)
        Route::post('/annonces', [EnseignantController::class, 'storeAnnonce']);
        Route::delete('/annonces/{id}', [EnseignantController::class, 'deleteAnnonce']);

        // Recours
        Route::get('/recours', [EnseignantController::class, 'recours']);
        Route::post('/recours/{id}/decision', [EnseignantController::class, 'decidRecours']);
    });

    // ─── Agent pédagogique ───────────────────────────────────────────────────
    Route::middleware('role:agent')->prefix('agent')->group(function () {
        Route::get('/stats', [AgentController::class, 'stats']);

        // Students
        Route::get('/students', [AgentController::class, 'students']);
        Route::get('/students/{id}', [AgentController::class, 'showStudent']);
        Route::post('/students', [AgentController::class, 'storeStudent']);
        Route::patch('/students/{id}', [AgentController::class, 'updateStudent']);
        Route::patch('/students/{id}/account', [AgentController::class, 'updateStudentAccount']);

        // Organisation : répartition d'un niveau en sections/groupes (+ emplois du temps)
        Route::post('/organisation/repartir', [AgentController::class, 'repartir']);

        // Modules (read-only for agent)
        Route::get('/modules', [AgentController::class, 'modules']);

        // Teachers
        Route::get('/teachers', [AgentController::class, 'teachers']);
        Route::post('/teachers', [AgentController::class, 'storeTeacher']);
        Route::patch('/teachers/{id}', [AgentController::class, 'updateTeacher']);

        // Grade submissions
        Route::get('/grade-submissions', [AgentController::class, 'gradeSubmissions']);
        Route::get('/grade-submissions/{id}', [AgentController::class, 'showGradeSubmission']);
        Route::post('/grade-submissions/{id}/validate', [AgentController::class, 'validateGradeSubmission']);
        Route::post('/grade-submissions/{id}/publish', [AgentController::class, 'publishGradeSubmission']);
        Route::post('/grade-submissions/{id}/reject', [AgentController::class, 'rejectGradeSubmission']);

        // Recours validation (agent)
        Route::get('/recours/pending', [RecourController::class, 'pendingAgent']);
        Route::post('/recours/{id}/validate', [RecourController::class, 'validateAgent']);

        // Rooms
        Route::get('/salles', [AgentController::class, 'salles']);
        Route::post('/salles', [AgentController::class, 'storeSalle']);
        Route::patch('/salles/{id}', [AgentController::class, 'updateSalle']);
        Route::delete('/salles/{id}', [AgentController::class, 'destroySalle']);

        // Schedule
        Route::get('/seances', [AgentController::class, 'seances']);
        Route::post('/seances', [AgentController::class, 'storeSeance']);
        Route::patch('/seances/{id}', [AgentController::class, 'updateSeance']);
        Route::delete('/seances/{id}', [AgentController::class, 'destroySeance']);

        // Calendar
        Route::get('/evenements', [AgentController::class, 'evenements']);
        Route::post('/evenements', [AgentController::class, 'storeEvenement']);
        Route::patch('/evenements/{id}', [AgentController::class, 'updateEvenement']);
        Route::delete('/evenements/{id}', [AgentController::class, 'destroyEvenement']);

        // Deliberations
        Route::get('/deliberations', [AgentController::class, 'deliberations']);
        Route::post('/deliberations', [AgentController::class, 'storeDeliberation']);

        // Announcements
        Route::get('/annonces', [AgentController::class, 'annonces']);
        Route::post('/annonces', [AgentController::class, 'storeAnnonce']);
        Route::patch('/annonces/{id}', [AgentController::class, 'updateAnnonce']);
        Route::delete('/annonces/{id}', [AgentController::class, 'destroyAnnonce']);

        // Reinscriptions
        Route::get('/reinscriptions', [AgentController::class, 'reinscriptions']);
        Route::patch('/reinscriptions/{id}', [AgentController::class, 'updateReinscription']);

        // Enseignant permissions
        Route::get('/permissions', [AgentController::class, 'permissions']);
        Route::post('/permissions/{enseignantId}', [AgentController::class, 'updatePermission']);
        Route::delete('/permissions/{enseignantId}', [AgentController::class, 'revokePermission']);
    });

    // ─── Super Agent ─────────────────────────────────────────────────────────
    Route::middleware('role:super_agent')->prefix('super-agent')->group(function () {
        Route::get('/profile', [SuperAgentController::class, 'profile']);
        Route::get('/stats', [SuperAgentController::class, 'stats']);

        // Agents CRUD
        Route::get('/agents', [SuperAgentController::class, 'agents']);
        Route::post('/agents', [SuperAgentController::class, 'storeAgent']);
        Route::patch('/agents/{id}', [SuperAgentController::class, 'updateAgent']);
        Route::patch('/agents/{id}/status', [SuperAgentController::class, 'toggleAgentStatus']);
        Route::delete('/agents/{id}', [SuperAgentController::class, 'destroyAgent']);

        // Modules/Programmes CRUD
        Route::get('/modules', [SuperAgentController::class, 'modules']);
        Route::post('/modules', [SuperAgentController::class, 'storeModule']);
        Route::patch('/modules/{id}', [SuperAgentController::class, 'updateModule']);
        Route::delete('/modules/{id}', [SuperAgentController::class, 'destroyModule']);
    });
});
