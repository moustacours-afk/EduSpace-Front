export type AgentAccount = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  wilaya: string;
  etablissement: string;
  createdAt: string;
  active: boolean;
};

export type ModuleEntry = {
  id: string;
  nom: string;
  coefficient: number;
  credits: number;
  ue: string;
};

export type SemestreModules = {
  semestre: string;
  modules: ModuleEntry[];
};

export type NiveauProgram = {
  niveau: string;
  semestres: SemestreModules[];
};

const AGENTS_KEY = "superAgent_agents";
const MODULES_KEY = "superAgent_modules";

export const NIVEAUX_LIST = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3"];

export const SEMESTRES_PAR_NIVEAU: Record<string, string[]> = {
  L1: ["S1", "S2"], L2: ["S3", "S4"], L3: ["S5", "S6"],
  M1: ["S1", "S2"], M2: ["S3", "S4"],
  ING1: ["S1", "S2"], ING2: ["S3", "S4"], ING3: ["S5", "S6"],
};

export const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane",
];

const DEFAULT_MODULES: Record<string, ModuleEntry[]> = {
  "L1-S1": [
    { id: "l1s1-1", nom: "Algorithmique 1", coefficient: 3, credits: 6, ue: "UEF 1.1" },
    { id: "l1s1-2", nom: "Architecture des Ordinateurs", coefficient: 2, credits: 4, ue: "UEF 1.1" },
    { id: "l1s1-3", nom: "Analyse 1", coefficient: 3, credits: 6, ue: "UEM 1.1" },
    { id: "l1s1-4", nom: "Algèbre 1", coefficient: 2, credits: 4, ue: "UEM 1.1" },
    { id: "l1s1-5", nom: "Langue Française", coefficient: 1, credits: 1, ue: "UET 1.1" },
    { id: "l1s1-6", nom: "Anglais Technique", coefficient: 1, credits: 1, ue: "UET 1.1" },
  ],
  "L1-S2": [
    { id: "l1s2-1", nom: "Algorithmique 2", coefficient: 3, credits: 6, ue: "UEF 1.2" },
    { id: "l1s2-2", nom: "Systèmes d'Exploitation 1", coefficient: 2, credits: 4, ue: "UEF 1.2" },
    { id: "l1s2-3", nom: "Analyse 2", coefficient: 3, credits: 6, ue: "UEM 1.2" },
    { id: "l1s2-4", nom: "Probabilités & Statistiques", coefficient: 2, credits: 4, ue: "UEM 1.2" },
  ],
  "L2-S3": [
    { id: "l2s3-1", nom: "Structures de Données", coefficient: 3, credits: 6, ue: "UEF 2.1" },
    { id: "l2s3-2", nom: "Programmation Orientée Objet", coefficient: 3, credits: 6, ue: "UEF 2.1" },
    { id: "l2s3-3", nom: "Systèmes d'Exploitation 2", coefficient: 2, credits: 4, ue: "UEF 2.2" },
    { id: "l2s3-4", nom: "Recherche Opérationnelle", coefficient: 2, credits: 4, ue: "UEM 2.1" },
  ],
  "L2-S4": [
    { id: "l2s4-1", nom: "Base de Données 1", coefficient: 3, credits: 6, ue: "UEF 2.3" },
    { id: "l2s4-2", nom: "Réseaux 1", coefficient: 2, credits: 4, ue: "UEF 2.3" },
    { id: "l2s4-3", nom: "Compilation", coefficient: 3, credits: 6, ue: "UEF 2.4" },
    { id: "l2s4-4", nom: "Logique Mathématique", coefficient: 2, credits: 4, ue: "UEM 2.2" },
  ],
  "L3-S5": [
    { id: "l3s5-1", nom: "Algorithmique Avancée", coefficient: 3, credits: 6, ue: "UEF 1.1" },
    { id: "l3s5-2", nom: "Structures de Données", coefficient: 2, credits: 4, ue: "UEF 1.1" },
    { id: "l3s5-3", nom: "Base de Données", coefficient: 3, credits: 6, ue: "UEF 1.2" },
    { id: "l3s5-4", nom: "Réseaux Informatiques", coefficient: 2, credits: 4, ue: "UEF 1.2" },
    { id: "l3s5-5", nom: "Systèmes d'Exploitation", coefficient: 2, credits: 4, ue: "UET 1.1" },
    { id: "l3s5-6", nom: "Analyse Mathématique", coefficient: 2, credits: 2, ue: "UEM 1.1" },
  ],
  "L3-S6": [
    { id: "l3s6-1", nom: "Compilation", coefficient: 3, credits: 6, ue: "UEF 2.1" },
    { id: "l3s6-2", nom: "Intelligence Artificielle", coefficient: 2, credits: 4, ue: "UEF 2.1" },
    { id: "l3s6-3", nom: "Sécurité Informatique", coefficient: 2, credits: 4, ue: "UEF 2.2" },
    { id: "l3s6-4", nom: "Génie Logiciel", coefficient: 2, credits: 4, ue: "UEF 2.2" },
    { id: "l3s6-5", nom: "Développement Web", coefficient: 2, credits: 2, ue: "UEO 2.1" },
  ],
  "M1-S1": [
    { id: "m1s1-1", nom: "Apprentissage Automatique", coefficient: 3, credits: 6, ue: "UEF 1.1" },
    { id: "m1s1-2", nom: "Traitement du Signal", coefficient: 2, credits: 4, ue: "UEF 1.1" },
    { id: "m1s1-3", nom: "Réseaux Avancés", coefficient: 3, credits: 6, ue: "UEF 1.2" },
  ],
  "M1-S2": [
    { id: "m1s2-1", nom: "Deep Learning", coefficient: 3, credits: 6, ue: "UEF 2.1" },
    { id: "m1s2-2", nom: "Big Data", coefficient: 3, credits: 6, ue: "UEF 2.1" },
    { id: "m1s2-3", nom: "Cloud Computing", coefficient: 2, credits: 4, ue: "UEF 2.2" },
  ],
};

function loadAgents(): AgentAccount[] {
  try { return JSON.parse(localStorage.getItem(AGENTS_KEY) ?? "[]"); }
  catch { return []; }
}

function saveAgents(a: AgentAccount[]) {
  localStorage.setItem(AGENTS_KEY, JSON.stringify(a));
}

function loadModules(): NiveauProgram[] {
  try {
    const stored = JSON.parse(localStorage.getItem(MODULES_KEY) ?? "null");
    if (stored) return stored;
  } catch {}
  return NIVEAUX_LIST.map(niveau => ({
    niveau,
    semestres: (SEMESTRES_PAR_NIVEAU[niveau] ?? ["S1", "S2"]).map(semestre => ({
      semestre,
      modules: DEFAULT_MODULES[`${niveau}-${semestre}`] ?? [],
    })),
  }));
}

function saveModules(m: NiveauProgram[]) {
  localStorage.setItem(MODULES_KEY, JSON.stringify(m));
}

export function getAgents(): AgentAccount[] { return loadAgents(); }

export function createAgent(data: Omit<AgentAccount, "id" | "createdAt">): AgentAccount {
  const agents = loadAgents();
  const agent: AgentAccount = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  saveAgents([...agents, agent]);
  return agent;
}

export function deleteAgent(id: string) {
  saveAgents(loadAgents().filter(a => a.id !== id));
}

export function toggleAgentActive(id: string) {
  const agents = loadAgents();
  const idx = agents.findIndex(a => a.id === id);
  if (idx !== -1) { agents[idx].active = !agents[idx].active; saveAgents(agents); }
}

export function getModules(): NiveauProgram[] { return loadModules(); }

export function addModule(niveau: string, semestre: string, mod: Omit<ModuleEntry, "id">) {
  const programs = loadModules();
  const prog = programs.find(p => p.niveau === niveau);
  const sem = prog?.semestres.find(s => s.semestre === semestre);
  if (sem) { sem.modules.push({ ...mod, id: crypto.randomUUID() }); saveModules(programs); }
}

export function removeModule(niveau: string, semestre: string, moduleId: string) {
  const programs = loadModules();
  const prog = programs.find(p => p.niveau === niveau);
  const sem = prog?.semestres.find(s => s.semestre === semestre);
  if (sem) { sem.modules = sem.modules.filter(m => m.id !== moduleId); saveModules(programs); }
}
