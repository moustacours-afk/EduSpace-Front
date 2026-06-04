import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Trash2, Plus, FolderOpen, CheckCircle, Loader2 } from "lucide-react";
import { enseignant as api } from "@/lib/api";

const typeConfig: Record<string, { label: string; color: string }> = {
  cours:     { label: "Cours",     color: "bg-blue-100 text-blue-800 border-blue-200" },
  td:        { label: "TD",        color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  tp:        { label: "TP",        color: "bg-teal-100 text-teal-800 border-teal-200" },
  corriges:  { label: "Corrigés",  color: "bg-green-100 text-green-800 border-green-200" },
  exercices: { label: "Exercices", color: "bg-purple-100 text-purple-800 border-purple-200" },
  autre:     { label: "Autre",     color: "bg-gray-100 text-gray-700 border-gray-200" },
};

interface SupportRow {
  id: number;
  moduleId: number;
  module: string;
  nom: string;
  type: string;
  format: string;
  taille: string | null;
  uploadDate: string;
}

interface ModuleRow { id: number; intitule: string; }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EnseignantSupports() {
  const [supports, setSupports] = useState<SupportRow[]>([]);
  const [myModules, setMyModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [moduleFilter, setModuleFilter] = useState("Tous");
  const [showUpload, setShowUpload]   = useState(false);
  const [typeSelect, setTypeSelect]   = useState("cours");
  const [moduleSelect, setModuleSelect] = useState("");
  const [nomSupport, setNomSupport]   = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploaded, setUploaded]       = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSupports = useCallback(async () => {
    try {
      const data = await api.supports() as SupportRow[];
      setSupports(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSupports();
    api.modules().then((data) => {
      const mods = (data as Record<string, unknown>[]).map(m => ({
        id: Number(m.id), intitule: String(m.intitule ?? ""),
      }));
      setMyModules(mods);
      if (mods.length > 0) setModuleSelect(String(mods[0].id));
    }).catch(() => {});
  }, [fetchSupports]);

  const filtered = moduleFilter === "Tous"
    ? supports
    : supports.filter(s => s.module === moduleFilter);

  const MAX_FILE_MB = 50;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(null);
    setUploaded(false);
    setUploadError("");
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`Le fichier dépasse la taille maximale autorisée (${MAX_FILE_MB} Mo). Votre fichier : ${(file.size / 1024 / 1024).toFixed(1)} Mo.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    if (!nomSupport) setNomSupport(file.name.replace(/\.[^/.]+$/, ""));
  }

  async function handleDeposer() {
    if (!selectedFile || !moduleSelect) return;
    setUploading(true);
    setUploadError("");
    try {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase() ?? "autre";
      const formatMap: Record<string, string> = { pdf: "pdf", ppt: "ppt", pptx: "ppt", doc: "doc", docx: "doc", zip: "zip" };
      const fd = new FormData();
      fd.append("fichier", selectedFile);
      fd.append("module_id", moduleSelect);
      fd.append("nom", nomSupport || selectedFile.name);
      fd.append("type", typeSelect);
      fd.append("format", formatMap[ext] ?? "autre");
      await api.uploadSupport(fd);
      setUploaded(true);
      await fetchSupports();
      setTimeout(() => {
        setShowUpload(false);
        setSelectedFile(null);
        setNomSupport("");
        setUploaded(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1200);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors du dépôt.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteSupport(id);
      setSupports(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Supports de cours</h1>
              <p className="text-muted-foreground mt-1">Gérez et déposez vos ressources pédagogiques.</p>
            </div>
            <Button onClick={() => { setShowUpload(!showUpload); setSelectedFile(null); setUploaded(false); setUploadError(""); }}>
              <Plus className="w-4 h-4 mr-2" />Déposer un fichier
            </Button>
          </motion.div>

          {showUpload && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />Nouveau support
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">Fichier</label>
                    <input ref={fileInputRef} type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                      onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all text-sm ${
                        selectedFile ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/40 text-muted-foreground"
                      }`}>
                      <FolderOpen className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{selectedFile ? selectedFile.name : "Cliquer pour sélectionner un fichier…"}</span>
                      {selectedFile && <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>}
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">Formats acceptés : PDF, PPT, PPTX, DOC, DOCX, ZIP</p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Nom du support</label>
                    <Input value={nomSupport} onChange={e => setNomSupport(e.target.value)} placeholder="Titre du document" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Module</label>
                    <Select value={moduleSelect} onValueChange={setModuleSelect}>
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>
                        {myModules.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.intitule}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select value={typeSelect} onValueChange={setTypeSelect}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadError && (
                    <div className="col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{uploadError}</div>
                  )}

                  <div className="col-span-2 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>Annuler</Button>
                    <Button onClick={handleDeposer} disabled={!selectedFile || uploading || uploaded} className="gap-2">
                      {uploaded ? <><CheckCircle className="w-4 h-4" />Déposé !</>
                        : uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi…</>
                        : <><Upload className="w-4 h-4" />Déposer</>}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les modules</SelectItem>
                {myModules.map(m => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            {loading ? (
              <Card className="p-8 text-center text-muted-foreground text-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement…
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground text-sm">Aucun support déposé.</Card>
            ) : filtered.map(s => {
              const conf = typeConfig[s.type] ?? typeConfig.autre;
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{s.nom}</p>
                      <p className="text-xs text-muted-foreground">{s.module} — {s.taille ?? "—"} — {s.uploadDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                      <Badge variant="outline" className="text-xs uppercase">{s.format}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
