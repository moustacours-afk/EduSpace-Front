export type AgentAccount = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  wilaya: string;
  etablissement: string;
  faculte: string;
  departement: string;
  createdAt: string;
  active: boolean;
};

export type ModuleEntry = {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  credits: number;
  ue: string;
  nature: "obligatoire" | "optionnelle";
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

export type ProgrammeEntry = {
  faculte: string;
  departement: string;
  specialite: string;
  niveau: string;
  semestre: string;
  modules: ModuleEntry[];
};

// Keys are scoped to the authenticated SA's ID so two SAs on the same browser never share data
function saUserId(): string {
  try { return String(JSON.parse(localStorage.getItem("eduspace_user") ?? "{}").id ?? "unknown"); }
  catch { return "unknown"; }
}
function agentsKey():     string { return `superAgent_agents_${saUserId()}`; }
function programmesKey(): string { return `superAgent_programmes_${saUserId()}`; }

export const NIVEAUX_LIST = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3", "ING4", "ING5"];

export const SEMESTRES_PAR_NIVEAU: Record<string, string[]> = {
  L1: ["S1", "S2"], L2: ["S3", "S4"], L3: ["S5", "S6"],
  M1: ["S1", "S2"], M2: ["S3", "S4"],
  // Engineering cycle: S1-S10 across 5 years
  ING1: ["S1", "S2"],
  ING2: ["S3", "S4"],
  ING3: ["S5", "S6"],
  ING4: ["S7", "S8"],
  ING5: ["S9", "S10"],
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

export const ETABLISSEMENTS_PAR_WILAYA: Record<string, string[]> = {
  "Adrar": ["Université Ahmed Draia — Adrar"],
  "Chlef": ["Université Hassiba Ben Bouali — Chlef"],
  "Laghouat": ["Université Amar Telidji — Laghouat"],
  "Oum El Bouaghi": ["Université Larbi Ben M'hidi — Oum El Bouaghi"],
  "Batna": ["Université Hadj Lakhdar — Batna 1", "Université Mostefa Ben Boulaïd — Batna 2"],
  "Béjaïa": ["Université Abderrahmane Mira — Béjaïa"],
  "Biskra": ["Université Mohamed Khider — Biskra"],
  "Béchar": ["Université Tahri Mohamed — Béchar"],
  "Blida": ["Université Saad Dahleb — Blida 1", "Université Ali Lounici — Blida 2"],
  "Bouira": ["Université Akli Mohand Oulhadj — Bouira"],
  "Tamanrasset": ["Centre Universitaire Tamanrasset"],
  "Tébessa": ["Université Larbi Tébessi — Tébessa"],
  "Tlemcen": ["Université Abou Bekr Belkaid — Tlemcen"],
  "Tiaret": ["Université Ibn Khaldoun — Tiaret"],
  "Tizi Ouzou": ["Université Mouloud Mammeri — Tizi Ouzou"],
  "Alger": [
    "USTHB — Université des Sciences et de la Technologie Houari Boumediene",
    "Université d'Alger 1 — Benyoucef Benkhedda",
    "Université d'Alger 2 — Abou El Kacem Saâdallah",
    "Université d'Alger 3 — Hassiba Ben Bouali",
    "École Nationale Polytechnique — Alger (ENP)",
    "École Nationale Supérieure d'Informatique (ESI)",
  ],
  "Djelfa": ["Université Ziane Achour — Djelfa"],
  "Jijel": ["Université Mohammed Seddik Ben Yahia — Jijel"],
  "Sétif": ["Université Ferhat Abbas — Sétif 1", "Université El-Arbi Ben M'hidi — Sétif 2"],
  "Saïda": ["Université Dr. Moulay Tahar — Saïda"],
  "Skikda": ["Université 20 Août 1955 — Skikda"],
  "Sidi Bel Abbès": ["Université Djillali Liabes — Sidi Bel Abbès"],
  "Annaba": ["Université Badji Mokhtar — Annaba"],
  "Guelma": ["Université 8 Mai 1945 — Guelma"],
  "Constantine": [
    "Université Constantine 1 — Frères Mentouri",
    "Université Constantine 2 — Abdelhamid Mehri",
    "Université Constantine 3 — Salah Boubnider",
  ],
  "Médéa": ["Université Yahia Fares — Médéa"],
  "Mostaganem": ["Université Abdelhamid Ibn Badis — Mostaganem"],
  "M'Sila": ["Université Mohammed Boudiaf — M'Sila"],
  "Mascara": ["Université Mustapha Stambouli — Mascara"],
  "Ouargla": ["Université Kasdi Merbah — Ouargla"],
  "Oran": [
    "USTO-MB — Université des Sciences et de la Technologie d'Oran",
    "Université d'Oran 1 — Ahmed Ben Bella",
    "Université d'Oran 2 — Mohamed Ben Ahmed",
    "École Nationale Polytechnique d'Oran — Maurice Audin (ENPO)",
  ],
  "El Bayadh": ["Centre Universitaire Nour Bachir — El Bayadh"],
  "Illizi": ["Centre Universitaire — Illizi"],
  "Bordj Bou Arréridj": ["Université Mohamed El Bachir El Ibrahimi — Bordj Bou Arréridj"],
  "Boumerdès": ["Université M'Hamed Bougara — Boumerdès"],
  "El Tarf": ["Centre Universitaire — El Tarf"],
  "Tindouf": ["Centre Universitaire — Tindouf"],
  "Tissemsilt": ["Centre Universitaire — Tissemsilt"],
  "El Oued": ["Université Echahid Hamma Lakhdar — El Oued"],
  "Khenchela": ["Université Abbas Laghrour — Khenchela"],
  "Souk Ahras": ["Université Mohamed Chérif Messaadia — Souk Ahras"],
  "Tipaza": ["Centre Universitaire — Tipaza"],
  "Mila": ["Centre Universitaire Abdelhafid Boussouf — Mila"],
  "Aïn Defla": ["Centre Universitaire — Aïn Defla"],
  "Naâma": ["Centre Universitaire Ahmed Salhi — Naâma"],
  "Aïn Témouchent": ["Centre Universitaire Belhadj Bouchaib — Aïn Témouchent"],
  "Ghardaïa": ["Université Ghardaïa"],
  "Relizane": ["Centre Universitaire Abdelkader Askeur — Relizane"],
};

const FACULTES_COMMUNES = [
  "Faculté des Mathématiques et Informatique",
  "Faculté des Sciences",
  "Faculté des Sciences de l'Ingénieur",
  "Faculté de Technologie",
  "Faculté des Sciences Économiques, Commerciales et de Gestion",
  "Faculté des Lettres et Langues",
  "Faculté des Sciences Humaines et Sociales",
  "Faculté de Droit et Science Politique",
  "Faculté de Médecine",
  "Faculté des Sciences de la Nature et de la Vie",
];

const FACULTES_SPECIFIQUES: Record<string, string[]> = {
  "USTHB — Université des Sciences et de la Technologie Houari Boumediene": [
    "Faculté d'Informatique",
    "Faculté de Mathématiques",
    "Faculté d'Électronique",
    "Faculté de Génie Mécanique et Génie des Procédés",
    "Faculté de Génie Civil",
    "Faculté de Chimie",
    "Faculté de Physique",
    "Faculté de Génie Électrique",
    "Faculté des Sciences Biologiques",
    "Faculté des Sciences de la Terre, Géographie et Aménagement du Territoire",
  ],
  "USTO-MB — Université des Sciences et de la Technologie d'Oran": [
    "Faculté de Mathématiques et d'Informatique",
    "Faculté de Physique",
    "Faculté de Chimie",
    "Faculté des Sciences de la Nature et de la Vie",
    "Faculté d'Architecture et Génie Civil",
    "Faculté de Génie Mécanique",
    "Faculté d'Électrotechnique",
    "Faculté de Génie des Procédés",
    "Faculté des Sciences de la Terre et de l'Univers",
  ],
  "École Nationale Polytechnique — Alger (ENP)": [
    "Faculté de Génie Civil",
    "Faculté de Génie Mécanique",
    "Faculté d'Électrotechnique",
    "Faculté de Génie des Procédés",
    "Faculté de Génie Industriel",
    "Faculté d'Informatique",
    "Faculté d'Hydraulique",
  ],
  "École Nationale Supérieure d'Informatique (ESI)": [
    "Faculté d'Informatique Fondamentale et Appliquée",
    "Faculté des Systèmes Intelligents et Embarqués",
    "Faculté des Technologies de l'Information et de la Communication",
  ],
  "École Nationale Polytechnique d'Oran — Maurice Audin (ENPO)": [
    "Faculté de Génie Mécanique",
    "Faculté d'Électrotechnique",
    "Faculté de Génie des Procédés",
    "Faculté de Génie Civil",
    "Faculté de Génie Industriel",
  ],
  "Université d'Oran 1 — Ahmed Ben Bella": [
    "Faculté de Droit et des Sciences Politiques",
    "Faculté des Sciences Économiques, Commerciales et des Sciences de Gestion",
    "Faculté des Lettres, Langues et Arts",
    "Faculté des Sciences Sociales",
    "Faculté de Médecine",
    "Faculté des Sciences de la Nature et de la Vie",
    "Faculté des Sciences de la Terre et de l'Univers",
    "Faculté des Sciences Exactes et Appliquées",
  ],
  "Université d'Oran 2 — Mohamed Ben Ahmed": [
    "Faculté des Sciences Humaines",
    "Faculté des Lettres et des Langues",
    "Faculté des Sciences Sociales et de la Communication",
    "Faculté des Sciences Économiques, Commerciales et des Sciences de Gestion",
    "Faculté de Psychologie et des Sciences de l'Éducation",
  ],
};

export const DEPARTEMENTS_PAR_FACULTE: Record<string, string[]> = {
  "Faculté des Mathématiques et Informatique": ["Informatique", "Mathématiques", "Statistiques et Probabilités"],
  "Faculté d'Informatique": ["Informatique", "Systèmes et Réseaux Informatiques", "Génie Logiciel"],
  "Faculté de Mathématiques et d'Informatique": ["Informatique", "Mathématiques", "Statistiques"],
  "Faculté d'Informatique Fondamentale et Appliquée": ["Informatique Fondamentale", "Informatique Appliquée"],
  "Faculté des Systèmes Intelligents et Embarqués": ["Intelligence Artificielle", "Systèmes Embarqués"],
  "Faculté des Technologies de l'Information et de la Communication": ["Réseaux et Systèmes", "Sécurité Informatique", "Technologies Web et Mobile"],
  "Faculté de Mathématiques": ["Mathématiques", "Recherche Opérationnelle", "Probabilités et Statistiques"],
  "Faculté d'Électronique": ["Électronique", "Télécommunications", "Microélectronique"],
  "Faculté de Génie Mécanique et Génie des Procédés": ["Génie Mécanique", "Génie des Procédés"],
  "Faculté de Génie Mécanique": ["Génie Mécanique", "Énergétique", "Construction Mécanique"],
  "Faculté de Génie Civil": ["Génie Civil", "Hydraulique", "Aménagement du Territoire"],
  "Faculté d'Architecture et Génie Civil": ["Architecture", "Génie Civil", "Hydraulique"],
  "Faculté de Génie Électrique": ["Électrotechnique", "Automatique", "Génie Électrique"],
  "Faculté d'Électrotechnique": ["Électrotechnique", "Génie Électrique", "Automatique"],
  "Faculté de Génie des Procédés": ["Génie Chimique", "Génie Pétrolier", "Génie de l'Environnement"],
  "Faculté de Génie Industriel": ["Génie Industriel", "Logistique et Supply Chain"],
  "Faculté de Chimie": ["Chimie Industrielle", "Génie Chimique", "Chimie Analytique"],
  "Faculté de Physique": ["Physique", "Physique Théorique", "Physique des Matériaux"],
  "Faculté d'Hydraulique": ["Hydraulique", "Ressources en Eau"],
  "Faculté des Sciences": ["Physique", "Chimie", "Biologie", "Biochimie"],
  "Faculté des Sciences de l'Ingénieur": ["Génie Civil", "Génie Mécanique", "Génie Électrique", "Génie Industriel"],
  "Faculté de Technologie": ["Génie Civil", "Génie Électrique", "Génie Mécanique", "Informatique"],
  "Faculté des Sciences Économiques, Commerciales et de Gestion": ["Sciences Économiques", "Sciences Commerciales", "Sciences de Gestion"],
  "Faculté des Lettres et Langues": ["Langue et Littérature Arabes", "Langue et Littérature Françaises", "Langue et Littérature Anglaises", "Traduction"],
  "Faculté des Sciences Humaines et Sociales": ["Psychologie", "Sociologie", "Histoire", "Géographie"],
  "Faculté de Droit et Science Politique": ["Droit Privé", "Droit Public", "Science Politique"],
  "Faculté de Médecine": ["Médecine", "Pharmacie", "Chirurgie Dentaire"],
  "Faculté des Sciences de la Nature et de la Vie": ["Biologie", "Biochimie", "Microbiologie", "Écologie et Environnement"],
  "Faculté des Sciences de la Terre, Géographie et Aménagement du Territoire": ["Géologie", "Géographie", "Aménagement du Territoire"],
  "Faculté des Sciences de la Terre et de l'Univers": ["Géologie", "Géophysique"],
  "Faculté des Sciences Biologiques": ["Biologie Cellulaire et Moléculaire", "Biochimie", "Microbiologie"],
  // Oran 1
  "Faculté de Droit et des Sciences Politiques":          ["Droit Privé", "Droit Public", "Sciences Politiques"],
  "Faculté des Lettres, Langues et Arts":                 ["Langue Française", "Langue Arabe", "Langue Anglaise", "Langue Espagnole", "Arts"],
  "Faculté des Sciences Sociales":                        ["Sociologie", "Psychologie", "Sciences de l'Éducation", "Anthropologie"],
  "Faculté des Sciences Exactes et Appliquées":           ["Mathématiques", "Informatique", "Physique", "Chimie"],
  // Oran 2
  "Faculté des Sciences Humaines":                        ["Histoire", "Géographie", "Bibliothéconomie et Sciences Documentaires"],
  "Faculté des Lettres et des Langues":                   ["Langue et Littérature Arabes", "Langue et Littérature Françaises", "Langues Étrangères Appliquées"],
  "Faculté des Sciences Sociales et de la Communication": ["Sciences Sociales", "Sciences de l'Information et de la Communication", "Journalisme"],
  "Faculté de Psychologie et des Sciences de l'Éducation": ["Psychologie", "Sciences de l'Éducation", "Orthophonie"],
};

const SPECIALITES_PAR_DEPT_NIVEAU: Record<string, Partial<Record<string, string[]>>> = {
  "Informatique": {
    L3: ["Systèmes Informatiques", "Génie Logiciel", "Bases de Données et Systèmes d'Information"],
    M1: ["Apprentissage Automatique et IA", "Réseaux et Cybersécurité", "Génie Logiciel Avancé", "Systèmes Distribués"],
    M2: ["Apprentissage Automatique et IA", "Réseaux et Cybersécurité", "Génie Logiciel Avancé", "Systèmes Distribués"],
    ING1: ["Génie des Systèmes Informatiques"],
    ING2: ["Génie des Systèmes Informatiques", "Réseaux et Télécommunications", "Sécurité Informatique"],
    ING3: ["Génie des Systèmes Informatiques", "Réseaux et Télécommunications", "Sécurité Informatique"],
  },
  "Systèmes et Réseaux Informatiques": {
    L3: ["Réseaux Informatiques", "Administration Systèmes"],
    M1: ["Réseaux Avancés", "Sécurité des Réseaux", "Cloud Computing"],
    M2: ["Réseaux Avancés", "Sécurité des Réseaux", "Cloud Computing"],
    ING1: ["Réseaux et Systèmes"],
    ING2: ["Réseaux et Télécommunications", "Sécurité Informatique"],
    ING3: ["Réseaux et Télécommunications", "Sécurité Informatique"],
  },
  "Génie Logiciel": {
    L3: ["Développement Logiciel", "Tests et Qualité Logicielle"],
    M1: ["Architecture Logicielle", "DevOps et Cloud", "Développement Web et Mobile"],
    M2: ["Architecture Logicielle", "DevOps et Cloud", "Développement Web et Mobile"],
    ING1: ["Génie Logiciel"],
    ING2: ["Génie Logiciel et Systèmes d'Information", "Développement Web et Mobile"],
    ING3: ["Génie Logiciel et Systèmes d'Information", "Développement Web et Mobile"],
  },
  "Informatique Fondamentale": {
    L3: ["Algorithmique et Complexité", "Langages et Compilation"],
    M1: ["Calcul Formel", "Vérification et Preuve", "Théorie des Langages"],
    M2: ["Calcul Formel", "Vérification et Preuve", "Théorie des Langages"],
    ING1: ["Informatique Fondamentale"],
    ING2: ["Informatique Théorique Appliquée"],
    ING3: ["Informatique Théorique Appliquée"],
  },
  "Informatique Appliquée": {
    L3: ["Systèmes d'Information", "Développement d'Applications"],
    M1: ["Systèmes Intelligents", "Big Data et Analyse", "Informatique Décisionnelle"],
    M2: ["Systèmes Intelligents", "Big Data et Analyse", "Informatique Décisionnelle"],
    ING1: ["Informatique Appliquée"],
    ING2: ["Systèmes d'Information Avancés", "Développement Logiciel Avancé"],
    ING3: ["Systèmes d'Information Avancés", "Développement Logiciel Avancé"],
  },
  "Intelligence Artificielle": {
    L3: ["Machine Learning", "Traitement du Langage Naturel"],
    M1: ["Deep Learning", "Vision Artificielle", "Robotique Intelligente"],
    M2: ["Deep Learning", "Vision Artificielle", "Robotique Intelligente"],
    ING1: ["Intelligence Artificielle"],
    ING2: ["IA Embarquée", "Systèmes Multi-Agents"],
    ING3: ["IA Embarquée", "Systèmes Multi-Agents"],
  },
  "Systèmes Embarqués": {
    L3: ["Microcontrôleurs", "Systèmes Temps Réel"],
    M1: ["Conception de Systèmes Embarqués", "IoT et Réseaux de Capteurs"],
    M2: ["Conception de Systèmes Embarqués", "IoT et Réseaux de Capteurs"],
    ING1: ["Systèmes Embarqués"],
    ING2: ["Systèmes Embarqués Avancés", "IoT Industriel"],
    ING3: ["Systèmes Embarqués Avancés", "IoT Industriel"],
  },
  "Réseaux et Systèmes": {
    L3: ["Administration Réseau", "Sécurité des Systèmes"],
    M1: ["Réseaux Avancés et SDN", "Cybersécurité"],
    M2: ["Réseaux Avancés et SDN", "Cybersécurité"],
    ING1: ["Réseaux et Systèmes"],
    ING2: ["Réseaux Haut Débit", "Sécurité des Infrastructures"],
    ING3: ["Réseaux Haut Débit", "Sécurité des Infrastructures"],
  },
  "Sécurité Informatique": {
    L3: ["Cryptographie", "Sécurité des Systèmes"],
    M1: ["Cybersécurité Avancée", "Sécurité des Réseaux"],
    M2: ["Cybersécurité Avancée", "Sécurité des Réseaux"],
    ING1: ["Sécurité Informatique"],
    ING2: ["Sécurité Offensive et Défensive", "Forensique Numérique"],
    ING3: ["Sécurité Offensive et Défensive", "Forensique Numérique"],
  },
  "Technologies Web et Mobile": {
    L3: ["Développement Web", "Développement Mobile"],
    M1: ["Architecture Web", "Applications Mobile Avancées"],
    M2: ["Architecture Web", "Applications Mobile Avancées"],
    ING1: ["Technologies Web et Mobile"],
    ING2: ["Développement Full Stack", "UX/UI Design"],
    ING3: ["Développement Full Stack", "UX/UI Design"],
  },
  "Mathématiques": {
    L3: ["Mathématiques Fondamentales", "Mathématiques Appliquées"],
    M1: ["Analyse Fonctionnelle", "Algèbre et Géométrie", "Mathématiques Numériques"],
    M2: ["Analyse Fonctionnelle", "Algèbre et Géométrie", "Mathématiques Numériques"],
  },
  "Recherche Opérationnelle": {
    L3: ["Optimisation", "Aide à la Décision"],
    M1: ["Optimisation Avancée", "Modélisation Stochastique"],
    M2: ["Optimisation Avancée", "Modélisation Stochastique"],
  },
  "Statistiques": {
    L3: ["Statistiques et Informatique Décisionnelle", "Actuariat"],
    M1: ["Statistiques Appliquées", "Biostatistiques"],
    M2: ["Statistiques Appliquées", "Biostatistiques"],
  },
  "Statistiques et Probabilités": {
    L3: ["Statistiques", "Probabilités Appliquées"],
    M1: ["Statistiques Mathématiques", "Modèles Stochastiques"],
    M2: ["Statistiques Mathématiques", "Modèles Stochastiques"],
  },
  "Électronique": {
    L3: ["Électronique des Systèmes", "Microélectronique"],
    M1: ["Électronique Avancée", "Conception de Circuits Intégrés"],
    M2: ["Électronique Avancée", "Conception de Circuits Intégrés"],
    ING1: ["Électronique"],
    ING2: ["Électronique Industrielle", "Microélectronique et Nano-Technologies"],
    ING3: ["Électronique Industrielle", "Microélectronique et Nano-Technologies"],
  },
  "Télécommunications": {
    L3: ["Réseaux de Télécommunications", "Traitement du Signal"],
    M1: ["Systèmes de Communications Avancés", "Réseaux Mobile 5G"],
    M2: ["Systèmes de Communications Avancés", "Réseaux Mobile 5G"],
    ING1: ["Télécommunications"],
    ING2: ["Réseaux et Télécommunications", "Communications Mobiles"],
    ING3: ["Réseaux et Télécommunications", "Communications Mobiles"],
  },
  "Génie Civil": {
    L3: ["Constructions", "Hydraulique Urbaine"],
    M1: ["Structures", "Géotechnique et Fondations", "Hydraulique"],
    M2: ["Structures", "Géotechnique et Fondations", "Hydraulique"],
    ING1: ["Génie Civil"],
    ING2: ["Structures et Matériaux", "Géotechnique"],
    ING3: ["Structures et Matériaux", "Géotechnique"],
  },
  "Génie Mécanique": {
    L3: ["Fabrication Mécanique", "Mécanique des Fluides"],
    M1: ["Conception Mécanique", "Mécatronique", "Énergétique"],
    M2: ["Conception Mécanique", "Mécatronique", "Énergétique"],
    ING1: ["Génie Mécanique"],
    ING2: ["Construction Mécanique", "Énergétique et Turbomachines"],
    ING3: ["Construction Mécanique", "Énergétique et Turbomachines"],
  },
  "Génie Électrique": {
    L3: ["Électrotechnique", "Automatique"],
    M1: ["Commande des Systèmes", "Électronique de Puissance"],
    M2: ["Commande des Systèmes", "Électronique de Puissance"],
    ING1: ["Génie Électrique"],
    ING2: ["Électrotechnique Industrielle", "Automatique et Systèmes Embarqués"],
    ING3: ["Électrotechnique Industrielle", "Automatique et Systèmes Embarqués"],
  },
  "Électrotechnique": {
    L3: ["Machines Électriques", "Systèmes de Puissance"],
    M1: ["Commande des Machines Électriques", "Réseaux Électriques Intelligents"],
    M2: ["Commande des Machines Électriques", "Réseaux Électriques Intelligents"],
    ING1: ["Électrotechnique"],
    ING2: ["Électrotechnique Industrielle", "Énergie Renouvelable"],
    ING3: ["Électrotechnique Industrielle", "Énergie Renouvelable"],
  },
  "Génie des Procédés": {
    L3: ["Procédés Chimiques", "Génie des Réactions"],
    M1: ["Génie des Procédés Avancés", "Génie de l'Environnement"],
    M2: ["Génie des Procédés Avancés", "Génie de l'Environnement"],
    ING1: ["Génie des Procédés"],
    ING2: ["Procédés Industriels", "Génie de l'Environnement"],
    ING3: ["Procédés Industriels", "Génie de l'Environnement"],
  },
  "Génie Industriel": {
    L3: ["Gestion de Production", "Qualité et Maintenance"],
    M1: ["Systèmes de Production", "Logistique Industrielle"],
    M2: ["Systèmes de Production", "Logistique Industrielle"],
    ING1: ["Génie Industriel"],
    ING2: ["Gestion Industrielle", "Sûreté et Maintenance Industrielle"],
    ING3: ["Gestion Industrielle", "Sûreté et Maintenance Industrielle"],
  },
  "Sciences Économiques": {
    L3: ["Économie Monétaire et Bancaire", "Économie du Développement"],
    M1: ["Économie Quantitative", "Finance et Banque"],
    M2: ["Économie Quantitative", "Finance et Banque"],
  },
  "Sciences Commerciales": {
    L3: ["Commerce International", "Marketing"],
    M1: ["Management Commercial", "Commerce Électronique"],
    M2: ["Management Commercial", "Commerce Électronique"],
  },
  "Sciences de Gestion": {
    L3: ["Management des Organisations", "Comptabilité et Audit"],
    M1: ["Management Stratégique", "Audit et Contrôle de Gestion"],
    M2: ["Management Stratégique", "Audit et Contrôle de Gestion"],
  },
};

export function getFacultes(etablissement: string): string[] {
  return FACULTES_SPECIFIQUES[etablissement] ?? FACULTES_COMMUNES;
}

export function getAllFacultes(): string[] {
  const all = new Set([...FACULTES_COMMUNES, ...Object.values(FACULTES_SPECIFIQUES).flat()]);
  return [...all].sort();
}

export function getDepartements(faculte: string): string[] {
  return DEPARTEMENTS_PAR_FACULTE[faculte] ?? [];
}

export function getSpecialites(departement: string, niveau: string): string[] {
  if (niveau === "L1" || niveau === "L2") return ["Tronc commun"];
  return SPECIALITES_PAR_DEPT_NIVEAU[departement]?.[niveau] ?? ["Spécialité principale"];
}

// ── Agent CRUD ──────────────────────────────────────────────────────────────

function loadAgents(): AgentAccount[] {
  try { return JSON.parse(localStorage.getItem(agentsKey()) ?? "[]"); }
  catch { return []; }
}

function saveAgents(a: AgentAccount[]) {
  localStorage.setItem(agentsKey(), JSON.stringify(a));
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

// ── Programme / Module CRUD ─────────────────────────────────────────────────

function loadProgrammes(): ProgrammeEntry[] {
  try { return JSON.parse(localStorage.getItem(programmesKey()) ?? "[]"); }
  catch { return []; }
}

function saveProgrammes(p: ProgrammeEntry[]) {
  localStorage.setItem(programmesKey(), JSON.stringify(p));
}

export function getProgrammes(): ProgrammeEntry[] { return loadProgrammes(); }

export function getModulesForProgramme(
  faculte: string, departement: string, specialite: string, niveau: string, semestre: string
): ModuleEntry[] {
  return loadProgrammes().find(p =>
    p.faculte === faculte && p.departement === departement &&
    p.specialite === specialite && p.niveau === niveau && p.semestre === semestre
  )?.modules ?? [];
}

export function addModuleToProgramme(
  faculte: string, departement: string, specialite: string, niveau: string, semestre: string,
  mod: Omit<ModuleEntry, "id">
) {
  const programmes = loadProgrammes();
  let entry = programmes.find(p =>
    p.faculte === faculte && p.departement === departement &&
    p.specialite === specialite && p.niveau === niveau && p.semestre === semestre
  );
  if (!entry) {
    entry = { faculte, departement, specialite, niveau, semestre, modules: [] };
    programmes.push(entry);
  }
  entry.modules.push({ ...mod, id: crypto.randomUUID() });
  saveProgrammes(programmes);
}

export function removeModuleFromProgramme(
  faculte: string, departement: string, specialite: string, niveau: string, semestre: string,
  moduleId: string
) {
  const programmes = loadProgrammes();
  const entry = programmes.find(p =>
    p.faculte === faculte && p.departement === departement &&
    p.specialite === specialite && p.niveau === niveau && p.semestre === semestre
  );
  if (entry) {
    entry.modules = entry.modules.filter(m => m.id !== moduleId);
    saveProgrammes(programmes);
  }
}
