<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Gate/Policy check goes here when auth is wired up
    }

    public function rules(): array
    {
        return [
            // ── Informations générales ─────────────────────────────────────
            'nom'         => ['required', 'string', 'max:200'],
            'code'        => ['required', 'string', 'regex:/^[A-Z]{3}\d{3}$/', 'unique:modules,code'],

            // ── Contexte académique ────────────────────────────────────────
            'semestre'    => ['required', 'integer', 'between:1,6'],
            'niveau'      => ['required', 'string', 'max:100'],

            // ── UE & nature ────────────────────────────────────────────────
            'type_ue'     => ['required', 'in:UEF,UEM,UED,UET'],
            'nature'      => ['required', 'in:obligatoire,optionnelle'],

            // ── Poids & crédits ────────────────────────────────────────────
            'coefficient' => ['required', 'integer', 'between:1,10'],
            'credits'     => ['required', 'integer', 'between:1,12'],

            // ── Volume horaire ─────────────────────────────────────────────
            'vhs'         => ['required', 'integer', 'min:1'],

            'has_cours'   => ['required', 'boolean'],
            'duree_cours' => ['nullable', 'required_if:has_cours,true', 'string', 'max:10'],

            'has_td'      => ['required', 'boolean'],
            'duree_td'    => ['nullable', 'required_if:has_td,true', 'string', 'max:10'],

            'has_tp'      => ['required', 'boolean'],
            'duree_tp'    => ['nullable', 'required_if:has_tp,true', 'string', 'max:10'],

            // ── Évaluation ─────────────────────────────────────────────────
            'pct_examen'  => ['required', 'integer', 'between:0,100'],
            'pct_td'      => ['required', 'integer', 'between:0,100'],
            'pct_tp'      => ['required', 'integer', 'between:0,100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $data = $this->validated();

            $hasTd = (bool) ($data['has_td'] ?? false);
            $hasTp = (bool) ($data['has_tp'] ?? false);

            // Exam-only rule: if no TD and no TP, exam must be 100%
            if (!$hasTd && !$hasTp) {
                if ((int) ($data['pct_examen'] ?? 0) !== 100) {
                    $validator->errors()->add(
                        'pct_examen',
                        'Sans TD ni TP, le pourcentage examen doit être 100%.'
                    );
                }
                return;
            }

            // General rule: percentages must sum to 100
            $total = (int) ($data['pct_examen'] ?? 0)
                   + (int) ($data['pct_td']     ?? 0)
                   + ($hasTp ? (int) ($data['pct_tp'] ?? 0) : 0);

            if ($total !== 100) {
                $validator->errors()->add(
                    'pct_examen',
                    "La somme des pourcentages doit être 100% (actuel : {$total}%)."
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'code.regex'        => 'Le code doit contenir 3 lettres majuscules suivies de 3 chiffres (ex: UEF111).',
            'code.unique'       => 'Ce code de module existe déjà.',
            'semestre.between'  => 'Le semestre doit être compris entre 1 et 6.',
            'coefficient.between' => 'Le coefficient doit être compris entre 1 et 10.',
            'credits.between'   => 'Les crédits doivent être compris entre 1 et 12.',
        ];
    }
}
