export const currentStudent = {
  id: "1",
  matricule: "20221234",
  nom: "Bensalem",
  prenom: "Karim",
  email: "k.bensalem@univ-alger.dz",
  filiere: "Informatique",
  niveau: "L3",
  groupe: "Groupe 2",
  anneeUniversitaire: "2024-2025",
  section: "Section A",
  departement: "Département Informatique",
  universite: "Université des Sciences et de la Technologie Houari Boumediene",
};

export const currentTeacher = {
  id: "t1",
  nom: "Hadj",
  prenom: "Mohamed",
  email: "m.hadj@univ-alger.dz",
  username: "m.hadj",
  grade: "Maître de Conférences A",
  departement: "Informatique",
  modules: ["Algorithmique", "Structures de Données", "Base de Données"],
};

export const currentAgent = {
  id: "a1",
  nom: "Ferhat",
  prenom: "Nadia",
  email: "n.ferhat@univ-alger.dz",
  role: "Agent Pédagogique",
  departement: "Scolarité - Informatique",
};

export const modules = [
  { id: "m1", code: "INF301", intitule: "Algorithmique", credits: 6, enseignant: "Dr. Mohamed Hadj", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m2", code: "INF302", intitule: "Structures de Données", credits: 6, enseignant: "Dr. Amira Ziani", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m3", code: "INF303", intitule: "Base de Données", credits: 4, enseignant: "Dr. Mohamed Hadj", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m4", code: "INF304", intitule: "Réseaux Informatiques", credits: 4, enseignant: "Dr. Yacine Bouzid", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m5", code: "INF305", intitule: "Systèmes d'Exploitation", credits: 4, enseignant: "Dr. Samia Khelif", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m6", code: "MAT301", intitule: "Analyse Mathématique", credits: 4, enseignant: "Dr. Rachid Amrani", filiere: "Informatique", niveau: "L3", semestre: "S5" },
];

export const notes = [
  { id: "n1", moduleId: "m1", module: "Algorithmique", exam: 14.5, controle: 12, tp: 15, moyenne: 13.8, creditAcquis: 6, situation: "admis" as const, semestre: "S5" },
  { id: "n2", moduleId: "m2", module: "Structures de Données", exam: 11, controle: 13, tp: 14, moyenne: 12.3, creditAcquis: 6, situation: "rattrapage" as const, semestre: "S5" },
  { id: "n3", moduleId: "m3", module: "Base de Données", exam: 16, controle: 15, tp: 17, moyenne: 16.0, creditAcquis: 4, situation: "admis" as const, semestre: "S5" },
  { id: "n4", moduleId: "m4", module: "Réseaux Informatiques", exam: 8.5, controle: 9, tp: 11, moyenne: 9.2, creditAcquis: 0, situation: "ajourne" as const, semestre: "S5" },
  { id: "n5", moduleId: "m5", module: "Systèmes d'Exploitation", exam: 13, controle: 14, tp: 15, moyenne: 13.8, creditAcquis: 4, situation: "admis" as const, semestre: "S5" },
  { id: "n6", moduleId: "m6", module: "Analyse Mathématique", exam: 12, controle: 11, tp: null, moyenne: 11.5, creditAcquis: 4, situation: "admis" as const, semestre: "S5" },
];

export const notesS6 = [
  { id: "n7", moduleId: "m7", module: "Compilation", exam: 15, controle: 13, tp: 16, moyenne: 14.7, creditAcquis: 6, situation: "admis" as const, semestre: "S6" },
  { id: "n8", moduleId: "m8", module: "Intelligence Artificielle", exam: 12, controle: 11, tp: 13, moyenne: 12.0, creditAcquis: 6, situation: "admis" as const, semestre: "S6" },
  { id: "n9", moduleId: "m9", module: "Sécurité Informatique", exam: 9, controle: 10, tp: 11, moyenne: 9.8, creditAcquis: 0, situation: "ajourne" as const, semestre: "S6" },
  { id: "n10", moduleId: "m10", module: "Génie Logiciel", exam: 14, controle: 15, tp: 14, moyenne: 14.3, creditAcquis: 4, situation: "admis" as const, semestre: "S6" },
];

export const dettes = [
  { id: "d1", module: "Réseaux Informatiques", annee: "2023-2024", exam: 8.5, moyenne: 9.2, credits: 4, session: "normal" as const },
  { id: "d2", module: "Probabilités et Statistiques", annee: "2022-2023", exam: 7.0, moyenne: 8.1, credits: 4, session: "rattrapage" as const },
];

export const seances = [
  { id: "s1", moduleId: "m1", module: "Algorithmique", type: "CM" as const, jour: "Dimanche", heureDebut: "08:00", heureFin: "10:00", salle: "Amphi A", enseignant: "Dr. Hadj", statut: "normal" as const, groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s2", moduleId: "m2", module: "Structures de Données", type: "TD" as const, jour: "Dimanche", heureDebut: "10:00", heureFin: "12:00", salle: "Salle 204", enseignant: "Dr. Ziani", statut: "normal" as const, groupes: ["Groupe 2"] },
  { id: "s3", moduleId: "m3", module: "Base de Données", type: "TP" as const, jour: "Lundi", heureDebut: "08:00", heureFin: "10:00", salle: "Labo Info 1", enseignant: "Dr. Hadj", statut: "normal" as const, groupes: ["Groupe 2"] },
  { id: "s4", moduleId: "m4", module: "Réseaux Informatiques", type: "CM" as const, jour: "Lundi", heureDebut: "10:00", heureFin: "12:00", salle: "Amphi B", enseignant: "Dr. Bouzid", statut: "annule" as const, groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s5", moduleId: "m5", module: "Systèmes d'Exploitation", type: "CM" as const, jour: "Mardi", heureDebut: "08:00", heureFin: "10:00", salle: "Amphi A", enseignant: "Dr. Khelif", statut: "normal" as const, groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s6", moduleId: "m6", module: "Analyse Mathématique", type: "TD" as const, jour: "Mardi", heureDebut: "14:00", heureFin: "16:00", salle: "Salle 110", enseignant: "Dr. Amrani", statut: "normal" as const, groupes: ["Groupe 2"] },
  { id: "s7", moduleId: "m1", module: "Algorithmique", type: "TP" as const, jour: "Mercredi", heureDebut: "10:00", heureFin: "12:00", salle: "Labo Info 2", enseignant: "Dr. Hadj", statut: "normal" as const, groupes: ["Groupe 2"] },
  { id: "s8", moduleId: "m3", module: "Base de Données", type: "TD" as const, jour: "Jeudi", heureDebut: "08:00", heureFin: "10:00", salle: "Salle 205", enseignant: "Dr. Hadj", statut: "normal" as const, groupes: ["Groupe 2"] },
  { id: "s9", moduleId: "m5", module: "Systèmes d'Exploitation", type: "TP" as const, jour: "Jeudi", heureDebut: "14:00", heureFin: "16:00", salle: "Labo Unix", enseignant: "Dr. Khelif", statut: "reporte" as const, groupes: ["Groupe 2"] },
  { id: "s10", moduleId: "m2", module: "Structures de Données", type: "TP" as const, jour: "Samedi", heureDebut: "08:00", heureFin: "10:00", salle: "Labo Info 3", enseignant: "Dr. Ziani", statut: "normal" as const, groupes: ["Groupe 2"] },
];

export const universityAnnouncements = [
  {
    id: "ua1",
    titre: "Forum des clubs étudiants 2025",
    contenu: "La Journée des Clubs se tiendra le 25 mai à la salle omnisports. Plus de 20 clubs présents : robotique, photographie, théâtre et plus encore. Inscription libre.",
    date: "2025-05-14",
    categorie: "Club",
    couleur: "bg-purple-50 border-purple-200 text-purple-800",
    icon: "🎭",
  },
  {
    id: "ua2",
    titre: "Conférence — Intelligence Artificielle et Avenir",
    contenu: "Pr. Hassan Benali donnera une conférence ouverte le 20 mai à 10h en Amphi Central. Inscription souhaitée auprès du secrétariat.",
    date: "2025-05-12",
    categorie: "Conférence",
    couleur: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "🎤",
  },
  {
    id: "ua3",
    titre: "Formation — Git & GitHub pour étudiants",
    contenu: "Formation pratique gratuite de 2 jours sur Git et GitHub. Du 22 au 23 mai, Labo Info 5. Réservez votre place via le portail.",
    date: "2025-05-10",
    categorie: "Formation",
    couleur: "bg-teal-50 border-teal-200 text-teal-800",
    icon: "💻",
  },
  {
    id: "ua4",
    titre: "Compétition nationale de programmation — Inscription ouverte",
    contenu: "Représentez votre université à la compétition nationale ICPC. Les équipes de 3 étudiants peuvent s'inscrire avant le 30 mai.",
    date: "2025-05-08",
    categorie: "Compétition",
    couleur: "bg-amber-50 border-amber-200 text-amber-800",
    icon: "🏆",
  },
];

export const supports = [
  { id: "sp1", moduleId: "m1", module: "Algorithmique", nom: "Cours 1 - Introduction aux algorithmes", type: "cours" as const, format: "pdf" as const, taille: "2.4 MB", uploadDate: "2025-02-10", enseignantId: "t1" },
  { id: "sp2", moduleId: "m1", module: "Algorithmique", nom: "TD 1 - Exercices de tri", type: "td" as const, format: "pdf" as const, taille: "1.1 MB", uploadDate: "2025-02-15", enseignantId: "t1" },
  { id: "sp3", moduleId: "m1", module: "Algorithmique", nom: "TP 1 - Implémentation Quicksort", type: "tp" as const, format: "pdf" as const, taille: "0.8 MB", uploadDate: "2025-02-20", enseignantId: "t1" },
  { id: "sp4", moduleId: "m1", module: "Algorithmique", nom: "Corrigé TD 1", type: "corriges" as const, format: "pdf" as const, taille: "1.3 MB", uploadDate: "2025-02-22", enseignantId: "t1" },
  { id: "sp5", moduleId: "m2", module: "Structures de Données", nom: "Cours 1 - Listes chaînées", type: "cours" as const, format: "ppt" as const, taille: "4.2 MB", uploadDate: "2025-02-08", enseignantId: "t2" },
  { id: "sp6", moduleId: "m2", module: "Structures de Données", nom: "TD 2 - Arbres binaires", type: "td" as const, format: "pdf" as const, taille: "1.5 MB", uploadDate: "2025-02-18", enseignantId: "t2" },
  { id: "sp7", moduleId: "m3", module: "Base de Données", nom: "Cours SQL avancé", type: "cours" as const, format: "pdf" as const, taille: "3.1 MB", uploadDate: "2025-02-12", enseignantId: "t1" },
  { id: "sp8", moduleId: "m3", module: "Base de Données", nom: "TP 2 - Requêtes complexes", type: "tp" as const, format: "pdf" as const, taille: "0.9 MB", uploadDate: "2025-02-25", enseignantId: "t1" },
  { id: "sp9", moduleId: "m4", module: "Réseaux Informatiques", nom: "Cours - Modèle OSI", type: "cours" as const, format: "ppt" as const, taille: "5.8 MB", uploadDate: "2025-02-05", enseignantId: "t3" },
  { id: "sp10", moduleId: "m5", module: "Systèmes d'Exploitation", nom: "Cours - Processus et threads", type: "cours" as const, format: "pdf" as const, taille: "2.7 MB", uploadDate: "2025-02-14", enseignantId: "t4" },
];

export const notifications = [
  { id: "notif1", message: "Le cours de Réseaux Informatiques du Lundi 10h est annulé.", type: "annulation" as const, date: "2025-05-12", lu: false },
  { id: "notif2", message: "Le TP Systèmes d'Exploitation est reporté au Jeudi 16h en Labo Unix 2.", type: "horaire" as const, date: "2025-05-11", lu: false },
  { id: "notif3", message: "Les notes de Base de Données ont été publiées.", type: "note" as const, date: "2025-05-10", lu: true },
  { id: "notif4", message: "Nouveau corrigé TD 1 disponible pour Algorithmique.", type: "note" as const, date: "2025-05-09", lu: true },
];

export const studentsForTeacher = [
  { id: "e1", matricule: "20221234", nom: "Bensalem", prenom: "Karim", groupe: "Groupe 2" },
  { id: "e2", matricule: "20221235", nom: "Ouali", prenom: "Amina", groupe: "Groupe 2" },
  { id: "e3", matricule: "20221236", nom: "Mekkaoui", prenom: "Youssef", groupe: "Groupe 2" },
  { id: "e4", matricule: "20221237", nom: "Brahimi", prenom: "Sara", groupe: "Groupe 2" },
  { id: "e5", matricule: "20221238", nom: "Cherif", prenom: "Amine", groupe: "Groupe 2" },
  { id: "e6", matricule: "20221239", nom: "Hamidi", prenom: "Lina", groupe: "Groupe 2" },
];

export const allStudents = [
  { id: "e1", matricule: "20221234", nom: "Bensalem", prenom: "Karim", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", statut: "actif" as const },
  { id: "e2", matricule: "20221235", nom: "Ouali", prenom: "Amina", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", statut: "actif" as const },
  { id: "e3", matricule: "20221236", nom: "Mekkaoui", prenom: "Youssef", filiere: "Informatique", niveau: "L2", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e4", matricule: "20221237", nom: "Brahimi", prenom: "Sara", filiere: "Mathématiques", niveau: "L1", groupe: "Groupe 3", statut: "actif" as const },
  { id: "e5", matricule: "20221238", nom: "Cherif", prenom: "Amine", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e6", matricule: "20221239", nom: "Hamidi", prenom: "Lina", filiere: "Informatique", niveau: "M1", groupe: "Groupe 1", statut: "inactif" as const },
  { id: "e7", matricule: "20211101", nom: "Kaci", prenom: "Nassim", filiere: "Physique", niveau: "L2", groupe: "Groupe 2", statut: "actif" as const },
];

export const allTeachers = [
  { id: "t1", nom: "Hadj", prenom: "Mohamed", email: "m.hadj@univ-alger.dz", grade: "MCB", departement: "Informatique", modules: 3, statut: "actif" as const },
  { id: "t2", nom: "Ziani", prenom: "Amira", email: "a.ziani@univ-alger.dz", grade: "MAA", departement: "Informatique", modules: 2, statut: "actif" as const },
  { id: "t3", nom: "Bouzid", prenom: "Yacine", email: "y.bouzid@univ-alger.dz", grade: "Professeur", departement: "Réseaux", modules: 2, statut: "actif" as const },
  { id: "t4", nom: "Khelif", prenom: "Samia", email: "s.khelif@univ-alger.dz", grade: "MCA", departement: "Systèmes", modules: 2, statut: "actif" as const },
  { id: "t5", nom: "Amrani", prenom: "Rachid", email: "r.amrani@univ-alger.dz", grade: "MCB", departement: "Mathématiques", modules: 1, statut: "inactif" as const },
];

export const pendingNotes = [
  { id: "pn1", module: "Algorithmique", enseignant: "Dr. Mohamed Hadj", type: "Examen Final", nbEtudiants: 52, dateDepot: "2025-05-10", statut: "en_attente" as const },
  { id: "pn2", module: "Structures de Données", enseignant: "Dr. Amira Ziani", type: "Contrôle 2", nbEtudiants: 48, dateDepot: "2025-05-09", statut: "en_attente" as const },
  { id: "pn3", module: "Base de Données", enseignant: "Dr. Mohamed Hadj", type: "TP Final", nbEtudiants: 25, dateDepot: "2025-05-08", statut: "valide" as const },
];

export const niveauxFiliere = [
  { id: "L1", label: "L1 Informatique", cycle: "LMD" },
  { id: "L2", label: "L2 Informatique", cycle: "LMD" },
  { id: "L3", label: "L3 Informatique", cycle: "LMD" },
  { id: "M1", label: "M1 Informatique", cycle: "Master" },
  { id: "M2", label: "M2 Informatique", cycle: "Master" },
  { id: "ING1", label: "ING1 Informatique", cycle: "Ingénieur" },
  { id: "ING2", label: "ING2 Informatique", cycle: "Ingénieur" },
  { id: "ING3", label: "ING3 Informatique", cycle: "Ingénieur" },
];

export const semestresParNiveau: Record<string, string[]> = {
  L1: ["S1", "S2"],
  L2: ["S3", "S4"],
  L3: ["S5", "S6"],
  M1: ["S1", "S2"],
  M2: ["S3", "S4"],
  // Engineering cycle S1–S10 across 5 years
  ING1: ["S1", "S2"],
  ING2: ["S3", "S4"],
  ING3: ["S5", "S6"],
  ING4: ["S7", "S8"],
  ING5: ["S9", "S10"],
};

export const groupesParNiveau: Record<string, string[]> = {
  L1: ["Groupe 1", "Groupe 2", "Groupe 3", "Groupe 4"],
  L2: ["Groupe 1", "Groupe 2", "Groupe 3"],
  L3: ["Groupe 1", "Groupe 2"],
  M1: ["Groupe 1"],
  M2: ["Groupe 1"],
  ING1: ["Groupe 1", "Groupe 2"],
  ING2: ["Groupe 1", "Groupe 2"],
  ING3: ["Groupe 1", "Groupe 2"],
  ING4: ["Groupe 1"],
  ING5: ["Groupe 1"],
};

const noms = ["Bensalem","Ouali","Mekkaoui","Brahimi","Cherif","Hamidi","Kaci","Benali","Mammeri","Zidane","Aouad","Tebbal","Hadjadj","Rahmani","Saidani","Bouzidi","Merzougui","Larbi","Guessoum","Moussaoui"];
const prenoms = ["Karim","Amina","Youssef","Sara","Amine","Lina","Nassim","Omar","Fatima","Riad","Amel","Sofiane","Imane","Bilal","Houria","Zakaria","Nour","Mehdi","Asma","Tarik"];

function makeGroup(niveau: string, groupe: string, count: number) {
  const key = `${niveau}-${groupe}`;
  return Array.from({ length: count }, (_, i) => ({
    id: `${key}-${i + 1}`,
    matricule: `2022${niveau.replace(/\D/g,"").padStart(2,"0")}${groupe.replace(/\D/g,"").padStart(1,"0")}${String(i + 1).padStart(2,"0")}`,
    nom: noms[(i * 3 + niveau.length) % noms.length],
    prenom: prenoms[(i * 2 + groupe.length) % prenoms.length],
    groupe,
  }));
}

export type TeacherRole = "cc" | "tp" | "cc+tp";

export const teacherAssignments = [
  { key: "l3-s5-algo",      intitule: "Algorithmique",             niveau: "L3",   semestre: "S5", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "l3-s5-bdd",       intitule: "Base de Données",           niveau: "L3",   semestre: "S5", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 2"] },
  { key: "l3-s6-compil",    intitule: "Compilation",               niveau: "L3",   semestre: "S6", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "l2-s3-algo",      intitule: "Algorithmique",             niveau: "L2",   semestre: "S3", responsable: false, role: "tp"    as TeacherRole, groupes: ["Groupe 1", "Groupe 2", "Groupe 3"] },
  { key: "l2-s4-sd",        intitule: "Structures de Données",     niveau: "L2",   semestre: "S4", responsable: false, role: "tp"    as TeacherRole, groupes: ["Groupe 2"] },
  { key: "l1-s1-intro",     intitule: "Introduction Algorithmique",niveau: "L1",   semestre: "S1", responsable: false, role: "cc"    as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "ing1-s2-bdd",     intitule: "Base de Données Avancée",   niveau: "ING1", semestre: "S2", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1"] },
  { key: "m1-s1-algo-adv",  intitule: "Algorithmique Avancée",     niveau: "M1",   semestre: "S1", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1"] },
];

// ─── AGENT DATA ────────────────────────────────────────────────────────────────

const nomsList = ["Bensalem","Ouali","Mekkaoui","Brahimi","Cherif","Hamidi","Kaci","Benali","Mammeri","Zidane","Aouad","Tebbal","Hadjadj","Rahmani","Saidani","Bouzidi","Merzougui","Larbi","Guessoum","Moussaoui","Ferhat","Amiri","Taleb","Saadi","Kebir","Belaid","Ouzegane","Meddah","Chikhi","Boudiaf"];
const prenomsList = ["Karim","Amina","Youssef","Sara","Amine","Lina","Nassim","Omar","Fatima","Riad","Amel","Sofiane","Imane","Bilal","Houria","Zakaria","Nour","Mehdi","Asma","Tarik","Yasmine","Hamza","Rania","Djamel","Sirine","Walid","Meriem","Lotfi","Dalila","Ismail"];
const wilayas = ["Alger","Blida","Boumerdès","Tipaza","Médéa","Aïn Defla","Tizi Ouzou","Béjaïa"];
const reinsStatuts = (["valide","valide","valide","en_attente","en_attente","rejete","incomplet"] as const);
const payStatuts = (["paye","paye","non_paye"] as const);
const docTypes = ["CNI","Attestation de naissance","Bac original","Relevé de notes","Photo d'identité","Reçu de paiement"];

export type ReinsStatut = "valide" | "en_attente" | "rejete" | "incomplet";
export type PayStatut = "paye" | "non_paye";
export type CompteStatut = "actif" | "suspendu" | "archive";

export type AgentStudent = {
  id: string; matricule: string; nom: string; prenom: string;
  dateNaissance: string; wilaya: string; filiere: string; niveau: string; groupe: string;
  email: string; statutCompte: CompteStatut;
  statutReinscription: ReinsStatut; statutPaiement: PayStatut;
  montantPaye: number; methodePayment: string; referencePayment: string; datePayment: string;
  documents: { type: string; soumis: boolean; verifie: boolean }[];
  auditTrail: { date: string; action: string; agent: string }[];
};

function buildAgentStudent(i: number): AgentStudent {
  const r = reinsStatuts[i % reinsStatuts.length];
  const p = r === "valide" ? "paye" : payStatuts[i % payStatuts.length];
  const niv = ["L1","L2","L3","M1","M2"][i % 5];
  const fil = ["Informatique","Informatique","Informatique","Mathématiques","Physique"][i % 5];
  const gr = `Groupe ${(i % 3) + 1}`;
  const mat = `2022${String(i+100).padStart(5,"0")}`;
  return {
    id: `as${i}`,
    matricule: mat,
    nom: nomsList[i % nomsList.length],
    prenom: prenomsList[(i * 3) % prenomsList.length],
    dateNaissance: `${2000 + (i % 4)}-${String((i % 12) + 1).padStart(2,"0")}-${String((i % 28) + 1).padStart(2,"0")}`,
    wilaya: wilayas[i % wilayas.length],
    filiere: fil,
    niveau: niv,
    groupe: gr,
    email: `${prenomsList[(i*3)%prenomsList.length].toLowerCase()[0]}.${nomsList[i%nomsList.length].toLowerCase()}@univ-alger.dz`,
    statutCompte: i < 25 ? "actif" : i < 28 ? "suspendu" : "archive",
    statutReinscription: r,
    statutPaiement: p,
    montantPaye: p === "paye" ? 2500 : 0,
    methodePayment: i % 2 === 0 ? "Edahabia" : "CCP",
    referencePayment: p === "paye" ? `REF${2025}${String(i).padStart(4,"0")}` : "",
    datePayment: p === "paye" ? `2025-09-${String((i % 28) + 1).padStart(2,"0")}` : "",
    documents: docTypes.map((type, di) => ({
      type,
      soumis: r !== "incomplet" || di < 4,
      verifie: r === "valide" && di < docTypes.length,
    })),
    auditTrail: r === "valide"
      ? [
          { date: `2025-09-${String((i%10)+1).padStart(2,"0")} 09:30`, action: "Dossier soumis par l'étudiant", agent: "Système" },
          { date: `2025-09-${String((i%10)+5).padStart(2,"0")} 14:20`, action: "Réinscription validée", agent: "Ferhat Nadia" },
        ]
      : [{ date: `2025-09-${String((i%10)+1).padStart(2,"0")} 09:30`, action: "Dossier soumis par l'étudiant", agent: "Système" }],
  };
}

export const agentStudents: AgentStudent[] = Array.from({ length: 30 }, (_, i) => buildAgentStudent(i));

export type AgentTeacher = {
  id: string; matricule: string; nom: string; prenom: string;
  grade: string; departement: string; email: string;
  modulesAssignes: string[]; statutCompte: CompteStatut;
  schedule: { jour: string; module: string; type: string; salle: string }[];
};

export const agentTeachers: AgentTeacher[] = [
  { id: "at1", matricule: "ENS001", nom: "Hadj", prenom: "Mohamed", grade: "MCB", departement: "Informatique", email: "m.hadj@univ-alger.dz", modulesAssignes: ["Algorithmique","Base de Données","Compilation"], statutCompte: "actif", schedule: [{jour:"Dimanche",module:"Algorithmique",type:"CM",salle:"Amphi A"},{jour:"Lundi",module:"Base de Données",type:"TP",salle:"Labo Info 1"}] },
  { id: "at2", matricule: "ENS002", nom: "Ziani", prenom: "Amira", grade: "MAA", departement: "Informatique", email: "a.ziani@univ-alger.dz", modulesAssignes: ["Structures de Données","Programmation Web"], statutCompte: "actif", schedule: [{jour:"Dimanche",module:"Structures de Données",type:"TD",salle:"Salle 204"}] },
  { id: "at3", matricule: "ENS003", nom: "Bouzid", prenom: "Yacine", grade: "Professeur", departement: "Réseaux", email: "y.bouzid@univ-alger.dz", modulesAssignes: ["Réseaux Informatiques","Sécurité Informatique"], statutCompte: "actif", schedule: [] },
  { id: "at4", matricule: "ENS004", nom: "Khelif", prenom: "Samia", grade: "MCA", departement: "Systèmes", email: "s.khelif@univ-alger.dz", modulesAssignes: ["Systèmes d'Exploitation"], statutCompte: "actif", schedule: [] },
  { id: "at5", matricule: "ENS005", nom: "Amrani", prenom: "Rachid", grade: "MCB", departement: "Mathématiques", email: "r.amrani@univ-alger.dz", modulesAssignes: ["Analyse Mathématique"], statutCompte: "suspendu", schedule: [] },
  { id: "at6", matricule: "ENS006", nom: "Benmabrouk", prenom: "Karim", grade: "MAB", departement: "Informatique", email: "k.benmabrouk@univ-alger.dz", modulesAssignes: ["Intelligence Artificielle"], statutCompte: "actif", schedule: [] },
  { id: "at7", matricule: "ENS007", nom: "Lahmar", prenom: "Fatima", grade: "MCA", departement: "Informatique", email: "f.lahmar@univ-alger.dz", modulesAssignes: ["Génie Logiciel","UML"], statutCompte: "actif", schedule: [] },
  { id: "at8", matricule: "ENS008", nom: "Djoudi", prenom: "Omar", grade: "Professeur", departement: "Mathématiques", email: "o.djoudi@univ-alger.dz", modulesAssignes: ["Algèbre","Analyse Numérique"], statutCompte: "actif", schedule: [] },
  { id: "at9", matricule: "ENS009", nom: "Belbachir", prenom: "Hocine", grade: "MCB", departement: "Informatique", email: "h.belbachir@univ-alger.dz", modulesAssignes: ["Programmation Orientée Objet"], statutCompte: "actif", schedule: [] },
  { id: "at10", matricule: "ENS010", nom: "Meftah", prenom: "Nadia", grade: "MAA", departement: "Physique", email: "n.meftah@univ-alger.dz", modulesAssignes: ["Physique Quantique"], statutCompte: "actif", schedule: [] },
];

export type GradeStatus = "en_attente" | "soumis" | "valide" | "publie";

export type GradeSubmission = {
  id: string; module: string; filiere: string; niveau: string; groupe: string;
  enseignant: string; semestre: string;
  statut: GradeStatus; dateDepot: string;
  notesSoumises: boolean; rejectionReason?: string;
  students: { matricule: string; nom: string; prenom: string; noteCC: number | null; noteExam: number | null; absent: boolean }[];
};

function mkGradeStudents(count: number, hasNotes: boolean) {
  return Array.from({ length: count }, (_, i) => ({
    matricule: `202200${String(i+1).padStart(2,"0")}`,
    nom: nomsList[i % nomsList.length],
    prenom: prenomsList[i % prenomsList.length],
    noteCC: hasNotes ? Math.round((10 + Math.random() * 10) * 4) / 4 : null,
    noteExam: hasNotes ? Math.round((8 + Math.random() * 12) * 4) / 4 : null,
    absent: !hasNotes && i === 3,
  }));
}

export const gradeSubmissions: GradeSubmission[] = [
  { id: "gs1", module: "Algorithmique", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Mohamed Hadj", semestre: "S5", statut: "soumis", dateDepot: "2025-05-10", notesSoumises: true, students: mkGradeStudents(28, true) },
  { id: "gs2", module: "Algorithmique", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Mohamed Hadj", semestre: "S5", statut: "valide", dateDepot: "2025-05-10", notesSoumises: true, students: mkGradeStudents(25, true) },
  { id: "gs3", module: "Base de Données", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Mohamed Hadj", semestre: "S5", statut: "publie", dateDepot: "2025-05-08", notesSoumises: true, students: mkGradeStudents(25, true) },
  { id: "gs4", module: "Structures de Données", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Amira Ziani", semestre: "S5", statut: "soumis", dateDepot: "2025-05-09", notesSoumises: true, students: mkGradeStudents(28, true) },
  { id: "gs5", module: "Structures de Données", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Amira Ziani", semestre: "S5", statut: "en_attente", dateDepot: "", notesSoumises: false, students: mkGradeStudents(25, false) },
  { id: "gs6", module: "Réseaux Informatiques", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Yacine Bouzid", semestre: "S5", statut: "publie", dateDepot: "2025-05-06", notesSoumises: true, students: mkGradeStudents(28, true) },
  { id: "gs7", module: "Systèmes d'Exploitation", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Samia Khelif", semestre: "S5", statut: "soumis", dateDepot: "2025-05-11", notesSoumises: true, students: mkGradeStudents(28, true) },
  { id: "gs8", module: "Analyse Mathématique", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Rachid Amrani", semestre: "S5", statut: "valide", dateDepot: "2025-05-07", notesSoumises: true, students: mkGradeStudents(25, true) },
  { id: "gs9", module: "Intelligence Artificielle", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Karim Benmabrouk", semestre: "S6", statut: "en_attente", dateDepot: "", notesSoumises: false, students: mkGradeStudents(28, false) },
  { id: "gs10", module: "Compilation", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Mohamed Hadj", semestre: "S6", statut: "soumis", dateDepot: "2025-05-12", notesSoumises: true, students: mkGradeStudents(25, true) },
  { id: "gs11", module: "Génie Logiciel", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Fatima Lahmar", semestre: "S6", statut: "publie", dateDepot: "2025-05-05", notesSoumises: true, students: mkGradeStudents(28, true) },
  { id: "gs12", module: "Sécurité Informatique", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Yacine Bouzid", semestre: "S6", statut: "valide", dateDepot: "2025-05-08", notesSoumises: true, students: mkGradeStudents(25, true) },
];

export const agentRooms = [
  { id: "r1", nom: "Amphi A", capacite: 200, type: "Amphithéâtre", disponible: true },
  { id: "r2", nom: "Amphi B", capacite: 180, type: "Amphithéâtre", disponible: true },
  { id: "r3", nom: "Salle 201", capacite: 40, type: "Salle TD", disponible: true },
  { id: "r4", nom: "Salle 204", capacite: 40, type: "Salle TD", disponible: false },
  { id: "r5", nom: "Salle 205", capacite: 40, type: "Salle TD", disponible: true },
  { id: "r6", nom: "Labo Info 1", capacite: 30, type: "Laboratoire", disponible: true },
  { id: "r7", nom: "Labo Info 2", capacite: 30, type: "Laboratoire", disponible: true },
  { id: "r8", nom: "Labo Unix", capacite: 25, type: "Laboratoire", disponible: false },
];

export const calendarEvents = [
  { id: "ce1", date: "2025-09-01", titre: "Rentrée universitaire 2025-2026", type: "green" as const, description: "Début de l'année académique" },
  { id: "ce2", date: "2025-09-01", titre: "Ouverture des réinscriptions", type: "green" as const, description: "Début de la période de réinscription pédagogique" },
  { id: "ce3", date: "2025-09-30", titre: "Date limite réinscriptions", type: "red" as const, description: "Clôture des dossiers de réinscription" },
  { id: "ce4", date: "2025-10-01", titre: "Début paiement en ligne", type: "green" as const, description: "Ouverture du paiement des frais de scolarité" },
  { id: "ce5", date: "2025-11-15", titre: "Contrôles S1 — Semaine 1", type: "blue" as const, description: "Première série de contrôles continus" },
  { id: "ce6", date: "2026-01-10", titre: "Date limite soumission notes S1", type: "red" as const, description: "Les enseignants doivent soumettre les notes" },
  { id: "ce7", date: "2026-01-20", titre: "Délibérations S1", type: "blue" as const, description: "Commission de délibération semestre 1" },
  { id: "ce8", date: "2026-01-25", titre: "Publication résultats S1", type: "red" as const, description: "Mise en ligne officielle des résultats" },
  { id: "ce9", date: "2026-02-01", titre: "Début S2", type: "green" as const, description: "Reprise des cours semestre 2" },
  { id: "ce10", date: "2026-06-15", titre: "Examens finaux S2", type: "blue" as const, description: "Session d'examens de fin de semestre" },
  { id: "ce11", date: "2026-07-01", titre: "Date limite soumission notes S2", type: "red" as const, description: "Clôture saisie des notes enseignants" },
  { id: "ce12", date: "2026-07-15", titre: "Délibérations finales", type: "blue" as const, description: "Commission de délibération annuelle" },
];

export const reinscriptionChartData = [
  { filiere: "Informatique", valide: 20, en_attente: 8, rejete: 3, incomplet: 2 },
  { filiere: "Mathématiques", valide: 14, en_attente: 6, rejete: 2, incomplet: 1 },
  { filiere: "Physique", valide: 9, en_attente: 4, rejete: 1, incomplet: 0 },
];

export const gradeStatusChartData = [
  { name: "Publié", value: 3, color: "#22c55e" },
  { name: "Validé", value: 3, color: "#3b82f6" },
  { name: "Soumis", value: 4, color: "#f59e0b" },
  { name: "En attente", value: 2, color: "#9ca3af" },
];

export const dailySubmissionsData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date("2025-05-01");
  date.setDate(date.getDate() + i);
  return {
    date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    soumis: [2,3,1,4,2,0,0,3,5,2,1,4,3,2][i],
  };
});

export const modulesParNiveauSemestre: Record<string, { id: string; intitule: string; credits: number }[]> = {
  "L1-S1": [
    { id: "l1s1-1", intitule: "Introduction à l'Informatique", credits: 6 },
    { id: "l1s1-2", intitule: "Algorithmique 1", credits: 6 },
    { id: "l1s1-3", intitule: "Mathématiques 1", credits: 6 },
    { id: "l1s1-4", intitule: "Architecture des Ordinateurs", credits: 4 },
    { id: "l1s1-5", intitule: "Électronique Numérique", credits: 4 },
  ],
  "L1-S2": [
    { id: "l1s2-1", intitule: "Algorithmique 2", credits: 6 },
    { id: "l1s2-2", intitule: "Structures de Données 1", credits: 6 },
    { id: "l1s2-3", intitule: "Mathématiques 2", credits: 6 },
    { id: "l1s2-4", intitule: "Systèmes d'Exploitation 1", credits: 4 },
    { id: "l1s2-5", intitule: "Logique Formelle", credits: 4 },
  ],
  "L2-S3": [
    { id: "l2s3-1", intitule: "Algorithmique 3", credits: 6 },
    { id: "l2s3-2", intitule: "Structures de Données 2", credits: 6 },
    { id: "l2s3-3", intitule: "Systèmes d'Exploitation 2", credits: 4 },
    { id: "l2s3-4", intitule: "Bases de Données 1", credits: 4 },
    { id: "l2s3-5", intitule: "Probabilités et Statistiques", credits: 4 },
  ],
  "L2-S4": [
    { id: "l2s4-1", intitule: "Programmation Orientée Objet", credits: 6 },
    { id: "l2s4-2", intitule: "Bases de Données 2", credits: 6 },
    { id: "l2s4-3", intitule: "Réseaux 1", credits: 4 },
    { id: "l2s4-4", intitule: "Théorie des Graphes", credits: 4 },
    { id: "l2s4-5", intitule: "Recherche Opérationnelle", credits: 4 },
  ],
  "L3-S5": [
    { id: "m1", intitule: "Algorithmique", credits: 6 },
    { id: "m2", intitule: "Structures de Données", credits: 6 },
    { id: "m3", intitule: "Base de Données", credits: 4 },
    { id: "m4", intitule: "Réseaux Informatiques", credits: 4 },
    { id: "m5", intitule: "Systèmes d'Exploitation", credits: 4 },
    { id: "m6", intitule: "Analyse Mathématique", credits: 4 },
  ],
  "L3-S6": [
    { id: "l3s6-1", intitule: "Compilation", credits: 6 },
    { id: "l3s6-2", intitule: "Intelligence Artificielle", credits: 6 },
    { id: "l3s6-3", intitule: "Sécurité Informatique", credits: 4 },
    { id: "l3s6-4", intitule: "Génie Logiciel", credits: 4 },
    { id: "l3s6-5", intitule: "Programmation Web", credits: 4 },
  ],
  "M1-S1": [
    { id: "m1s1-1", intitule: "Algorithmique Avancée", credits: 6 },
    { id: "m1s1-2", intitule: "Architecture Logicielle", credits: 6 },
    { id: "m1s1-3", intitule: "Machine Learning", credits: 6 },
    { id: "m1s1-4", intitule: "Sécurité des Systèmes", credits: 4 },
    { id: "m1s1-5", intitule: "Recherche Bibliographique", credits: 4 },
  ],
  "M1-S2": [
    { id: "m1s2-1", intitule: "Deep Learning", credits: 6 },
    { id: "m1s2-2", intitule: "Big Data", credits: 6 },
    { id: "m1s2-3", intitule: "Cloud Computing", credits: 4 },
    { id: "m1s2-4", intitule: "Projet de Recherche 1", credits: 8 },
  ],
  "M2-S3": [
    { id: "m2s3-1", intitule: "Recherche Avancée en IA", credits: 6 },
    { id: "m2s3-2", intitule: "Systèmes Embarqués", credits: 6 },
    { id: "m2s3-3", intitule: "Vision par Ordinateur", credits: 4 },
    { id: "m2s3-4", intitule: "Projet de Mémoire 1", credits: 8 },
  ],
  "M2-S4": [
    { id: "m2s4-1", intitule: "Rédaction Scientifique", credits: 4 },
    { id: "m2s4-2", intitule: "Mémoire de Master", credits: 20 },
  ],
};

export const studentsDB: Record<string, { id: string; matricule: string; nom: string; prenom: string; groupe: string }[]> = {
  "L3-Groupe 1": makeGroup("L3","Groupe 1", 28),
  "L3-Groupe 2": makeGroup("L3","Groupe 2", 25),
  "L2-Groupe 1": makeGroup("L2","Groupe 1", 30),
  "L2-Groupe 2": makeGroup("L2","Groupe 2", 29),
  "L2-Groupe 3": makeGroup("L2","Groupe 3", 27),
  "L1-Groupe 1": makeGroup("L1","Groupe 1", 35),
  "L1-Groupe 2": makeGroup("L1","Groupe 2", 34),
  "L1-Groupe 3": makeGroup("L1","Groupe 3", 33),
  "L1-Groupe 4": makeGroup("L1","Groupe 4", 32),
  "M1-Groupe 1": makeGroup("M1","Groupe 1", 20),
  "M2-Groupe 1": makeGroup("M2","Groupe 1", 18),
  "ING1-Groupe 1": makeGroup("ING1","Groupe 1", 25),
  "ING1-Groupe 2": makeGroup("ING1","Groupe 2", 24),
  "ING2-Groupe 1": makeGroup("ING2","Groupe 1", 22),
  "ING2-Groupe 2": makeGroup("ING2","Groupe 2", 21),
  "ING3-Groupe 1": makeGroup("ING3","Groupe 1", 20),
};
