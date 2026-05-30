import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, BookOpen, AlertCircle, CheckCircle2, Clock, BarChart2, Info } from "lucide-react";
import type { ModuleEntry } from "@/lib/superAgentStore";

// ─── constants ────────────────────────────────────────────────────────────────

const TYPE_UE_OPTIONS = [
  { value: "UEF", label: "UEF — Fondamentale",      color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "UEM", label: "UEM — Méthodologique",    color: "bg-green-100 text-green-800 border-green-200" },
  { value: "UED", label: "UED — Découverte",         color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "UET", label: "UET — Transversale",       color: "bg-purple-100 text-purple-800 border-purple-200" },
];

const NIVEAU_OPTIONS = [
  "L1 — Socle Commun",
  "L2 — Socle Commun",
  "L3 — Informatique",
  "L3 — Mathématiques",
  "M1 — Informatique",
  "M2 — Informatique",
  "ING1 — Génie Informatique",
  "ING2 — Génie Informatique",
  "ING3 — Génie Informatique",
];

const SEMESTRE_OPTIONS = ["Semestre 1", "Semestre 2", "Semestre 3", "Semestre 4", "Semestre 5", "Semestre 6"];

const DUREE_OPTIONS = ["0h30", "1h00", "1h30", "2h00", "2h30", "3h00"];

// ─── types ────────────────────────────────────────────────────────────────────

type FormState = {
  nom: string;
  code: string;
  semestre: string;
  niveau: string;
  type_ue: string;
  nature: "obligatoire" | "optionnelle";
  coefficient: number;
  credits: number;
  vhs: number;
  has_cours: boolean;
  duree_cours: string;
  has_td: boolean;
  duree_td: string;
  has_tp: boolean;
  duree_tp: string;
  pct_examen: number;
  pct_td: number;
  pct_tp: number;
};

type Errors = Partial<Record<keyof FormState | "pct_total", string>>;

const INITIAL: FormState = {
  nom: "", code: "", semestre: "", niveau: "", type_ue: "",
  nature: "obligatoire",
  coefficient: 2, credits: 3, vhs: 45,
  has_cours: true,  duree_cours: "1h30",
  has_td:    true,  duree_td:    "1h30",
  has_tp:    false, duree_tp:    "1h30",
  pct_examen: 60, pct_td: 40, pct_tp: 0,
};

// ─── props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  contextLabel: string;   // e.g. "Informatique · L3 · S5"
  initialNiveau?: string; // pre-fill niveau from parent filter
  initialSemestre?: string; // pre-fill semestre from parent filter
  onClose: () => void;
  onSave: (mod: Omit<ModuleEntry, "id">) => void;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AjoutModule({ open, contextLabel, initialNiveau, initialSemestre, onClose, onSave }: Props) {
  const [form, setForm]     = useState<FormState>({
    ...INITIAL,
    niveau:   initialNiveau   ?? "",
    semestre: initialSemestre ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved]   = useState(false);

  // Sync pre-filled values when parent filters change and modal opens
  useEffect(() => {
    if (open) {
      setForm(f => ({
        ...f,
        niveau:   initialNiveau   ?? f.niveau,
        semestre: initialSemestre ?? f.semestre,
      }));
    }
  }, [open, initialNiveau, initialSemestre]);

  // ── derived flags ──────────────────────────────────────────────────────────

  // If no TD and no TP → exam-only mode (100 %)
  const isExamOnly = !form.has_td && !form.has_tp;

  const effectivePcts = useMemo(() => {
    if (isExamOnly) return { examen: 100, td: 0, tp: 0 };
    return { examen: form.pct_examen, td: form.pct_td, tp: form.has_tp ? form.pct_tp : 0 };
  }, [isExamOnly, form.pct_examen, form.pct_td, form.pct_tp, form.has_tp]);

  const pctTotal = effectivePcts.examen + effectivePcts.td + effectivePcts.tp;
  const pctOk    = pctTotal === 100;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      // When TP is unchecked, reset its percentage to 0
      if (key === "has_tp" && !value) next.pct_tp = 0;

      // Auto-balance TD% when exam% changes (only when TD is active, no TP)
      if (key === "pct_examen" && prev.has_td && !prev.has_tp) {
        next.pct_td = Math.max(0, 100 - (value as number));
      }

      return next;
    });
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  // ── validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Errors = {};
    if (!form.nom.trim())       e.nom      = "Le nom du module est requis";
    if (!form.code.trim())      e.code     = "Le code du module est requis";
    else if (!/^[A-Z]{3}\d{3}$/.test(form.code.trim()))
                                e.code     = "Format attendu : 3 lettres + 3 chiffres (ex: UEF111)";
    if (!form.semestre)         e.semestre = "Sélectionnez un semestre";
    if (!form.niveau)           e.niveau   = "Sélectionnez un niveau";
    if (!form.type_ue)          e.type_ue  = "Sélectionnez une UE";
    if (form.coefficient < 1 || form.coefficient > 10)
                                e.coefficient = "Entre 1 et 10";
    if (form.credits < 1 || form.credits > 12)
                                e.credits     = "Entre 1 et 12";
    if (form.vhs < 1)           e.vhs         = "Volume horaire requis";
    if (!pctOk)                 e.pct_total   = `Total des pourcentages = ${pctTotal}% (doit être 100%)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!validate()) return;
    onSave({
      nom:        form.nom.trim(),
      code:       form.code.trim().toUpperCase(),
      coefficient: form.coefficient,
      credits:    form.credits,
      ue:         form.type_ue,
      nature:     form.nature,
      vhs:        form.vhs,
      has_cours:  form.has_cours,
      duree_cours: form.has_cours ? form.duree_cours : "",
      has_td:     form.has_td,
      duree_td:   form.has_td ? form.duree_td : "",
      has_tp:     form.has_tp,
      duree_tp:   form.has_tp ? form.duree_tp : "",
      pct_examen: effectivePcts.examen,
      pct_td:     effectivePcts.td,
      pct_tp:     effectivePcts.tp,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm({ ...INITIAL });
      setErrors({});
      onClose();
    }, 900);
  }

  function handleClose() {
    setForm({ ...INITIAL });
    setErrors({});
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{   scale: 0.96, opacity: 0, y: 12  }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Ajouter un module
            </h2>
            {contextLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{contextLabel}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── body (scrollable) ── */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">

          {/* ── Section 1 : Informations générales ── */}
          <Section title="Informations générales" icon={<BookOpen className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom du module *" error={errors.nom}>
                <Input
                  placeholder="ex: Algorithmique Avancée"
                  value={form.nom}
                  onChange={e => set("nom", e.target.value)}
                />
              </Field>
              <Field label="Code unique *" error={errors.code}
                hint="3 lettres + 3 chiffres (ex: UEF111)">
                <Input
                  placeholder="UEF111"
                  value={form.code}
                  onChange={e => set("code", e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={6}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 2 : Contexte académique ── */}
          <Section title="Contexte académique" icon={<Info className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Semestre *" error={errors.semestre}>
                <Select value={form.semestre} onValueChange={v => set("semestre", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un semestre" /></SelectTrigger>
                  <SelectContent>
                    {SEMESTRE_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Niveau / Programme *" error={errors.niveau}>
                <Select value={form.niveau} onValueChange={v => set("niveau", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                  <SelectContent>
                    {NIVEAU_OPTIONS.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* UE type cards */}
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Unité d'Enseignement (UE) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_UE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("type_ue", opt.value)}
                    className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                      form.type_ue === opt.value
                        ? "border-purple-500 bg-purple-50 shadow-sm"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <span className={`inline-block text-[11px] font-bold px-1.5 py-0.5 rounded-md border mb-1 ${opt.color}`}>
                      {opt.value}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {opt.label.split("—")[1]?.trim()}
                    </p>
                  </button>
                ))}
              </div>
              {errors.type_ue && <ErrorMsg>{errors.type_ue}</ErrorMsg>}
            </div>

            {/* Nature */}
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground block mb-2">Nature du module</label>
              <div className="flex gap-3">
                {(["obligatoire", "optionnelle"] as const).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="nature"
                      value={v}
                      checked={form.nature === v}
                      onChange={() => set("nature", v)}
                      className="accent-purple-600"
                    />
                    <span className="text-sm capitalize">{v}</span>
                    {v === "obligatoire" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-700">Requis</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Section 3 : Coefficients & Crédits ── */}
          <Section title="Coefficient & Crédits" icon={<BarChart2 className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Coefficient (1–10) *" error={errors.coefficient}>
                <Input
                  type="number" min={1} max={10}
                  value={form.coefficient}
                  onChange={e => set("coefficient", Math.max(1, Math.min(10, Number(e.target.value))))}
                />
              </Field>
              <Field label="Crédits (1–12) *" error={errors.credits}>
                <Input
                  type="number" min={1} max={12}
                  value={form.credits}
                  onChange={e => set("credits", Math.max(1, Math.min(12, Number(e.target.value))))}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 4 : Volume horaire ── */}
          <Section title="Volume horaire" icon={<Clock className="w-4 h-4" />}>
            <Field label="VHS — Volume Horaire Semestriel (heures) *" error={errors.vhs}>
              <Input
                type="number" min={1}
                className="w-40"
                value={form.vhs}
                onChange={e => set("vhs", Math.max(1, Number(e.target.value)))}
              />
            </Field>

            <div className="mt-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Séances hebdomadaires</p>

              {/* Cours */}
              <SessionRow
                label="Cours magistral"
                checked={form.has_cours}
                onCheck={v => set("has_cours", v)}
                duration={form.duree_cours}
                onDuration={v => set("duree_cours", v)}
              />

              {/* TD */}
              <SessionRow
                label="Travaux Dirigés (TD)"
                checked={form.has_td}
                onCheck={v => set("has_td", v)}
                duration={form.duree_td}
                onDuration={v => set("duree_td", v)}
              />

              {/* TP */}
              <SessionRow
                label="Travaux Pratiques (TP)"
                checked={form.has_tp}
                onCheck={v => set("has_tp", v)}
                duration={form.duree_tp}
                onDuration={v => set("duree_tp", v)}
              />
            </div>

            {isExamOnly && (
              <div className="mt-3 flex items-start gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Module sans TD ni TP — l'évaluation sera à 100% par examen final.
              </div>
            )}
          </Section>

          {/* ── Section 5 : Mode d'évaluation ── */}
          <Section title="Mode d'évaluation" icon={<BarChart2 className="w-4 h-4" />}>
            <div className="space-y-3">

              {/* Examen */}
              <EvalRow
                label="Examen final"
                sublabel="Écrit / oral final"
                value={effectivePcts.examen}
                disabled={isExamOnly}
                onChange={v => set("pct_examen", v)}
                color="bg-blue-500"
              />

              {/* CC / TD */}
              <EvalRow
                label="Contrôle Continu (TD)"
                sublabel="Interrogations, devoirs"
                value={effectivePcts.td}
                disabled={isExamOnly || !form.has_td}
                onChange={v => set("pct_td", v)}
                color="bg-green-500"
              />

              {/* TP */}
              <AnimatePresence>
                {form.has_tp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EvalRow
                      label="Travaux Pratiques (TP)"
                      sublabel="Compte-rendu TP"
                      value={effectivePcts.tp}
                      disabled={false}
                      onChange={v => set("pct_tp", v)}
                      color="bg-amber-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Total bar */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className={`text-xs font-bold ${pctOk ? "text-green-700" : "text-red-600"}`}>
                    {pctTotal}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pctOk ? "bg-green-500" : "bg-red-400"}`}
                    style={{ width: `${Math.min(pctTotal, 100)}%` }}
                  />
                </div>
                {errors.pct_total && <ErrorMsg>{errors.pct_total}</ErrorMsg>}
              </div>
            </div>
          </Section>

        </div>

        {/* ── footer ── */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saved ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" /> Module enregistré !
              </span>
            ) : Object.keys(errors).length > 0 ? (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" />
                {Object.keys(errors).length} erreur{Object.keys(errors).length > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>Annuler</Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={handleSave}
              disabled={saved}
            >
              <Plus className="w-4 h-4" />Enregistrer le module
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-600">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground/70 mb-1">{hint}</p>}
      {children}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="w-3 h-3" />{children}
    </p>
  );
}

function SessionRow({ label, checked, onCheck, duration, onDuration }: {
  label: string; checked: boolean; onCheck: (v: boolean) => void;
  duration: string; onDuration: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={v => onCheck(Boolean(v))} id={label} />
      <label htmlFor={label} className={`text-sm flex-1 cursor-pointer ${checked ? "" : "text-muted-foreground"}`}>
        {label}
      </label>
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <Select value={duration} onValueChange={onDuration}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DUREE_OPTIONS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EvalRow({ label, sublabel, value, disabled, onChange, color }: {
  label: string; sublabel: string; value: number; disabled: boolean;
  onChange: (v: number) => void; color: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          type="number" min={0} max={100} step={5}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
          className="w-16 h-8 text-sm text-center"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  );
}
