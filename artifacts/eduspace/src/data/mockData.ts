// ────────────────────────────────────────────────────────────────────────────
// EduSpace — Données de démonstration (fallback hors-ligne / pages locales)
// Université Oran 1 Ahmed Ben Bella · Faculté des Sciences Exactes et Appliquées
// Département d'Informatique — Programme LMD (Licence Informatique)
// NB : le backend Laravel sert les vraies données ; ceci est le miroir local.
// ────────────────────────────────────────────────────────────────────────────

export const currentStudent = {
  id: "1",
  matricule: "222237400711",
  nom: "Kadi",
  prenom: "Islam",
  email: "i.kadi@univ-oran1.dz",
  filiere: "Informatique",
  niveau: "L3",
  groupe: "Groupe 1",
  anneeUniversitaire: "2025-2026",
  section: "Section A",
  departement: "Département Informatique",
  universite: "Université Oran 1 Ahmed Ben Bella",
};

export const currentTeacher = {
  id: "t1",
  nom: "Hadj",
  prenom: "Mohamed",
  email: "m.hadj@univ-oran1.dz",
  username: "m.hadj",
  grade: "Maître de Conférences A",
  departement: "Informatique",
  modules: ["Algorithmique et Structures de Données", "Bases de Données", "Projet de Fin de Cycle"],
};

export const currentAgent = {
  id: "a1",
  nom: "Ferhat",
  prenom: "Nadia",
  email: "n.ferhat@univ-oran1.dz",
  role: "Agent Pédagogique",
  departement: "Département d'Informatique",
};

// L3 — Semestre 5 (vue étudiant)
export const modules = [
  { id: "m1", code: "INF3501", intitule: "Systèmes d'Exploitation 2", credits: 6, enseignant: "Dr. Samia Khelifi",   filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m2", code: "INF3502", intitule: "Réseaux Informatiques",     credits: 5, enseignant: "Pr. Yacine Belkacem",  filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m3", code: "INF3503", intitule: "Génie Logiciel",            credits: 5, enseignant: "Dr. Fatima Lahmar",    filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m4", code: "INF3504", intitule: "Compilation",               credits: 4, enseignant: "Dr. Nawel Mansouri",   filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m5", code: "INF3505", intitule: "Bases de Données Avancées", credits: 6, enseignant: "Dr. Hocine Boukhalfa", filiere: "Informatique", niveau: "L3", semestre: "S5" },
  { id: "m6", code: "INF3506", intitule: "Intelligence Artificielle", credits: 4, enseignant: "Dr. Karim Benmabrouk", filiere: "Informatique", niveau: "L3", semestre: "S5" },
];

export const notes = [
  { id: "n1", moduleId: "m1", module: "Systèmes d'Exploitation 2", exam: 14.0, controle: 13, tp: 15,   moyenne: 13.8, creditAcquis: 6, situation: "admis" as const,      semestre: "S5" },
  { id: "n2", moduleId: "m2", module: "Réseaux Informatiques",     exam: 12.0, controle: 13, tp: 14,   moyenne: 12.6, creditAcquis: 5, situation: "admis" as const,      semestre: "S5" },
  { id: "n3", moduleId: "m3", module: "Génie Logiciel",            exam: 15.0, controle: 14, tp: null, moyenne: 14.6, creditAcquis: 5, situation: "admis" as const,      semestre: "S5" },
  { id: "n4", moduleId: "m4", module: "Compilation",               exam: 8.5,  controle: 9,  tp: 9.5,  moyenne: 8.7,  creditAcquis: 0, situation: "rattrapage" as const,  semestre: "S5" },
  { id: "n5", moduleId: "m5", module: "Bases de Données Avancées", exam: 13.0, controle: 14, tp: 15,   moyenne: 13.6, creditAcquis: 6, situation: "admis" as const,      semestre: "S5" },
  { id: "n6", moduleId: "m6", module: "Intelligence Artificielle", exam: 12.0, controle: 11, tp: null, moyenne: 11.6, creditAcquis: 4, situation: "admis" as const,      semestre: "S5" },
];

export const notesS6 = [
  { id: "n7",  moduleId: "m7",  module: "Sécurité Informatique",            exam: 14.0, controle: 13, tp: null, moyenne: 13.6, creditAcquis: 5, situation: "admis" as const, semestre: "S6" },
  { id: "n8",  moduleId: "m8",  module: "Programmation Web et Mobile",      exam: 13.0, controle: 14, tp: 15,   moyenne: 13.6, creditAcquis: 5, situation: "admis" as const, semestre: "S6" },
  { id: "n9",  moduleId: "m9",  module: "Systèmes Distribués",              exam: 12.0, controle: 13, tp: null, moyenne: 12.4, creditAcquis: 4, situation: "admis" as const, semestre: "S6" },
  { id: "n10", moduleId: "m10", module: "Méthodologie de Conception Logicielle", exam: 14.0, controle: 15, tp: null, moyenne: 14.4, creditAcquis: 4, situation: "admis" as const, semestre: "S6" },
];

export const dettes = [
  { id: "d1", module: "Réseaux 1",        annee: "2024-2025", exam: 8.5, moyenne: 9.2, credits: 5, session: "normal" as const },
  { id: "d2", module: "Analyse Numérique", annee: "2024-2025", exam: 7.0, moyenne: 8.1, credits: 4, session: "rattrapage" as const },
];

// Emploi du temps L3 / S5 (semaine algérienne Dimanche → Jeudi)
export const seances = [
  { id: "s1",  moduleId: "m1", module: "Systèmes d'Exploitation 2", type: "CM" as const, jour: "Dimanche", heureDebut: "08:00", heureFin: "09:30", salle: "Amphi A",       enseignant: "Dr. Khelifi",   statut: "normal" as const,  groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s2",  moduleId: "m5", module: "Bases de Données Avancées", type: "CM" as const, jour: "Dimanche", heureDebut: "09:45", heureFin: "11:15", salle: "Amphi A",       enseignant: "Dr. Boukhalfa", statut: "normal" as const,  groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s3",  moduleId: "m2", module: "Réseaux Informatiques",     type: "CM" as const, jour: "Lundi",    heureDebut: "08:00", heureFin: "09:30", salle: "Amphi B",       enseignant: "Pr. Belkacem",  statut: "normal" as const,  groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s4",  moduleId: "m3", module: "Génie Logiciel",            type: "CM" as const, jour: "Lundi",    heureDebut: "09:45", heureFin: "11:15", salle: "Amphi B",       enseignant: "Dr. Lahmar",    statut: "annule" as const,  groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s5",  moduleId: "m4", module: "Compilation",               type: "CM" as const, jour: "Mardi",    heureDebut: "08:00", heureFin: "09:30", salle: "Amphi A",       enseignant: "Dr. Mansouri",  statut: "normal" as const,  groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s6",  moduleId: "m6", module: "Intelligence Artificielle", type: "CM" as const, jour: "Mardi",    heureDebut: "09:45", heureFin: "11:15", salle: "Amphi A",       enseignant: "Dr. Benmabrouk", statut: "normal" as const, groupes: ["Groupe 1", "Groupe 2"] },
  { id: "s7",  moduleId: "m5", module: "Bases de Données Avancées", type: "TP" as const, jour: "Mercredi", heureDebut: "08:00", heureFin: "09:30", salle: "Labo BDD",      enseignant: "Dr. Boukhalfa", statut: "normal" as const,  groupes: ["Groupe 1"] },
  { id: "s8",  moduleId: "m1", module: "Systèmes d'Exploitation 2", type: "TP" as const, jour: "Mercredi", heureDebut: "09:45", heureFin: "11:15", salle: "Labo Systèmes", enseignant: "Dr. Khelifi",   statut: "reporte" as const, groupes: ["Groupe 2"] },
  { id: "s9",  moduleId: "m2", module: "Réseaux Informatiques",     type: "TP" as const, jour: "Jeudi",    heureDebut: "08:00", heureFin: "09:30", salle: "Labo Réseaux",  enseignant: "Pr. Belkacem",  statut: "normal" as const,  groupes: ["Groupe 1"] },
  { id: "s10", moduleId: "m4", module: "Compilation",               type: "TD" as const, jour: "Jeudi",    heureDebut: "09:45", heureFin: "11:15", salle: "Salle 12",      enseignant: "Dr. Mansouri",  statut: "normal" as const,  groupes: ["Groupe 2"] },
];

export const universityAnnouncements = [
  {
    id: "ua1",
    titre: "Forum des Clubs Scientifiques 2025-2026",
    contenu: "La Journée des Clubs de l'Université Oran 1 se tiendra le 26 novembre à la salle omnisports. Clubs robotique, IA, cybersécurité, photographie et plus encore. Inscription libre.",
    date: "2025-11-20",
    categorie: "Club",
    couleur: "bg-purple-50 border-purple-200 text-purple-800",
    icon: "🎭",
  },
  {
    id: "ua2",
    titre: "Conférence — Intelligence Artificielle & Société",
    contenu: "Le Pr. Hassan Benali animera une conférence ouverte le 25 novembre à 10h en Amphi A. Entrée libre dans la limite des places disponibles.",
    date: "2025-11-15",
    categorie: "Conférence",
    couleur: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "🎤",
  },
  {
    id: "ua3",
    titre: "Formation — Git & GitHub pour étudiants",
    contenu: "Formation pratique gratuite de 2 jours sur Git et GitHub, les 22 et 23 novembre au Labo BDD. Réservez votre place auprès du département.",
    date: "2025-11-10",
    categorie: "Formation",
    couleur: "bg-teal-50 border-teal-200 text-teal-800",
    icon: "💻",
  },
  {
    id: "ua4",
    titre: "Compétition de Programmation ACM/ICPC — Sélection régionale Oran",
    contenu: "Représentez le Département d'Informatique à la sélection régionale ACM/ICPC. Équipes de 3 étudiants, inscriptions avant le 5 décembre.",
    date: "2025-11-05",
    categorie: "Compétition",
    couleur: "bg-amber-50 border-amber-200 text-amber-800",
    icon: "🏆",
  },
  {
    id: "ua5",
    titre: "Avis — Clôture des réinscriptions pédagogiques",
    contenu: "La période de réinscription pédagogique est clôturée le 30 octobre. Tout dossier incomplet après cette date sera traité au cas par cas par la scolarité.",
    date: "2025-10-28",
    categorie: "Administratif",
    couleur: "bg-slate-50 border-slate-200 text-slate-800",
    icon: "📋",
  },
  {
    id: "ua6",
    titre: "Journée Portes Ouvertes — Département d'Informatique",
    contenu: "Le Département d'Informatique organise sa Journée Portes Ouvertes le 3 décembre : présentation des spécialités, projets étudiants et débouchés. Amphi A & B.",
    date: "2025-12-01",
    categorie: "Conférence",
    couleur: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "🎤",
  },
];

export const supports = [
  { id: "sp1", moduleId: "m1", module: "Systèmes d'Exploitation 2", nom: "Cours 1 — Gestion de la mémoire",        type: "cours" as const,   format: "pdf" as const, taille: "2.6 MB", uploadDate: "2025-10-05", enseignantId: "t1" },
  { id: "sp2", moduleId: "m1", module: "Systèmes d'Exploitation 2", nom: "TP 1 — Ordonnancement des processus",    type: "tp" as const,      format: "pdf" as const, taille: "0.9 MB", uploadDate: "2025-10-12", enseignantId: "t1" },
  { id: "sp3", moduleId: "m5", module: "Bases de Données Avancées", nom: "Cours — Optimisation des requêtes SQL",   type: "cours" as const,   format: "pdf" as const, taille: "3.4 MB", uploadDate: "2025-10-08", enseignantId: "t2" },
  { id: "sp4", moduleId: "m5", module: "Bases de Données Avancées", nom: "TP 2 — Indexation et transactions",      type: "tp" as const,      format: "pdf" as const, taille: "1.2 MB", uploadDate: "2025-10-18", enseignantId: "t2" },
  { id: "sp5", moduleId: "m2", module: "Réseaux Informatiques",     nom: "Cours — Couches TCP/IP",                  type: "cours" as const,   format: "ppt" as const, taille: "5.1 MB", uploadDate: "2025-10-06", enseignantId: "t3" },
  { id: "sp6", moduleId: "m3", module: "Génie Logiciel",            nom: "Cours — Cycle en V et méthodes agiles",   type: "cours" as const,   format: "pdf" as const, taille: "2.2 MB", uploadDate: "2025-10-14", enseignantId: "t4" },
  { id: "sp7", moduleId: "m4", module: "Compilation",               nom: "Cours — Analyse lexicale et syntaxique",  type: "cours" as const,   format: "pdf" as const, taille: "2.8 MB", uploadDate: "2025-10-15", enseignantId: "t4" },
  { id: "sp8", moduleId: "m4", module: "Compilation",               nom: "Corrigé TD 1 — Automates",                type: "corriges" as const, format: "pdf" as const, taille: "1.0 MB", uploadDate: "2025-10-20", enseignantId: "t4" },
];

export const notifications = [
  { id: "notif1", message: "Le cours de Réseaux Informatiques du Lundi 08h (Amphi B) est annulé.", type: "annulation" as const, date: "2025-11-24", lu: false },
  { id: "notif2", message: "Le TP de Systèmes d'Exploitation 2 est reporté au Jeudi 16h (Labo Systèmes).", type: "horaire" as const, date: "2025-11-23", lu: false },
  { id: "notif5", message: "Votre réclamation concernant la note de Compilation a bien été enregistrée.", type: "info" as const, date: "2025-11-22", lu: false },
  { id: "notif3", message: "Les notes de Bases de Données Avancées ont été publiées.", type: "note" as const, date: "2025-11-20", lu: true },
  { id: "notif4", message: "Nouveau support de cours disponible pour Génie Logiciel.", type: "info" as const, date: "2025-11-18", lu: true },
  { id: "notif6", message: "Dr. Mansouri : Rappel — TP de Compilation à rendre avant le 30 novembre.", type: "info" as const, date: "2025-11-16", lu: true },
];

export const teacherSentNotifs = [
  { id: "tsn1", recipient: "Niveau L3 — 53 étudiants",       message: "La séance de Génie Logiciel du Lundi 10h est annulée et sera rattrapée le Mercredi 14h en Amphi B.", date: "2025-11-24 09:30", statut: "Envoyé" as const },
  { id: "tsn2", recipient: "Kadi Islam — 222237400711",      message: "Rappel : votre TP de Compilation est noté et les résultats définitifs sont maintenant publiés.",       date: "2025-11-22 14:00", statut: "Envoyé" as const },
  { id: "tsn3", recipient: "Mes étudiants — 53 étudiants",   message: "Un nouveau support sur l'analyse syntaxique est disponible. Consultez-le avant la séance de jeudi.",    date: "2025-11-20 11:15", statut: "Envoyé" as const },
];

export const agentNotificationsForTeacher = [
  { id: "ant1", message: "Rappel : la date limite de soumission des notes pour le semestre S5 est le 15 janvier 2026. Veillez à soumettre avant cette date.", type: "admin" as const, date: "2025-12-20", lu: false },
  { id: "ant2", message: "Les permissions de saisie des contrôles continus ont été accordées pour le semestre S5. Vous pouvez désormais saisir vos notes.", type: "admin" as const, date: "2025-11-01", lu: false },
  { id: "ant3", message: "Réunion pédagogique obligatoire le 15 novembre 2025 à 10h en Salle de conférence. Présence requise.", type: "admin" as const, date: "2025-11-08", lu: true },
  { id: "ant4", message: "Le calendrier des délibérations du semestre S5 est disponible. Consultez-le dans votre espace ou auprès de la scolarité.", type: "admin" as const, date: "2025-10-15", lu: true },
];

export const studentsForTeacher = [
  { id: "e1", matricule: "222237400711", nom: "Kadi",     prenom: "Islam",          groupe: "Groupe 1" },
  { id: "e2", matricule: "212137045124", nom: "Loukil",   prenom: "Mohammed Ilyes", groupe: "Groupe 1" },
  { id: "e3", matricule: "222237400601", nom: "Madoui",   prenom: "Hichem Ilies",   groupe: "Groupe 1" },
  { id: "e4", matricule: "222237002608", nom: "Malki",    prenom: "Fouad",          groupe: "Groupe 1" },
  { id: "e5", matricule: "222237327504", nom: "Mana",     prenom: "Yahia",          groupe: "Groupe 1" },
  { id: "e6", matricule: "222237364001", nom: "Mebkhout", prenom: "Youcef",         groupe: "Groupe 1" },
];

export const allStudents = [
  { id: "e1",  matricule: "222237400711", nom: "Kadi",     prenom: "Islam",          filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e2",  matricule: "212137045124", nom: "Loukil",   prenom: "Mohammed Ilyes", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e3",  matricule: "222237400601", nom: "Madoui",   prenom: "Hichem Ilies",   filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e4",  matricule: "222237347305", nom: "Mecheri",  prenom: "Fatima Zohra",   filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e5",  matricule: "222237335208", nom: "Miri",     prenom: "Nesrine",        filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e6",  matricule: "222237347817", nom: "Negadi",   prenom: "Mohammed Aymene", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", statut: "actif" as const },
  { id: "e7",  matricule: "222237401612", nom: "Touati",   prenom: "Hanene",         filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", statut: "actif" as const },
  { id: "e8",  matricule: "222237427403", nom: "Toumi",    prenom: "Yasmine",        filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", statut: "actif" as const },
  { id: "e9",  matricule: "232337010101", nom: "Belhadj",  prenom: "Sofiane",        filiere: "Informatique", niveau: "L2", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e10", matricule: "232337010104", nom: "Hamdi",    prenom: "Yasmina",        filiere: "Informatique", niveau: "L2", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e11", matricule: "242437020201", nom: "Aoumeur",  prenom: "Walid",          filiere: "Informatique", niveau: "L1", groupe: "Groupe 1", statut: "actif" as const },
  { id: "e12", matricule: "242437020203", nom: "Dahmani",  prenom: "Imane",          filiere: "Informatique", niveau: "L1", groupe: "Groupe 1", statut: "actif" as const },
];

export const allTeachers = [
  { id: "t1", nom: "Hadj",       prenom: "Mohamed", email: "m.hadj@univ-oran1.dz",       grade: "MCA",        departement: "Informatique",   modules: 4, statut: "actif" as const },
  { id: "t2", nom: "Ziani",      prenom: "Amira",   email: "a.ziani@univ-oran1.dz",      grade: "MCB",        departement: "Informatique",   modules: 1, statut: "actif" as const },
  { id: "t3", nom: "Belkacem",   prenom: "Yacine",  email: "y.belkacem@univ-oran1.dz",   grade: "Professeur", departement: "Informatique",   modules: 3, statut: "actif" as const },
  { id: "t4", nom: "Khelifi",    prenom: "Samia",   email: "s.khelifi@univ-oran1.dz",    grade: "MCA",        departement: "Informatique",   modules: 3, statut: "actif" as const },
  { id: "t5", nom: "Boukhalfa",  prenom: "Hocine",  email: "h.boukhalfa@univ-oran1.dz",  grade: "MCA",        departement: "Informatique",   modules: 2, statut: "actif" as const },
  { id: "t6", nom: "Amrani",     prenom: "Rachid",  email: "r.amrani@univ-oran1.dz",     grade: "MCB",        departement: "Mathématiques",  modules: 5, statut: "actif" as const },
];

export const pendingNotes = [
  { id: "pn1", module: "Systèmes d'Exploitation 2", enseignant: "Dr. Samia Khelifi",   type: "Examen Final", nbEtudiants: 28, dateDepot: "2026-01-05", statut: "en_attente" as const },
  { id: "pn2", module: "Génie Logiciel",            enseignant: "Dr. Fatima Lahmar",   type: "Contrôle 2",   nbEtudiants: 28, dateDepot: "2026-01-06", statut: "en_attente" as const },
  { id: "pn3", module: "Bases de Données Avancées", enseignant: "Dr. Hocine Boukhalfa", type: "TP Final",     nbEtudiants: 25, dateDepot: "2026-01-03", statut: "valide" as const },
];

export const niveauxFiliere = [
  { id: "L1", label: "L1 Informatique", cycle: "LMD" },
  { id: "L2", label: "L2 Informatique", cycle: "LMD" },
  { id: "L3", label: "L3 Informatique", cycle: "LMD" },
  { id: "M1", label: "M1 Informatique", cycle: "Master" },
  { id: "M2", label: "M2 Informatique", cycle: "Master" },
  { id: "ING1", label: "ING1 Informatique", cycle: "Ingéniorat" },
  { id: "ING2", label: "ING2 Informatique", cycle: "Ingéniorat" },
  { id: "ING3", label: "ING3 Informatique", cycle: "Ingéniorat" },
];

export const semestresParNiveau: Record<string, string[]> = {
  L1: ["S1", "S2"],
  L2: ["S3", "S4"],
  L3: ["S5", "S6"],
  M1: ["S1", "S2"],
  M2: ["S3", "S4"],
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

// Affectations de l'enseignant courant (Dr. Hadj)
export const teacherAssignments = [
  { key: "l3-s6-pfe",   intitule: "Projet de Fin de Cycle (PFE)",            niveau: "L3",   semestre: "S6", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "l2-s3-asd3",  intitule: "Algorithmique et Structures de Données 3", niveau: "L2", semestre: "S3", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1", "Groupe 2", "Groupe 3"] },
  { key: "l1-s1-asd1",  intitule: "Algorithmique et Structures de Données 1", niveau: "L1", semestre: "S1", responsable: false, role: "cc"    as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "l1-s2-asd2",  intitule: "Algorithmique et Structures de Données 2", niveau: "L1", semestre: "S2", responsable: false, role: "tp"    as TeacherRole, groupes: ["Groupe 1", "Groupe 2"] },
  { key: "ing1-s1-algo", intitule: "Algorithmique et Programmation",          niveau: "ING1", semestre: "S1", responsable: true,  role: "cc+tp" as TeacherRole, groupes: ["Groupe 1"] },
];

// ─── AGENT DATA ────────────────────────────────────────────────────────────────

const nomsList = ["Kadi","Loukil","Madoui","Malki","Mana","Mebkhout","Mecheri","Mekkaoui","Miri","Mouro","Negadi","Rahab","Riah","Rouibi","Salah","Semmache","Seridj","Smail","Touati","Toumi","Belhadj","Cherif","Daoudi","Hamdi","Kara","Larbi","Mansouri","Zerrouki","Aoumeur","Brahimi"];
const prenomsList = ["Islam","Mohammed","Hichem","Fouad","Yahia","Youcef","Fatima","Abdelali","Nesrine","Kawther","Aymene","Mohammed","Youcef","Zahra","Ahlem","Khadidja","Houssem","Taha","Hanene","Yasmine","Sofiane","Amina","Bilal","Yasmina","Riad","Sara","Anis","Lina","Walid","Nour"];
const wilayas = ["Oran","Mostaganem","Mascara","Sidi Bel Abbès","Tlemcen","Aïn Témouchent","Relizane","Tiaret"];
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
  const niv = ["L1","L2","L3","L3","M1"][i % 5];
  const fil = "Informatique";
  const gr = `Groupe ${(i % 2) + 1}`;
  const mat = `2022370${String(i+100).padStart(4,"0")}`;
  return {
    id: `as${i}`,
    matricule: mat,
    nom: nomsList[i % nomsList.length],
    prenom: prenomsList[(i * 3) % prenomsList.length],
    dateNaissance: `${2002 + (i % 4)}-${String((i % 12) + 1).padStart(2,"0")}-${String((i % 28) + 1).padStart(2,"0")}`,
    wilaya: wilayas[i % wilayas.length],
    filiere: fil,
    niveau: niv,
    groupe: gr,
    email: `${prenomsList[(i*3)%prenomsList.length].toLowerCase()[0]}.${nomsList[i%nomsList.length].toLowerCase()}@univ-oran1.dz`,
    statutCompte: i < 25 ? "actif" : i < 28 ? "suspendu" : "archive",
    statutReinscription: r,
    statutPaiement: p,
    montantPaye: p === "paye" ? 2500 : 0,
    methodePayment: i % 2 === 0 ? "CCP" : "Edahabia",
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
  { id: "at1",  matricule: "ENS-INF-01", nom: "Hadj",       prenom: "Mohamed", grade: "MCA",        departement: "Informatique",  email: "m.hadj@univ-oran1.dz",       modulesAssignes: ["Algorithmique et Structures de Données","Projet de Fin de Cycle","Algorithmique et Programmation"], statutCompte: "actif", schedule: [{jour:"Dimanche",module:"ASD 3",type:"CM",salle:"Amphi A"},{jour:"Lundi",module:"PFE",type:"TP",salle:"Labo BDD"}] },
  { id: "at2",  matricule: "ENS-INF-02", nom: "Ziani",      prenom: "Amira",   grade: "MCB",        departement: "Informatique",  email: "a.ziani@univ-oran1.dz",      modulesAssignes: ["Programmation Orientée Objet"], statutCompte: "actif", schedule: [{jour:"Dimanche",module:"POO",type:"TD",salle:"Salle 12"}] },
  { id: "at3",  matricule: "ENS-INF-03", nom: "Belkacem",   prenom: "Yacine",  grade: "Professeur", departement: "Informatique",  email: "y.belkacem@univ-oran1.dz",   modulesAssignes: ["Réseaux Informatiques","Sécurité Informatique","Réseaux 1"], statutCompte: "actif", schedule: [{jour:"Lundi",module:"Réseaux",type:"CM",salle:"Amphi B"}] },
  { id: "at4",  matricule: "ENS-INF-04", nom: "Khelifi",    prenom: "Samia",   grade: "MCA",        departement: "Informatique",  email: "s.khelifi@univ-oran1.dz",    modulesAssignes: ["Systèmes d'Exploitation 2","Systèmes Distribués","Systèmes d'Exploitation 1"], statutCompte: "actif", schedule: [] },
  { id: "at5",  matricule: "ENS-INF-05", nom: "Benmabrouk", prenom: "Karim",   grade: "MAB",        departement: "Informatique",  email: "k.benmabrouk@univ-oran1.dz", modulesAssignes: ["Intelligence Artificielle"], statutCompte: "actif", schedule: [] },
  { id: "at6",  matricule: "ENS-INF-06", nom: "Lahmar",     prenom: "Fatima",  grade: "MCB",        departement: "Informatique",  email: "f.lahmar@univ-oran1.dz",     modulesAssignes: ["Génie Logiciel","Conception Orientée Objet (UML)"], statutCompte: "actif", schedule: [] },
  { id: "at7",  matricule: "ENS-INF-07", nom: "Boukhalfa",  prenom: "Hocine",  grade: "MCA",        departement: "Informatique",  email: "h.boukhalfa@univ-oran1.dz",  modulesAssignes: ["Bases de Données Avancées","Systèmes d'Information"], statutCompte: "actif", schedule: [] },
  { id: "at8",  matricule: "ENS-INF-08", nom: "Mansouri",   prenom: "Nawel",   grade: "MAA",        departement: "Informatique",  email: "n.mansouri@univ-oran1.dz",   modulesAssignes: ["Compilation","Programmation Web et Mobile"], statutCompte: "actif", schedule: [] },
  { id: "at9",  matricule: "ENS-INF-09", nom: "Taleb",      prenom: "Réda",    grade: "MCB",        departement: "Informatique",  email: "r.taleb@univ-oran1.dz",      modulesAssignes: ["Architecture des Ordinateurs","Théorie des Langages et Automates"], statutCompte: "actif", schedule: [] },
  { id: "at10", matricule: "ENS-INF-10", nom: "Saidi",      prenom: "Lamia",   grade: "MAA",        departement: "Informatique",  email: "l.saidi@univ-oran1.dz",      modulesAssignes: ["Anglais Technique et Entrepreneuriat"], statutCompte: "actif", schedule: [] },
  { id: "at11", matricule: "ENS-MAT-01", nom: "Amrani",     prenom: "Rachid",  grade: "MCB",        departement: "Mathématiques", email: "r.amrani@univ-oran1.dz",     modulesAssignes: ["Analyse 1","Algèbre 1","Mathématiques Discrètes"], statutCompte: "actif", schedule: [] },
  { id: "at12", matricule: "ENS-MAT-02", nom: "Djoudi",     prenom: "Omar",    grade: "Professeur", departement: "Mathématiques", email: "o.djoudi@univ-oran1.dz",     modulesAssignes: ["Logique Mathématique","Analyse Numérique"], statutCompte: "actif", schedule: [] },
  { id: "at13", matricule: "ENS-PHY-01", nom: "Meftah",     prenom: "Nadia",   grade: "MAA",        departement: "Physique",      email: "n.meftah@univ-oran1.dz",     modulesAssignes: ["Physique 1 (Mécanique du point)"], statutCompte: "actif", schedule: [] },
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
    matricule: `2022374${String(i+1).padStart(4,"0")}`,
    nom: nomsList[i % nomsList.length],
    prenom: prenomsList[i % prenomsList.length],
    noteCC: hasNotes ? Math.round((10 + Math.random() * 10) * 4) / 4 : null,
    noteExam: hasNotes ? Math.round((8 + Math.random() * 12) * 4) / 4 : null,
    absent: !hasNotes && i === 3,
  }));
}

export const gradeSubmissions: GradeSubmission[] = [
  { id: "gs1",  module: "Systèmes d'Exploitation 2", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Samia Khelifi",   semestre: "S5", statut: "soumis",     dateDepot: "2026-01-05", notesSoumises: true,  students: mkGradeStudents(28, true) },
  { id: "gs2",  module: "Systèmes d'Exploitation 2", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Samia Khelifi",   semestre: "S5", statut: "valide",     dateDepot: "2026-01-05", notesSoumises: true,  students: mkGradeStudents(22, true) },
  { id: "gs3",  module: "Bases de Données Avancées", filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Hocine Boukhalfa", semestre: "S5", statut: "publie",     dateDepot: "2026-01-03", notesSoumises: true,  students: mkGradeStudents(28, true) },
  { id: "gs4",  module: "Génie Logiciel",            filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Fatima Lahmar",   semestre: "S5", statut: "soumis",     dateDepot: "2026-01-06", notesSoumises: true,  students: mkGradeStudents(28, true) },
  { id: "gs5",  module: "Génie Logiciel",            filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Fatima Lahmar",   semestre: "S5", statut: "en_attente", dateDepot: "",           notesSoumises: false, students: mkGradeStudents(22, false) },
  { id: "gs6",  module: "Réseaux Informatiques",     filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Pr. Yacine Belkacem", semestre: "S5", statut: "publie",     dateDepot: "2026-01-02", notesSoumises: true,  students: mkGradeStudents(28, true) },
  { id: "gs7",  module: "Compilation",               filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Dr. Nawel Mansouri",  semestre: "S5", statut: "soumis",     dateDepot: "2026-01-07", notesSoumises: true,  students: mkGradeStudents(28, true) },
  { id: "gs8",  module: "Intelligence Artificielle", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Karim Benmabrouk", semestre: "S5", statut: "valide",     dateDepot: "2026-01-04", notesSoumises: true,  students: mkGradeStudents(22, true) },
  { id: "gs9",  module: "Sécurité Informatique",     filiere: "Informatique", niveau: "L3", groupe: "Groupe 1", enseignant: "Pr. Yacine Belkacem", semestre: "S6", statut: "en_attente", dateDepot: "",           notesSoumises: false, students: mkGradeStudents(28, false) },
  { id: "gs10", module: "Programmation Web et Mobile", filiere: "Informatique", niveau: "L3", groupe: "Groupe 2", enseignant: "Dr. Nawel Mansouri", semestre: "S6", statut: "soumis",     dateDepot: "2026-01-08", notesSoumises: true,  students: mkGradeStudents(22, true) },
];

export const agentRooms = [
  { id: "r1", nom: "Amphi A",       capacite: 250, type: "Amphithéâtre", disponible: true },
  { id: "r2", nom: "Amphi B",       capacite: 200, type: "Amphithéâtre", disponible: true },
  { id: "r3", nom: "Salle 12",      capacite: 40,  type: "Salle TD",     disponible: true },
  { id: "r4", nom: "Salle 15",      capacite: 40,  type: "Salle TD",     disponible: false },
  { id: "r5", nom: "Labo BDD",      capacite: 30,  type: "Laboratoire",  disponible: true },
  { id: "r6", nom: "Labo Réseaux",  capacite: 25,  type: "Laboratoire",  disponible: true },
  { id: "r7", nom: "Labo Systèmes", capacite: 25,  type: "Laboratoire",  disponible: false },
  { id: "r8", nom: "Labo IA",       capacite: 30,  type: "Laboratoire",  disponible: true },
];

export const calendarEvents = [
  { id: "ce1",  date: "2025-09-14", titre: "Rentrée universitaire 2025-2026",        type: "green" as const, description: "Début officiel de l'année académique" },
  { id: "ce2",  date: "2025-09-15", titre: "Ouverture des réinscriptions",           type: "green" as const, description: "Début de la période de réinscription pédagogique" },
  { id: "ce3",  date: "2025-10-30", titre: "Clôture des réinscriptions",             type: "red" as const,   description: "Date limite de dépôt des dossiers de réinscription" },
  { id: "ce4",  date: "2025-11-16", titre: "Contrôles continus S5 — Semaine 1",      type: "blue" as const,  description: "Première série de contrôles continus" },
  { id: "ce5",  date: "2026-01-04", titre: "Examen — Systèmes d'Exploitation 2",     type: "amber" as const, description: "Amphi A · 09:00 — L3 Informatique" },
  { id: "ce6",  date: "2026-01-06", titre: "Examen — Réseaux Informatiques",         type: "amber" as const, description: "Amphi A · 09:00 — L3 Informatique" },
  { id: "ce7",  date: "2026-01-08", titre: "Examen — Génie Logiciel",                type: "amber" as const, description: "Amphi B · 11:00 — L3 Informatique" },
  { id: "ce8",  date: "2026-01-11", titre: "Examen — Compilation",                   type: "amber" as const, description: "Amphi A · 09:00 — L3 Informatique" },
  { id: "ce9",  date: "2026-01-15", titre: "Date limite de soumission des notes S5", type: "red" as const,   description: "Les enseignants doivent soumettre les notes" },
  { id: "ce10", date: "2026-01-22", titre: "Délibérations S5",                       type: "blue" as const,  description: "Commission de délibération du semestre 5" },
  { id: "ce11", date: "2026-01-28", titre: "Publication des résultats S5",           type: "red" as const,   description: "Mise en ligne officielle des résultats" },
  { id: "ce12", date: "2026-02-15", titre: "Début du semestre S6",                   type: "green" as const, description: "Reprise des cours" },
];

export const reinscriptionChartData = [
  { filiere: "Informatique", valide: 30, en_attente: 8, rejete: 2, incomplet: 2 },
  { filiere: "Mathématiques", valide: 14, en_attente: 6, rejete: 2, incomplet: 1 },
  { filiere: "Physique", valide: 9, en_attente: 4, rejete: 1, incomplet: 0 },
];

export const gradeStatusChartData = [
  { name: "Publié", value: 2, color: "#22c55e" },
  { name: "Validé", value: 3, color: "#3b82f6" },
  { name: "Soumis", value: 4, color: "#f59e0b" },
  { name: "En attente", value: 1, color: "#9ca3af" },
];

export const dailySubmissionsData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date("2026-01-01");
  date.setDate(date.getDate() + i);
  return {
    date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    soumis: [2,3,1,4,2,0,0,3,5,2,1,4,3,2][i],
  };
});

export const modulesParNiveauSemestre: Record<string, { id: string; intitule: string; credits: number }[]> = {
  "L1-S1": [
    { id: "INF1101", intitule: "Algorithmique et Structures de Données 1", credits: 6 },
    { id: "MAT1101", intitule: "Analyse 1", credits: 6 },
    { id: "MAT1102", intitule: "Algèbre 1", credits: 5 },
    { id: "INF1102", intitule: "Structure Machine 1", credits: 4 },
    { id: "PHY1101", intitule: "Physique 1 (Mécanique du point)", credits: 4 },
    { id: "TRM1101", intitule: "Terminologie scientifique", credits: 2 },
    { id: "LAN1101", intitule: "Langue étrangère 1 (Anglais)", credits: 3 },
  ],
  "L1-S2": [
    { id: "INF1201", intitule: "Algorithmique et Structures de Données 2", credits: 6 },
    { id: "MAT1201", intitule: "Analyse 2", credits: 6 },
    { id: "MAT1202", intitule: "Algèbre 2", credits: 5 },
    { id: "INF1202", intitule: "Structure Machine 2", credits: 4 },
    { id: "MAT1203", intitule: "Probabilités et Statistique Descriptive", credits: 4 },
    { id: "PHY1201", intitule: "Physique 2 (Électricité)", credits: 3 },
  ],
  "L2-S3": [
    { id: "INF2301", intitule: "Algorithmique et Structures de Données 3", credits: 6 },
    { id: "INF2302", intitule: "Architecture des Ordinateurs", credits: 5 },
    { id: "INF2303", intitule: "Programmation Orientée Objet", credits: 6 },
    { id: "INF2304", intitule: "Logique Mathématique", credits: 4 },
    { id: "MAT2301", intitule: "Mathématiques Discrètes", credits: 4 },
    { id: "INF2305", intitule: "Systèmes d'Information", credits: 5 },
  ],
  "L2-S4": [
    { id: "INF2401", intitule: "Théorie des Langages et Automates", credits: 5 },
    { id: "INF2402", intitule: "Systèmes d'Exploitation 1", credits: 6 },
    { id: "INF2403", intitule: "Bases de Données", credits: 6 },
    { id: "INF2404", intitule: "Réseaux 1", credits: 5 },
    { id: "MAT2401", intitule: "Analyse Numérique", credits: 4 },
    { id: "INF2405", intitule: "Conception Orientée Objet (UML)", credits: 4 },
  ],
  "L3-S5": [
    { id: "INF3501", intitule: "Systèmes d'Exploitation 2", credits: 6 },
    { id: "INF3502", intitule: "Réseaux Informatiques", credits: 5 },
    { id: "INF3503", intitule: "Génie Logiciel", credits: 5 },
    { id: "INF3504", intitule: "Compilation", credits: 4 },
    { id: "INF3505", intitule: "Bases de Données Avancées", credits: 6 },
    { id: "INF3506", intitule: "Intelligence Artificielle", credits: 4 },
  ],
  "L3-S6": [
    { id: "INF3601", intitule: "Sécurité Informatique", credits: 5 },
    { id: "INF3602", intitule: "Programmation Web et Mobile", credits: 5 },
    { id: "INF3603", intitule: "Systèmes Distribués", credits: 4 },
    { id: "INF3604", intitule: "Méthodologie de Conception Logicielle", credits: 4 },
    { id: "INF3605", intitule: "Projet de Fin de Cycle (PFE)", credits: 8 },
    { id: "INF3606", intitule: "Anglais Technique et Entrepreneuriat", credits: 4 },
  ],
  "ING1-S1": [
    { id: "ING1101", intitule: "Mathématiques 1 (Analyse & Algèbre)", credits: 6 },
    { id: "ING1102", intitule: "Algorithmique et Programmation", credits: 6 },
    { id: "ING1103", intitule: "Électronique Fondamentale", credits: 5 },
    { id: "ING1104", intitule: "Systèmes Logiques", credits: 5 },
  ],
};

export const studentsDB: Record<string, { id: string; matricule: string; nom: string; prenom: string; groupe: string }[]> = {
  "L3-Groupe 1": [
    { id: "L3-G1-1",  matricule: "222237400711", nom: "Kadi",     prenom: "Islam",          groupe: "Groupe 1" },
    { id: "L3-G1-2",  matricule: "212137045124", nom: "Loukil",   prenom: "Mohammed Ilyes", groupe: "Groupe 1" },
    { id: "L3-G1-3",  matricule: "222237400601", nom: "Madoui",   prenom: "Hichem Ilies",   groupe: "Groupe 1" },
    { id: "L3-G1-4",  matricule: "222237002608", nom: "Malki",    prenom: "Fouad",          groupe: "Groupe 1" },
    { id: "L3-G1-5",  matricule: "222237327504", nom: "Mana",     prenom: "Yahia",          groupe: "Groupe 1" },
    { id: "L3-G1-6",  matricule: "222237364001", nom: "Mebkhout", prenom: "Youcef",         groupe: "Groupe 1" },
    { id: "L3-G1-7",  matricule: "222237347305", nom: "Mecheri",  prenom: "Fatima Zohra",   groupe: "Groupe 1" },
    { id: "L3-G1-8",  matricule: "222237475208", nom: "Mekkaoui", prenom: "Abdelali",       groupe: "Groupe 1" },
    { id: "L3-G1-9",  matricule: "222237335208", nom: "Miri",     prenom: "Nesrine",        groupe: "Groupe 1" },
    { id: "L3-G1-10", matricule: "222237356212", nom: "Mouro",    prenom: "Kawther",        groupe: "Groupe 1" },
  ],
  "L3-Groupe 2": [
    { id: "L3-G2-1",  matricule: "222237347817", nom: "Negadi",   prenom: "Mohammed Aymene", groupe: "Groupe 2" },
    { id: "L3-G2-2",  matricule: "222237375720", nom: "Rahab",    prenom: "Mohammed",        groupe: "Groupe 2" },
    { id: "L3-G2-3",  matricule: "212237473505", nom: "Riah",     prenom: "Youcef",          groupe: "Groupe 2" },
    { id: "L3-G2-4",  matricule: "222237414805", nom: "Rouibi",   prenom: "Zahra Hibatou-Allah", groupe: "Groupe 2" },
    { id: "L3-G2-5",  matricule: "222237458717", nom: "Salah",    prenom: "Ahlem Nour-Imene", groupe: "Groupe 2" },
    { id: "L3-G2-6",  matricule: "222237355107", nom: "Semmache", prenom: "Khadidja",        groupe: "Groupe 2" },
    { id: "L3-G2-7",  matricule: "222237333006", nom: "Seridj",   prenom: "Houssem Eddine",  groupe: "Groupe 2" },
    { id: "L3-G2-8",  matricule: "222238364008", nom: "Smail",    prenom: "Taha Miloud",     groupe: "Groupe 2" },
    { id: "L3-G2-9",  matricule: "222237401612", nom: "Touati",   prenom: "Hanene",          groupe: "Groupe 2" },
    { id: "L3-G2-10", matricule: "222237427403", nom: "Toumi",    prenom: "Yasmine",         groupe: "Groupe 2" },
  ],
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
