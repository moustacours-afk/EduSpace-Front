import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, Plus, FolderOpen, CheckCircle } from "lucide-react";
import { supports as allSupports, modules } from "@/data/mockData";

const typeConfig = {
  cours:     { label: "Cours",     color: "bg-blue-100 text-blue-800 border-blue-200" },
  td:        { label: "TD",        color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  tp:        { label: "TP",        color: "bg-teal-100 text-teal-800 border-teal-200" },
  corriges:  { label: "Corrigés",  color: "bg-green-100 text-green-800 border-green-200" },
  exercices: { label: "Exercices", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

const teacherModules = modules.filter((m) => m.enseignant.includes("Hadj"));
const mySupports = allSupports.filter((s) => s.enseignantId === "t1");

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EnseignantSupports() {
  const [moduleFilter, setModuleFilter] = useState("Tous");
  const [showUpload, setShowUpload] = useState(false);
  const [typeSelect, setTypeSelect] = useState("cours");
  const [moduleSelect, setModuleSelect] = useState(teacherModules[0]?.intitule ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = moduleFilter === "Tous" ? mySupports : mySupports.filter((s) => s.module === moduleFilter);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploaded(false);
  }

  function handleDeposer() {
    if (!selectedFile) return;
    setUploaded(true);
    setTimeout(() => {
      setShowUpload(false);
      setSelectedFile(null);
      setUploaded(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
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
            <Button onClick={() => { setShowUpload(!showUpload); setSelectedFile(null); setUploaded(false); }} className="gap-2" data-testid="button-add-support">
              <Plus className="w-4 h-4" />
              Déposer un fichier
            </Button>
          </motion.div>

          {showUpload && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Nouveau support
                </h3>
                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">Fichier</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all text-sm ${
                        selectedFile
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/40 text-muted-foreground"
                      }`}
                      data-testid="button-choose-file"
                    >
                      <FolderOpen className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">
                        {selectedFile ? selectedFile.name : "Cliquer pour sélectionner un fichier…"}
                      </span>
                      {selectedFile && (
                        <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                          {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground mt-1">Formats acceptés : PDF, PPT, PPTX, DOC, DOCX, ZIP</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Module</label>
                    <Select value={moduleSelect} onValueChange={setModuleSelect}>
                      <SelectTrigger data-testid="select-module-upload">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherModules.map((m) => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select value={typeSelect} onValueChange={setTypeSelect}>
                      <SelectTrigger data-testid="select-type-upload">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>Annuler</Button>
                    <Button
                      onClick={handleDeposer}
                      disabled={!selectedFile || uploaded}
                      className="gap-2"
                      data-testid="button-confirm-upload"
                    >
                      {uploaded ? (
                        <><CheckCircle className="w-4 h-4" />Déposé !</>
                      ) : (
                        <><Upload className="w-4 h-4" />Déposer</>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-56" data-testid="select-module-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les modules</SelectItem>
                {teacherModules.map((m) => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            {filtered.map((s) => {
              const conf = typeConfig[s.type];
              return (
                <Card key={s.id} className="p-4" data-testid={`support-item-${s.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{s.nom}</p>
                      <p className="text-xs text-muted-foreground">{s.module} — {s.taille} — {s.uploadDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                      <Badge variant="outline" className="text-xs uppercase">{s.format}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-${s.id}`}>
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
