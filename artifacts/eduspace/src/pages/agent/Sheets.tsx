import { useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileSpreadsheet, Download, Users, CalendarDays, FileText, Award,
  ClipboardList, BookOpen, GraduationCap, ListChecks, ScrollText,
  Printer, Filter,
} from "lucide-react";
import { groupesParNiveau, semestresParNiveau } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2"];

type DocCard = {
  id: string;
  titre: string;
  description: string;
  icon: React.ElementType;
  color: string;
  needsNiveau?: boolean;
  needsGroupe?: boolean;
  needsSemestre?: boolean;
  needsSession?: boolean;
};

const DOC_SECTIONS: { label: string; icon: React.ElementType; docs: DocCard[] }[] = [
  {
    label: "Listes étudiants",
    icon: Users,
    docs: [
      { id: "liste-generale", titre: "Liste générale par groupe", description: "Liste nominative de tous les étudiants d'un groupe avec matricule et informations.", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200", needsNiveau: true, needsGroupe: true },
      { id: "liste-emargement", titre: "Feuille d'émargement", description: "Liste avec colonnes de signature pour présence aux cours/TD/TP.", icon: ClipboardList, color: "bg-blue-50 text-blue-700 border-blue-200", needsNiveau: true, needsGroupe: true },
      { id: "liste-admis", titre: "Liste des admis", description: "Liste des étudiants admis après délibération (session normale ou rattrapage).", icon: Award, color: "bg-green-50 text-green-700 border-green-200", needsNiveau: true, needsGroupe: true, needsSemestre: true, needsSession: true },
      { id: "liste-ajournes", titre: "Liste des ajournés / dettes", description: "Liste des étudiants ayant des modules à repasser ou dettes pédagogiques.", icon: ListChecks, color: "bg-red-50 text-red-700 border-red-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "liste-section", titre: "Liste par section", description: "Liste nominative complète d'une section regroupant tous ses groupes.", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200", needsNiveau: true },
    ],
  },
  {
    label: "Examens",
    icon: CalendarDays,
    docs: [
      { id: "convocation", titre: "Convocations d'examen individuelles", description: "Convocation nominative indiquant le jour, l'heure, la salle et les modules à passer.", icon: ScrollText, color: "bg-amber-50 text-amber-700 border-amber-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "planning-examens", titre: "Planning d'examens", description: "Tableau récapitulatif de tous les examens : modules, dates, salles et groupes.", icon: CalendarDays, color: "bg-amber-50 text-amber-700 border-amber-200", needsNiveau: true, needsSemestre: true },
      { id: "emargement-examen", titre: "Feuille de présence examen", description: "Liste d'émargement spécifique à une séance d'examen (avec salle et module).", icon: ClipboardList, color: "bg-amber-50 text-amber-700 border-amber-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "liste-jurys", titre: "Liste des jurys d'examen", description: "Composition des jurys de surveillance (enseignant, salle, créneau).", icon: Users, color: "bg-amber-50 text-amber-700 border-amber-200", needsNiveau: true, needsSemestre: true },
    ],
  },
  {
    label: "Notes",
    icon: BookOpen,
    docs: [
      { id: "fiche-notes-vierge", titre: "Fiche de notes vierge", description: "Tableau vierge à remettre à l'enseignant pour saisir les notes CC et examen.", icon: FileText, color: "bg-indigo-50 text-indigo-700 border-indigo-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "pv-saisie-notes", titre: "PV de saisie des notes", description: "Procès-verbal récapitulatif des notes soumises par les enseignants.", icon: FileText, color: "bg-indigo-50 text-indigo-700 border-indigo-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "releve-notes-prov", titre: "Relevé de notes provisoire", description: "Relevé individuel non officiel à distribuer aux étudiants après délibération.", icon: ScrollText, color: "bg-indigo-50 text-indigo-700 border-indigo-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "releve-notes-officiel", titre: "Relevé de notes officiel", description: "Document officiel cacheté remis à l'étudiant sur demande.", icon: ScrollText, color: "bg-indigo-50 text-indigo-700 border-indigo-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
    ],
  },
  {
    label: "Délibérations",
    icon: ListChecks,
    docs: [
      { id: "pv-deliberation", titre: "PV de délibération", description: "Procès-verbal officiel de la séance de délibération avec décisions du jury.", icon: FileText, color: "bg-teal-50 text-teal-700 border-teal-200", needsNiveau: true, needsGroupe: true, needsSemestre: true, needsSession: true },
      { id: "liste-admis-comp", titre: "Liste admis par compensation", description: "Liste des étudiants admis grâce à la compensation (moy. sem. ≥ 10).", icon: Award, color: "bg-teal-50 text-teal-700 border-teal-200", needsNiveau: true, needsGroupe: true, needsSemestre: true },
      { id: "tableau-resultats", titre: "Tableau synthétique des résultats", description: "Vue d'ensemble : taux de réussite, de compensation et d'ajournement.", icon: FileSpreadsheet, color: "bg-teal-50 text-teal-700 border-teal-200", needsNiveau: true, needsSemestre: true },
      { id: "pv-deliberation-annuel", titre: "PV de délibération annuelle", description: "PV récapitulatif de l'année (S1 + S2) avec décision finale de passage.", icon: FileText, color: "bg-teal-50 text-teal-700 border-teal-200", needsNiveau: true, needsGroupe: true },
    ],
  },
  {
    label: "Attestations & Administratif",
    icon: GraduationCap,
    docs: [
      { id: "attestation-reussite", titre: "Attestation de réussite", description: "Document officiel attestant la réussite de l'étudiant à une année ou un semestre.", icon: Award, color: "bg-purple-50 text-purple-700 border-purple-200", needsNiveau: true },
      { id: "attestation-scolarite", titre: "Attestation de scolarité", description: "Attestation confirmant l'inscription de l'étudiant pour l'année en cours.", icon: ScrollText, color: "bg-purple-50 text-purple-700 border-purple-200", needsNiveau: true },
      { id: "fiche-reinscription", titre: "Fiche récapitulative de réinscription", description: "Synthèse du dossier de réinscription d'un ou de tous les étudiants.", icon: ClipboardList, color: "bg-purple-50 text-purple-700 border-purple-200", needsNiveau: true },
      { id: "programme-peda", titre: "Programme pédagogique (fiche UE)", description: "Fiche descriptive des unités d'enseignement par semestre : modules, coefficients, crédits.", icon: BookOpen, color: "bg-purple-50 text-purple-700 border-purple-200", needsNiveau: true, needsSemestre: true },
      { id: "bordereau-versement", titre: "Bordereau de versement", description: "Document récapitulatif des paiements des frais de scolarité.", icon: FileText, color: "bg-purple-50 text-purple-700 border-purple-200" },
    ],
  },
];

function generateDoc(docId: string, opts: { niveau: string; groupe: string; semestre: string; session: string }) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const titles: Record<string, string> = {
    "liste-generale": "Liste Générale des Étudiants",
    "liste-emargement": "Feuille d'Émargement",
    "liste-admis": "Liste des Étudiants Admis",
    "liste-ajournes": "Liste des Ajournés / Dettes",
    "liste-section": "Liste par Section",
    "convocation": "Convocations d'Examen",
    "planning-examens": "Planning des Examens",
    "emargement-examen": "Feuille de Présence — Examen",
    "liste-jurys": "Liste des Jurys de Surveillance",
    "fiche-notes-vierge": "Fiche de Notes (vierge)",
    "pv-saisie-notes": "PV de Saisie des Notes",
    "releve-notes-prov": "Relevé de Notes Provisoire",
    "releve-notes-officiel": "Relevé de Notes Officiel",
    "pv-deliberation": "PV de Délibération",
    "liste-admis-comp": "Liste des Admis par Compensation",
    "tableau-resultats": "Tableau Synthétique des Résultats",
    "pv-deliberation-annuel": "PV de Délibération Annuelle",
    "attestation-reussite": "Attestation de Réussite",
    "attestation-scolarite": "Attestation de Scolarité",
    "fiche-reinscription": "Fiche de Réinscription",
    "programme-peda": "Programme Pédagogique",
    "bordereau-versement": "Bordereau de Versement",
  };

  const title = titles[docId] ?? "Document";
  const infoLine = [opts.niveau && `Niveau : ${opts.niveau}`, opts.groupe && `Groupe : ${opts.groupe}`, opts.semestre && `Semestre : ${opts.semestre}`, opts.session && `Session : ${opts.session}`].filter(Boolean).join(" &nbsp;|&nbsp; ");

  win.document.write(`<html><head><title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;color:#111}
    .header{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:16px}
    .header p{margin:2px 0;font-size:11px;color:#555}
    .header h2{margin:6px 0 2px;font-size:15px}
    .header h3{margin:4px 0;font-size:13px;text-decoration:underline}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #bbb;padding:5px 8px;font-size:11px}
    th{background:#e8e8f0;font-weight:bold}
    .placeholder{color:#aaa;font-style:italic;text-align:center;padding:20px}
    @media print{button{display:none}}
  </style></head>
  <body>
    <div class="header">
      <p>République Algérienne Démocratique et Populaire</p>
      <p>Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
      <h2>Université des Sciences et de la Technologie Houari Boumediene</h2>
      <p>Faculté d'Informatique — Département Informatique</p>
      <p style="margin-top:6px;font-size:12px">Année Académique 2025-2026 &nbsp;|&nbsp; ${infoLine}</p>
      <h3>${title}</h3>
    </div>
    <button onclick="window.print()" style="margin-bottom:14px;padding:7px 14px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🖨 Imprimer</button>
    <table>
      <thead><tr><th>N°</th><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Groupe</th><th>${
        docId === "liste-emargement" || docId === "emargement-examen" ? "Signature 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" :
        docId === "liste-admis" || docId === "liste-admis-comp" ? "Décision" :
        docId === "fiche-notes-vierge" ? "Note CC" :
        docId === "releve-notes-prov" || docId === "releve-notes-officiel" ? "Moy. Sem." :
        "Observations"
      }</th>${docId === "fiche-notes-vierge" ? "<th>Note Exam</th><th>Moyenne</th>" : ""}</tr></thead>
      <tbody>
        ${Array.from({ length: 15 }, (_, i) => `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td></td><td></td><td></td><td>${opts.groupe || "—"}</td><td></td>
          ${docId === "fiche-notes-vierge" ? "<td></td><td></td>" : ""}
        </tr>`).join("")}
      </tbody>
    </table>
    <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:11px">
      <div><p><b>Le Chef de Département</b></p><br/><br/><p>Signature et cachet</p></div>
      <div><p><b>L'Agent Pédagogique</b></p><br/><br/><p>Signature</p></div>
    </div>
  </body></html>`);
  win.document.close();
}

export default function AgentSheets() {
  const [filterNiveau,   setFilterNiveau]   = useState("L3");
  const [filterGroupe,   setFilterGroupe]   = useState("Groupe 2");
  const [filterSemestre, setFilterSemestre] = useState("S5");
  const [filterSession,  setFilterSession]  = useState("Normale");

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
                <p className="text-muted-foreground mt-1">Générez et exportez tous les documents pédagogiques et administratifs.</p>
              </div>
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
                  <Select value={filterNiveau} onValueChange={v => { setFilterNiveau(v); setFilterGroupe(groupesParNiveau[v]?.[0] ?? "Groupe 1"); setFilterSemestre(semestresParNiveau[v]?.[0] ?? "S1"); }}>
                    <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={filterGroupe} onValueChange={setFilterGroupe}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{(groupesParNiveau[filterNiveau] ?? ["Groupe 1"]).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
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
                  return (
                    <Card key={doc.id} className={`p-4 border ${doc.color.includes("blue") ? "hover:border-blue-300" : doc.color.includes("green") ? "hover:border-green-300" : doc.color.includes("amber") ? "hover:border-amber-300" : doc.color.includes("teal") ? "hover:border-teal-300" : doc.color.includes("indigo") ? "hover:border-indigo-300" : "hover:border-purple-300"} transition-colors group`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight">{doc.titre}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{doc.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.needsNiveau   && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterNiveau}</Badge>}
                            {doc.needsGroupe   && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterGroupe}</Badge>}
                            {doc.needsSemestre && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{filterSemestre}</Badge>}
                            {doc.needsSession  && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">Session {filterSession}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => generateDoc(doc.id, { niveau: filterNiveau, groupe: filterGroupe, semestre: filterSemestre, session: filterSession })}>
                          <Printer className="w-3 h-3" />Générer
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => generateDoc(doc.id, { niveau: filterNiveau, groupe: filterGroupe, semestre: filterSemestre, session: filterSession })}>
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
