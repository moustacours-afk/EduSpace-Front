import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileSpreadsheet, Download, Users, CalendarDays,
  ClipboardList, ListChecks,
  Printer, Filter, RefreshCw,
} from "lucide-react";
import { groupesParNiveau, semestresParNiveau } from "@/data/mockData";
import { getSectionsForNiveau } from "@/lib/orgStore";
import { agent as api } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3", "ING4", "ING5"];

type StudentRow = { id: string; matricule: string; nom: string; prenom: string; niveau: string; groupe: string; statut?: string };

type DocCard = {
  id: string;
  titre: string;
  description: string;
  icon: React.ElementType;
  color: string;
  needsNiveau?: boolean;
  needsSection?: boolean;
  needsGroupe?: boolean;
  needsSemestre?: boolean;
  needsSession?: boolean;
};

const DOC_SECTIONS: { label: string; icon: React.ElementType; docs: DocCard[] }[] = [
  {
    label: "Listes étudiants",
    icon: Users,
    docs: [
      {
        id: "liste-section-groupe",
        titre: "Liste générale par section et groupe",
        description: "Liste nominative de tous les étudiants organisée par section puis par groupe, avec matricule.",
        icon: Users,
        color: "bg-blue-50 text-blue-700 border-blue-200",
        needsNiveau: true, needsSection: true, needsGroupe: true,
      },
      {
        id: "liste-emargement",
        titre: "Feuille d'émargement",
        description: "Liste avec colonnes de signature pour présence aux cours/TD/TP.",
        icon: ClipboardList,
        color: "bg-blue-50 text-blue-700 border-blue-200",
        needsNiveau: true, needsSection: true, needsGroupe: true,
      },
      {
        id: "liste-etudiants-statut",
        titre: "Liste des étudiants (admis / ajournés / dettes)",
        description: "Liste des étudiants après délibération avec leur statut : admis, ajourné ou ayant des dettes pédagogiques.",
        icon: ListChecks,
        color: "bg-green-50 text-green-700 border-green-200",
        needsNiveau: true, needsSection: true, needsGroupe: true, needsSession: true,
      },
    ],
  },
  {
    label: "Examens",
    icon: CalendarDays,
    docs: [
      {
        id: "emargement-examen",
        titre: "Feuille de présence examen",
        description: "Liste d'émargement spécifique à une séance d'examen (avec salle et module).",
        icon: ClipboardList,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        needsNiveau: true, needsSection: true, needsGroupe: true, needsSemestre: true,
      },
      {
        id: "liste-examen-salle",
        titre: "Liste des examens par salle",
        description: "Organisation des étudiants par salle d'examen. Chaque salle est remplie groupe par groupe.",
        icon: CalendarDays,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        needsNiveau: true, needsSection: true, needsSemestre: true,
      },
    ],
  },
];

function buildDocHtml(
  docId: string,
  opts: { niveau: string; section: string; groupe: string; semestre: string; session: string },
  students: StudentRow[],
): string {
  const titles: Record<string, string> = {
    "liste-section-groupe": "Liste Générale par Section et Groupe",
    "liste-emargement": "Feuille d'Émargement",
    "liste-etudiants-statut": "Liste des Étudiants — Admis / Ajournés / Dettes",
    "emargement-examen": "Feuille de Présence — Examen",
    "liste-examen-salle": "Liste des Examens par Salle",
  };

  const title = titles[docId] ?? "Document";
  const parts = [
    opts.niveau && `Niveau : ${opts.niveau}`,
    opts.section && opts.section !== "Tous" && `Section : ${opts.section}`,
    opts.groupe && opts.groupe !== "Tous" && `Groupe : ${opts.groupe}`,
    opts.semestre && `Semestre : ${opts.semestre}`,
    opts.session && `Session : ${opts.session}`,
  ].filter(Boolean);
  const infoLine = parts.join(" &nbsp;|&nbsp; ");

  const extraStatutCol = docId === "liste-etudiants-statut";
  const lastColHeader =
    docId === "liste-emargement" || docId === "emargement-examen"
      ? "Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
      : extraStatutCol
      ? "Statut (Admis / Ajourné / Dettes)"
      : "Observations";

  if (docId === "liste-examen-salle") {
    const groupes = opts.groupe !== "Tous" ? [opts.groupe] : ["Groupe 1", "Groupe 2", "Groupe 3"];
    const salles = ["Salle A101", "Salle A102", "Salle B201"];
    const studentsPerSalle = 30;

    const pages = salles.map((salle, si) => {
      const groupeRows = groupes.map((g, gi) => {
        const grpStudents = students.filter(s => s.groupe === g);
        const sliced = grpStudents.slice(si * studentsPerSalle + gi * 10, si * studentsPerSalle + gi * 10 + 10);
        const rows = sliced.length > 0
          ? sliced.map((s, ri) => `<tr>
              <td style="border:1px solid #bbb;padding:5px;text-align:center;font-size:11px">${si * studentsPerSalle + gi * 10 + ri + 1}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px">${s.matricule}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px">${s.prenom} ${s.nom}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px">${g}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px"></td>
            </tr>`).join("")
          : Array.from({ length: 10 }, (_, ri) => `<tr>
              <td style="border:1px solid #bbb;padding:5px;text-align:center;font-size:11px">${si * studentsPerSalle + gi * 10 + ri + 1}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px"></td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px"></td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px">${g}</td>
              <td style="border:1px solid #bbb;padding:5px;font-size:11px"></td>
            </tr>`).join("");
        return `<tr><td colspan="5" style="background:#e8e8f0;padding:4px 6px;font-weight:bold;font-size:11px">${g}</td></tr>${rows}`;
      }).join("");

      return `<div style="page-break-after: always; margin-bottom: 20px">
        <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:14px">
          <p style="margin:2px 0;font-size:11px;color:#555">République Algérienne Démocratique et Populaire — Ministère de l'Enseignement Supérieur</p>
          <h3 style="margin:6px 0;font-size:14px">Liste des Examens par Salle — ${opts.semestre}</h3>
          <p style="font-size:12px;font-weight:bold">Salle : ${salle} &nbsp;|&nbsp; ${infoLine}</p>
        </div>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr style="background:#e8e8f0">
            <th style="border:1px solid #bbb;padding:5px;font-size:11px">N°</th>
            <th style="border:1px solid #bbb;padding:5px;font-size:11px">Matricule</th>
            <th style="border:1px solid #bbb;padding:5px;font-size:11px">Nom et Prénom</th>
            <th style="border:1px solid #bbb;padding:5px;font-size:11px">Groupe</th>
            <th style="border:1px solid #bbb;padding:5px;font-size:11px">Signature</th>
          </tr></thead>
          <tbody>${groupeRows}</tbody>
        </table>
      </div>`;
    }).join("");

    return `<html><head><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px}
      @media print{button{display:none} .page-break{page-break-after:always}}
    </style></head>
    <body>
      <button onclick="window.print()" style="margin-bottom:14px;padding:7px 14px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimer</button>
      ${pages}
    </body></html>`;
  }

  // Standard single-page documents — populate with real students
  const studentRows = students.length > 0
    ? students.map((s, i) => `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${s.matricule}</td>
        <td>${s.nom}</td>
        <td>${s.prenom}</td>
        ${opts.section && opts.section !== "Tous" ? "" : "<td>—</td>"}
        <td>${s.groupe}</td>
        <td>${extraStatutCol ? (s.statut ?? "—") : ""}</td>
      </tr>`).join("")
    : Array.from({ length: 15 }, (_, i) => `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td></td><td></td><td></td>
        ${opts.section && opts.section !== "Tous" ? "" : "<td></td>"}
        <td>${opts.groupe !== "Tous" ? opts.groupe : "—"}</td><td></td>
      </tr>`).join("");

  return `<html><head><title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;color:#111}
    .header{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:16px}
    .header p{margin:2px 0;font-size:11px;color:#555}
    .header h2{margin:6px 0 2px;font-size:15px}
    .header h3{margin:4px 0;font-size:13px;text-decoration:underline}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #bbb;padding:5px 8px;font-size:11px}
    th{background:#e8e8f0;font-weight:bold}
    @media print{button{display:none}}
  </style></head>
  <body>
    <div class="header">
      <p>République Algérienne Démocratique et Populaire</p>
      <p>Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
      <h2>Université Oran 1 Ahmed Ben Bella</h2>
      <p>Faculté d'Informatique — Département Informatique</p>
      <p style="margin-top:6px;font-size:12px">Année Académique 2025-2026 &nbsp;|&nbsp; ${infoLine}</p>
      <h3>${title}</h3>
    </div>
    <button onclick="window.print()" style="margin-bottom:14px;padding:7px 14px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimer</button>
    <table>
      <thead><tr>
        <th>N°</th><th>Matricule</th><th>Nom</th><th>Prénom</th>
        ${opts.section && opts.section !== "Tous" ? "" : "<th>Section</th>"}
        <th>Groupe</th>
        <th>${lastColHeader}</th>
      </tr></thead>
      <tbody>${studentRows}</tbody>
    </table>
    <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:11px">
      <div><p><b>Le Chef de Département</b></p><br/><br/><p>Signature et cachet</p></div>
      <div><p><b>L'Agent Pédagogique</b></p><br/><br/><p>Signature</p></div>
    </div>
  </body></html>`;
}

export default function AgentSheets() {
  const [filterNiveau,   setFilterNiveau]   = useState("L3");
  const [filterSection,  setFilterSection]  = useState("Tous");
  const [filterGroupe,   setFilterGroupe]   = useState("Tous");
  const [filterSemestre, setFilterSemestre] = useState("S5");
  const [filterSession,  setFilterSession]  = useState("Normale");

  const [allStudents, setAllStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const data = await api.students() as Record<string, unknown>[];
      const mapped: StudentRow[] = data.map(s => ({
        id:        String(s.id),
        matricule: String(s.matricule ?? ""),
        nom:       String(s.nom ?? ""),
        prenom:    String(s.prenom ?? ""),
        niveau:    String(s.niveau ?? ""),
        groupe:    String(s.groupe ?? ""),
        statut:    String((s as Record<string, unknown>).statut_deliberation ?? "—"),
      }));
      setAllStudents(mapped);
    } catch { /* keep empty */ }
    finally { setLoadingStudents(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Sections from orgStore (or fallback placeholders)
  const orgSections = getSectionsForNiveau(filterNiveau);
  const sectionOptions = ["Tous", ...(orgSections.length > 0
    ? orgSections.map(s => s.nom)
    : ["Section 1", "Section 2"])];

  const groupeOptions = ["Tous", ...(groupesParNiveau[filterNiveau] ?? ["Groupe 1"])];

  function handleNiveauChange(v: string) {
    setFilterNiveau(v);
    setFilterSection("Tous");
    setFilterGroupe("Tous");
    setFilterSemestre(semestresParNiveau[v]?.[0] ?? "S1");
  }

  // Filter students for the current selection
  function getFilteredStudents(): StudentRow[] {
    return allStudents.filter(s => {
      if (s.niveau !== filterNiveau) return false;
      if (filterGroupe !== "Tous" && s.groupe !== filterGroupe) return false;
      return true;
    });
  }

  function generateDoc(docId: string, action: "print" | "download") {
    const students = getFilteredStudents();
    const html = buildDocHtml(docId, {
      niveau:   filterNiveau,
      section:  filterSection,
      groupe:   filterGroupe,
      semestre: filterSemestre,
      session:  filterSession,
    }, students);

    if (action === "download") {
      const titles: Record<string, string> = {
        "liste-section-groupe":    "Liste_Generale",
        "liste-emargement":        "Feuille_Emargement",
        "liste-etudiants-statut":  "Liste_Statut",
        "emargement-examen":       "Emargement_Examen",
        "liste-examen-salle":      "Liste_Examen_Salle",
      };
      const filename = `${titles[docId] ?? "Document"}_${filterNiveau}_${filterGroupe}.html`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // print — open in new window
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                  Feuilles & Documents
                </h1>
                <p className="text-muted-foreground mt-1">Générez et exportez tous les documents pédagogiques.</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loadingStudents ? "Chargement des étudiants…" : `${allStudents.length} étudiant(s) chargé(s) depuis le système.`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={fetchStudents} disabled={loadingStudents}>
                <RefreshCw className={`w-4 h-4 ${loadingStudents ? "animate-spin" : ""}`} />Actualiser
              </Button>
            </div>
          </motion.div>

          {/* Global filters */}
          <motion.div variants={item}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Paramètres par défaut</span>
                <span className="text-xs text-muted-foreground ml-1">(appliqués à chaque document généré)</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Niveau</label>
                  <Select value={filterNiveau} onValueChange={handleNiveauChange}>
                    <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Section</label>
                  <Select value={filterSection} onValueChange={v => { setFilterSection(v); setFilterGroupe("Tous"); }}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={filterGroupe} onValueChange={setFilterGroupe}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {groupeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Semestre</label>
                  <Select value={filterSemestre} onValueChange={setFilterSemestre}>
                    <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{(semestresParNiveau[filterNiveau] ?? ["S1"]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Session</label>
                  <Select value={filterSession} onValueChange={setFilterSession}>
                    <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normale">Normale</SelectItem>
                      <SelectItem value="Rattrapage">Rattrapage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {getFilteredStudents().length} étudiant(s) correspondant aux filtres actuels.
              </p>
            </Card>
          </motion.div>

          {DOC_SECTIONS.map(section => (
            <motion.div key={section.label} variants={item}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{section.label}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.docs.map(doc => {
                  const Icon = doc.icon;
                  const borderHover = doc.color.includes("blue")
                    ? "hover:border-blue-300"
                    : doc.color.includes("green")
                    ? "hover:border-green-300"
                    : doc.color.includes("amber")
                    ? "hover:border-amber-300"
                    : "hover:border-indigo-300";
                  return (
                    <Card key={doc.id} className={`p-4 border ${borderHover} transition-colors group`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight">{doc.titre}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{doc.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.needsNiveau   && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterNiveau}</Badge>}
                            {doc.needsSection  && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterSection}</Badge>}
                            {doc.needsGroupe   && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterGroupe}</Badge>}
                            {doc.needsSemestre && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterSemestre}</Badge>}
                            {doc.needsSession  && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">Session {filterSession}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 h-8 text-xs gap-1.5"
                          onClick={() => generateDoc(doc.id, "print")}>
                          <Printer className="w-3 h-3" />Générer
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1.5"
                          title="Télécharger le document"
                          onClick={() => generateDoc(doc.id, "download")}>
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))}

        </motion.div>
      </main>
    </div>
  );
}
