import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Search, Building2, MapPin, Lock, User,
  Eye, EyeOff, CheckCircle, KeyRound, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WILAYAS, ETABLISSEMENTS_PAR_WILAYA } from "@/lib/superAgentStore";

// ─── OWNER PASSWORD ───────────────────────────────────────────────────────────
// Change this value to set the owner access password.
// Share ONLY this password with whoever is authorised to create super-agent accounts.
const OWNER_PASSWORD = "EduSpaceOwner@2024";
// ─────────────────────────────────────────────────────────────────────────────

// ── Searchable dropdown ──────────────────────────────────────────────────────
function SearchableSelect({
  label, placeholder, options, value, onChange, disabled = false,
}: {
  label: string; placeholder: string; options: string[];
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  function select(v: string) { onChange(v); setQuery(""); setOpen(false); }

  return (
    <div className="relative">
      <label className="text-xs font-medium text-slate-500 block mb-1">{label}</label>
      <div
        className={`flex items-center border rounded-lg px-3 py-2 gap-2 bg-white transition-all ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-text hover:border-purple-400"
        } ${open ? "border-purple-500 ring-1 ring-purple-200" : "border-slate-300"}`}
        onClick={() => { if (!disabled) setOpen(true); }}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        {open ? (
          <input
            autoFocus
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={`Rechercher ${placeholder.toLowerCase()}…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        ) : (
          <span className={`flex-1 text-sm truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
            {value || placeholder}
          </span>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o} type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors"
              onMouseDown={() => select(o)}
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-sm text-slate-400">
          Aucun résultat
        </div>
      )}
    </div>
  );
}

// ── Owner password gate ──────────────────────────────────────────────────────
function OwnerGate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd]       = useState("");
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState("");
  const [shake, setShake]   = useState(false);
  const [attempts, setAttempts] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === OWNER_PASSWORD) {
      onUnlock();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(`Mot de passe incorrect.${next >= 3 ? " Vérifiez vos identifiants." : ""}`);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPwd("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8 text-white">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">Accès propriétaire</h1>
          <p className="text-purple-300 text-sm mt-1 text-center">
            Saisissez le mot de passe propriétaire pour accéder à la création de comptes Super Agent.
          </p>
        </div>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  <KeyRound className="inline w-3 h-3 mr-1" />Mot de passe propriétaire
                </label>
                <div className="relative">
                  <Input
                    autoFocus
                    type={show ? "text" : "password"}
                    placeholder="Mot de passe…"
                    value={pwd}
                    onChange={e => { setPwd(e.target.value); setError(""); }}
                    className="pr-10"
                  />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShow(v => !v)}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-semibold py-5 rounded-xl">
                Accéder
              </Button>
            </form>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Ce mot de passe est réservé au propriétaire de l'application.
        </p>
      </motion.div>
    </div>
  );
}

// ── Main creation form ───────────────────────────────────────────────────────
function CreateForm() {
  const [wilaya,      setWilaya]      = useState("");
  const [universite,  setUniversite]  = useState("");
  const [nom,         setNom]         = useState("");
  const [prenom,      setPrenom]      = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  const universites  = wilaya ? (ETABLISSEMENTS_PAR_WILAYA[wilaya] ?? []) : [];

  // A Directeur is scoped to a université only (no faculté). Faculty-level
  // accounts (Doyens) are created later by the Director inside the app.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom || !prenom || !email || !password || !universite) {
      setError("Remplissez tous les champs obligatoires (*).");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email, password,
          role:        "super_agent",
          nom, prenom,
          universite,
          // No faculté → this super_agent is a Directeur (university level).
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Erreur");
      setSuccess(`Compte Directeur créé avec succès pour ${prenom} ${nom} (${universite}).`);
      setNom(""); setPrenom(""); setEmail(""); setPassword("");
      setWilaya(""); setUniversite("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-6 text-white">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Créer un Directeur d'université</h1>
            <p className="text-purple-300 text-sm">Accès réservé au propriétaire de l'application</p>
          </div>
        </div>

        <Card className="p-6 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Prénom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input className="pl-9" placeholder="Mohamed" value={prenom} onChange={e => setPrenom(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Nom *</label>
                <Input placeholder="Benali" value={nom} onChange={e => setNom(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Email *</label>
              <Input type="email" placeholder="m.benali@univ.dz" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                <Lock className="inline w-3 h-3 mr-1" />Mot de passe du compte *
              </label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />Université rattachée *
              </p>

              <SearchableSelect
                label="Wilaya (ville)"
                placeholder="Choisir une wilaya…"
                options={WILAYAS}
                value={wilaya}
                onChange={v => { setWilaya(v); setUniversite(""); }}
              />

              <div className="flex items-center gap-2 text-slate-300 text-xs pl-1">
                <MapPin className="w-3 h-3" />
                <span>{universites.length > 0 ? `${universites.length} établissement(s) dans cette wilaya` : "Sélectionner une wilaya d'abord"}</span>
              </div>

              <SearchableSelect
                label="Université / Établissement *"
                placeholder="Choisir un établissement…"
                options={universites}
                value={universite}
                onChange={setUniversite}
                disabled={universites.length === 0}
              />

              <p className="text-[11px] text-slate-400 leading-snug pt-1">
                Le compte Directeur gère toute l'université. Les comptes de faculté (Doyens)
                sont créés ensuite par le Directeur depuis l'application.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
            )}
            {success && (
              <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {success}
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 rounded-xl">
              {loading ? "Création en cours…" : "Créer le compte Directeur"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Page entry point ─────────────────────────────────────────────────────────
export default function CreateSuperAgent() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <OwnerGate onUnlock={() => setUnlocked(true)} />;
  }

  return <CreateForm />;
}
