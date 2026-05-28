<?php

// Add this to routes/api.php:
//
// use App\Http\Controllers\ModuleController;
//
// Route::middleware('auth:sanctum')->group(function () {
//     Route::apiResource('modules', ModuleController::class);
// });

use App\Http\Controllers\ModuleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get   ('modules',        [ModuleController::class, 'index']);
    Route::post  ('modules',        [ModuleController::class, 'store']);
    Route::get   ('modules/{module}', [ModuleController::class, 'show']);
    Route::put   ('modules/{module}', [ModuleController::class, 'update']);
    Route::delete('modules/{module}', [ModuleController::class, 'destroy']);
});
