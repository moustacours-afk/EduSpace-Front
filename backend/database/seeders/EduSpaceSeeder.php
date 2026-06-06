<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Annonce;
use App\Models\Deliberation;
use App\Models\Enseignant;
use App\Models\EnseignantPermission;
use App\Models\Etudiant;
use App\Models\Evenement;
use App\Models\Module;
use App\Models\Note;
use App\Models\Notification;
use App\Models\Recour;
use App\Models\Reinscription;
use App\Models\Salle;
use App\Models\Seance;
use App\Models\SoumissionNote;
use App\Models\Support;
use App\Models\SuperAgent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * EduSpace — Jeu de données de démonstration
 * Université Oran 1 Ahmed Ben Bella · Faculté des Sciences Exactes et Appliquées
 * Département d'Informatique
 *
 * Programme : LMD — Socle Commun Mathématiques-Informatique (L1) puis
 * Licence Informatique (L2 / L3), avec un exemple de cycle Ingéniorat (ING1).
 */
class EduSpaceSeeder extends Seeder
{
    private string $UNIV  = 'Université Oran 1 Ahmed Ben Bella';
    private string $FAC   = 'Faculté des Sciences Exactes et Appliquées';
    private string $DEPT  = "Département d'Informatique";
    private string $DOM   = 'univ-oran1.dz';
    private string $ANNEE = '2025-2026';

    public function run(): void
    {
        mt_srand(2026); // reproducible random grades

        // ════════════════════════════════════════════════════════════════════
        // 1. SUPER AGENT (niveau université / Vice-Rectorat Pédagogie)
        // ════════════════════════════════════════════════════════════════════
        $saUser = User::create(['email' => 'superagent@'.$this->DOM, 'password' => Hash::make('password'), 'initial_password' => 'password', 'role' => 'super_agent']);
        SuperAgent::create([
            'user_id' => $saUser->id, 'nom' => 'Belabbas', 'prenom' => 'Karim',
            'role' => 'Super Agent', 'departement' => 'Vice-Rectorat chargé de la Pédagogie',
            'universite' => $this->UNIV, 'faculte' => $this->FAC,
        ]);

        // ════════════════════════════════════════════════════════════════════
        // 2. AGENTS PÉDAGOGIQUES (1 Informatique = principal + 3 départements)
        // ════════════════════════════════════════════════════════════════════
        $agentsData = [
            ['n.ferhat@'.$this->DOM,   'Ferhat',   'Nadia',  "Département d'Informatique"],
            ['a.bensaid@'.$this->DOM,  'Bensaïd',  'Amina',  'Département de Mathématiques'],
            ['r.mansouri@'.$this->DOM, 'Mansouri', 'Rachid', 'Département de Physique'],
            ['s.boudiaf@'.$this->DOM,  'Boudiaf',  'Samira', 'Département de Chimie'],
        ];
        $agents = [];
        foreach ($agentsData as $ad) {
            $u = User::create(['email' => $ad[0], 'password' => Hash::make('password'), 'initial_password' => 'password', 'role' => 'agent']);
            $agents[$ad[3]] = Agent::create([
                'user_id' => $u->id, 'nom' => $ad[1], 'prenom' => $ad[2],
                'role' => 'Agent Pédagogique', 'departement' => $ad[3], 'statut' => 'actif',
                'universite' => $this->UNIV, 'faculte' => $this->FAC,
            ]);
        }
        $infoAgent     = $agents["Département d'Informatique"];
        $infoAgentUser = $infoAgent->user;

        // ════════════════════════════════════════════════════════════════════
        // 3. ENSEIGNANTS (corps professoral — Informatique + Maths + Physique)
        // ════════════════════════════════════════════════════════════════════
        $teacherData = [
            // code,        matricule,    nom,          prenom,    grade,        departement
            ['HADJ',        'ENS-INF-01', 'Hadj',       'Mohamed', 'MCA',        'Informatique'],
            ['ZIANI',       'ENS-INF-02', 'Ziani',      'Amira',   'MCB',        'Informatique'],
            ['BELKACEM',    'ENS-INF-03', 'Belkacem',   'Yacine',  'Professeur', 'Informatique'],
            ['KHELIFI',     'ENS-INF-04', 'Khelifi',    'Samia',   'MCA',        'Informatique'],
            ['BENMABROUK',  'ENS-INF-05', 'Benmabrouk', 'Karim',   'MAB',        'Informatique'],
            ['LAHMAR',      'ENS-INF-06', 'Lahmar',     'Fatima',  'MCB',        'Informatique'],
            ['BOUKHALFA',   'ENS-INF-07', 'Boukhalfa',  'Hocine',  'MCA',        'Informatique'],
            ['NMANSOURI',   'ENS-INF-08', 'Mansouri',   'Nawel',   'MAA',        'Informatique'],
            ['TALEB',       'ENS-INF-09', 'Taleb',      'Réda',    'MCB',        'Informatique'],
            ['SAIDI',       'ENS-INF-10', 'Saidi',      'Lamia',   'MAA',        'Informatique'],
            ['AMRANI',      'ENS-MAT-01', 'Amrani',     'Rachid',  'MCB',        'Mathématiques'],
            ['DJOUDI',      'ENS-MAT-02', 'Djoudi',     'Omar',    'Professeur', 'Mathématiques'],
            ['MEFTAH',      'ENS-PHY-01', 'Meftah',     'Nadia',   'MAA',        'Physique'],
        ];
        $ens = [];
        foreach ($teacherData as $td) {
            $nomSlug  = preg_replace('/[^a-z]/', '', strtolower(Str::ascii($td[2])));
            $initiale = preg_replace('/[^a-z]/', '', strtolower(Str::ascii(mb_substr($td[3], 0, 1))));
            $email    = $initiale.'.'.$nomSlug.'@'.$this->DOM;
            $u = User::create(['email' => $email, 'password' => Hash::make('password'), 'initial_password' => 'password', 'role' => 'enseignant']);
            $ens[$td[0]] = Enseignant::create([
                'user_id' => $u->id, 'matricule' => $td[1], 'nom' => $td[2],
                'prenom' => $td[3], 'grade' => $td[4], 'departement' => $td[5], 'statut_compte' => 'actif',
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 4. MODULES — Programme LMD (UEF/UEM/UED/UET)
        // ════════════════════════════════════════════════════════════════════
        // [code, intitulé, crédits, coef, type_ue, vhs, hasCours, hasTd, hasTp, %ex, %td, %tp, filière, niveau, semestre, codeEnseignant]
        $curriculum = [
            // ── L1 — Socle commun Mathématiques-Informatique — S1 ──
            ['INF1101', "Algorithmique et Structures de Données 1", 6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L1','S1','HADJ'],
            ['MAT1101', "Analyse 1",                                6, 4, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L1','S1','AMRANI'],
            ['MAT1102', "Algèbre 1",                                5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L1','S1','AMRANI'],
            ['INF1102', "Structure Machine 1",                      4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L1','S1','TALEB'],
            ['PHY1101', "Physique 1 (Mécanique du point)",          4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L1','S1','MEFTAH'],
            ['TRM1101', "Terminologie scientifique",                2, 1, 'UET', 22, 1,0,0, 100,0,0,  'Informatique','L1','S1','NMANSOURI'],
            ['LAN1101', "Langue étrangère 1 (Anglais)",             3, 1, 'UET', 22, 1,0,0, 100,0,0,  'Informatique','L1','S1','SAIDI'],

            // ── L1 — S2 ──
            ['INF1201', "Algorithmique et Structures de Données 2", 6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L1','S2','HADJ'],
            ['MAT1201', "Analyse 2",                                6, 4, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L1','S2','AMRANI'],
            ['MAT1202', "Algèbre 2",                                5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L1','S2','AMRANI'],
            ['INF1202', "Structure Machine 2",                      4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L1','S2','TALEB'],
            ['MAT1203', "Probabilités et Statistique Descriptive",  4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L1','S2','DJOUDI'],
            ['PHY1201', "Physique 2 (Électricité)",                 3, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L1','S2','MEFTAH'],
            ['LAN1201', "Langue étrangère 2 (Anglais technique)",   2, 1, 'UET', 22, 1,0,0, 100,0,0,  'Informatique','L1','S2','SAIDI'],

            // ── L2 — Licence Informatique — S3 ──
            ['INF2301', "Algorithmique et Structures de Données 3", 6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L2','S3','HADJ'],
            ['INF2302', "Architecture des Ordinateurs",            5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L2','S3','TALEB'],
            ['INF2303', "Programmation Orientée Objet",            6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L2','S3','ZIANI'],
            ['INF2304', "Logique Mathématique",                   4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L2','S3','DJOUDI'],
            ['MAT2301', "Mathématiques Discrètes",                4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L2','S3','AMRANI'],
            ['INF2305', "Systèmes d'Information",                 5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L2','S3','BOUKHALFA'],

            // ── L2 — S4 ──
            ['INF2401', "Théorie des Langages et Automates",      5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L2','S4','TALEB'],
            ['INF2402', "Systèmes d'Exploitation 1",              6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L2','S4','KHELIFI'],
            ['INF2403', "Bases de Données",                       6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L2','S4','BOUKHALFA'],
            ['INF2404', "Réseaux 1",                              5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L2','S4','BELKACEM'],
            ['MAT2401', "Analyse Numérique",                      4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L2','S4','DJOUDI'],
            ['INF2405', "Conception Orientée Objet (UML)",        4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L2','S4','LAHMAR'],

            // ── L3 — Licence Informatique — S5  (NIVEAU EXEMPLE PRINCIPAL) ──
            ['INF3501', "Systèmes d'Exploitation 2",              6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L3','S5','KHELIFI'],
            ['INF3502', "Réseaux Informatiques",                  5, 3, 'UEF', 67, 1,1,1, 60,20,20, 'Informatique','L3','S5','BELKACEM'],
            ['INF3503', "Génie Logiciel",                         5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L3','S5','LAHMAR'],
            ['INF3504', "Compilation",                            4, 2, 'UEF', 67, 1,1,1, 60,20,20, 'Informatique','L3','S5','NMANSOURI'],
            ['INF3505', "Bases de Données Avancées",              6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique','L3','S5','BOUKHALFA'],
            ['INF3506', "Intelligence Artificielle",              4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L3','S5','BENMABROUK'],

            // ── L3 — S6 ──
            ['INF3601', "Sécurité Informatique",                  5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique','L3','S6','BELKACEM'],
            ['INF3602', "Programmation Web et Mobile",            5, 3, 'UEF', 67, 1,1,1, 50,20,30, 'Informatique','L3','S6','NMANSOURI'],
            ['INF3603', "Systèmes Distribués",                    4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L3','S6','KHELIFI'],
            ['INF3604', "Méthodologie de Conception Logicielle",  4, 2, 'UEM', 45, 1,1,0, 60,40,0,  'Informatique','L3','S6','LAHMAR'],
            ['INF3605', "Projet de Fin de Cycle (PFE)",           8, 4, 'UEF', 90, 0,0,1, 0,0,100,  'Informatique','L3','S6','HADJ'],
            ['INF3606', "Anglais Technique et Entrepreneuriat",   4, 2, 'UET', 45, 1,1,0, 60,40,0,  'Informatique','L3','S6','SAIDI'],

            // ── Cycle Ingéniorat — ING1 — S1 (exemple) ──
            ['ING1101', "Mathématiques 1 (Analyse & Algèbre)",    6, 4, 'UEF', 90, 1,1,0, 60,40,0,  'Informatique - Ingéniorat','ING1','S1','AMRANI'],
            ['ING1102', "Algorithmique et Programmation",         6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Informatique - Ingéniorat','ING1','S1','HADJ'],
            ['ING1103', "Électronique Fondamentale",              5, 3, 'UEM', 67, 1,1,1, 60,20,20, 'Informatique - Ingéniorat','ING1','S1','MEFTAH'],
            ['ING1104', "Systèmes Logiques",                      5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Informatique - Ingéniorat','ING1','S1','TALEB'],

            // ── Autres départements (visibles côté Super-Agent) ──
            ['MTH2301', "Algèbre Linéaire 2",                     6, 4, 'UEF', 90, 1,1,0, 60,40,0,  'Mathématiques','L2','S3','AMRANI'],
            ['MTH2302', "Topologie",                              5, 3, 'UEF', 67, 1,1,0, 60,40,0,  'Mathématiques','L2','S3','DJOUDI'],
            ['PHY2301', "Mécanique Quantique",                    6, 4, 'UEF', 90, 1,1,0, 60,40,0,  'Physique','L2','S3','MEFTAH'],
            ['CHM1101', "Chimie Générale",                        6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Chimie','L1','S1', null],
            ['CHM1201', "Chimie Organique",                       6, 4, 'UEF', 90, 1,1,1, 60,20,20, 'Chimie','L1','S2', null],
        ];

        $modules = []; // code => Module
        foreach ($curriculum as $m) {
            $teacher = $m[15] ? ($ens[$m[15]] ?? null) : null;
            $module = Module::create([
                'code' => $m[0], 'intitule' => $m[1], 'credits' => $m[2], 'coefficient' => $m[3],
                'type_ue' => $m[4], 'nature' => 'obligatoire', 'vhs' => $m[5],
                'has_cours' => (bool) $m[6], 'duree_cours' => '1h30',
                'has_td' => (bool) $m[7], 'duree_td' => '1h30',
                'has_tp' => (bool) $m[8], 'duree_tp' => '1h30',
                'pct_examen' => $m[9], 'pct_td' => $m[10], 'pct_tp' => $m[11],
                'filiere' => $m[12], 'niveau' => $m[13], 'semestre' => $m[14],
                'enseignant_id' => $teacher?->id,
            ]);
            $modules[$m[0]] = $module;
            if ($teacher) {
                $module->enseignants()->attach($teacher->id, [
                    'role' => 'cc+tp', 'responsable' => true,
                    'groupes' => json_encode(['Groupe 1', 'Groupe 2']),
                ]);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 5. SALLES
        // ════════════════════════════════════════════════════════════════════
        $sallesData = [
            ['Amphi A',        250, 'Amphithéâtre', true],
            ['Amphi B',        200, 'Amphithéâtre', true],
            ['Salle 12',       40,  'Salle TD',     true],
            ['Salle 15',       40,  'Salle TD',     false],
            ['Labo BDD',       30,  'Laboratoire',  true],
            ['Labo Réseaux',   25,  'Laboratoire',  true],
            ['Labo Systèmes',  25,  'Laboratoire',  false],
            ['Labo IA',        30,  'Laboratoire',  true],
        ];
        $salles = [];
        foreach ($sallesData as $sd) {
            $salles[$sd[0]] = Salle::create(['nom' => $sd[0], 'capacite' => $sd[1], 'type' => $sd[2], 'disponible' => $sd[3]]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 6. ÉTUDIANTS
        // ════════════════════════════════════════════════════════════════════
        $usedEmails = [];
        $mkEmail = function (string $prenom, string $nom) use (&$usedEmails): string {
            $nomSlug  = preg_replace('/[^a-z]/', '', strtolower(Str::ascii($nom)));
            $initiale = preg_replace('/[^a-z]/', '', strtolower(Str::ascii(mb_substr($prenom, 0, 1))));
            $base     = $initiale.'.'.$nomSlug;
            $email    = $base.'@'.$this->DOM;
            $i = 1;
            while (in_array($email, $usedEmails, true) || User::where('email', $email)->exists()) {
                $email = $base.$i++.'@'.$this->DOM;
            }
            $usedEmails[] = $email;
            return $email;
        };

        $createStudent = function (array $s) use ($mkEmail): Etudiant {
            // $s = [matricule, nom, prenom, niveau, groupe, filiere?]
            $u = User::create(['email' => $mkEmail($s[2], $s[1]), 'password' => Hash::make('password'), 'initial_password' => 'password', 'role' => 'etudiant']);
            return Etudiant::create([
                'user_id' => $u->id, 'matricule' => $s[0], 'nom' => $s[1], 'prenom' => $s[2],
                'filiere' => $s[5] ?? 'Informatique', 'niveau' => $s[3], 'groupe' => $s[4],
                'section' => 'Section 1', 'departement' => $this->DEPT, 'universite' => $this->UNIV,
                'annee_universitaire' => $this->ANNEE, 'statut_compte' => 'actif',
                'statut_reinscription' => 'valide', 'statut_paiement' => 'paye', 'montant_paye' => 2500,
                'methode_payment' => 'CCP', 'reference_payment' => 'REF'.$s[0],
                'date_payment' => '2025-09-20',
            ]);
        };

        // ── L3 — 20 étudiants réels (noms + matricules fournis), Groupes 1 & 2 ──
        $primaryMat = '222237400711'; // KADI Islam — compte étudiant principal de la démo
        $l3Students = [
            ['222237400711','Kadi','Islam','L3','Groupe 1'],
            ['212137045124','Loukil','Mohammed Ilyes','L3','Groupe 1'],
            ['222237400601','Madoui','Hichem Ilies','L3','Groupe 1'],
            ['222237002608','Malki','Fouad','L3','Groupe 1'],
            ['222237327504','Mana','Yahia','L3','Groupe 1'],
            ['222237364001','Mebkhout','Youcef','L3','Groupe 1'],
            ['222237347305','Mecheri','Fatima Zohra','L3','Groupe 1'],
            ['222237475208','Mekkaoui','Abdelali','L3','Groupe 1'],
            ['222237335208','Miri','Nesrine','L3','Groupe 1'],
            ['222237356212','Mouro','Kawther','L3','Groupe 1'],
            ['222237347817','Negadi','Mohammed Aymene','L3','Groupe 2'],
            ['222237375720','Rahab','Mohammed','L3','Groupe 2'],
            ['212237473505','Riah','Youcef','L3','Groupe 2'],
            ['222237414805','Rouibi','Zahra Hibatou-Allah','L3','Groupe 2'],
            ['222237458717','Salah','Ahlem Nour-Imene','L3','Groupe 2'],
            ['222237355107','Semmache','Khadidja','L3','Groupe 2'],
            ['222237333006','Seridj','Houssem Eddine','L3','Groupe 2'],
            ['222238364008','Smail','Taha Miloud','L3','Groupe 2'],
            ['222237401612','Touati','Hanene','L3','Groupe 2'],
            ['222237427403','Toumi','Yasmine','L3','Groupe 2'],
        ];

        // ── L2 — 8 étudiants ──
        $l2Students = [
            ['232337010101','Belhadj','Sofiane','L2','Groupe 1'],
            ['232337010102','Cherif','Amina','L2','Groupe 1'],
            ['232337010103','Daoudi','Bilal','L2','Groupe 1'],
            ['232337010104','Hamdi','Yasmina','L2','Groupe 1'],
            ['232337010105','Kara','Riad','L2','Groupe 1'],
            ['232337010106','Larbi','Sara','L2','Groupe 1'],
            ['232337010107','Mansouri','Anis','L2','Groupe 1'],
            ['232337010108','Zerrouki','Lina','L2','Groupe 1'],
        ];

        // ── L1 — 8 étudiants ──
        $l1Students = [
            ['242437020201','Aoumeur','Walid','L1','Groupe 1'],
            ['242437020202','Brahimi','Nour','L1','Groupe 1'],
            ['242437020203','Dahmani','Imane','L1','Groupe 1'],
            ['242437020204','Ferradj','Oussama','L1','Groupe 1'],
            ['242437020205','Guerroudj','Meriem','L1','Groupe 1'],
            ['242437020206','Halimi','Zakaria','L1','Groupe 1'],
            ['242437020207','Idir','Selma','L1','Groupe 1'],
            ['242437020208','Othmani','Adel','L1','Groupe 1'],
        ];

        // ── ING1 — 6 étudiants (cycle ingéniorat) ──
        $ing1Students = [
            ['ING2400301','Belaid','Khaled','ING1','Groupe 1','Informatique - Ingéniorat'],
            ['ING2400302','Cherrad','Asma','ING1','Groupe 1','Informatique - Ingéniorat'],
            ['ING2400303','Fellah','Rayan','ING1','Groupe 1','Informatique - Ingéniorat'],
            ['ING2400304','Hadji','Soumia','ING1','Groupe 1','Informatique - Ingéniorat'],
            ['ING2400305','Merad','Bilal','ING1','Groupe 1','Informatique - Ingéniorat'],
            ['ING2400306','Sahraoui','Nadia','ING1','Groupe 1','Informatique - Ingéniorat'],
        ];

        $stuByMat = [];
        foreach (array_merge($l3Students, $l2Students, $l1Students, $ing1Students) as $s) {
            $stuByMat[$s[0]] = $createStudent($s);
        }

        // ════════════════════════════════════════════════════════════════════
        // 7. NOTES (transcripts) — L1/L2/L3 sur le semestre publié
        // ════════════════════════════════════════════════════════════════════
        $gradedSem = ['L1' => 'S1', 'L2' => 'S3', 'L3' => 'S5'];

        $makeNote = function (Etudiant $stu, Module $m, float $cc, float $exam, ?float $tp, string $statut = 'publie') {
            $moy = $tp !== null
                ? round($exam * 0.6 + $cc * 0.2 + $tp * 0.2, 2)
                : round($exam * 0.6 + $cc * 0.4, 2);
            $sit = $moy >= 10 ? 'admis' : ($moy >= 8 ? 'rattrapage' : 'ajourne');
            Note::create([
                'etudiant_id' => $stu->id, 'module_id' => $m->id, 'semestre' => $m->semestre,
                'note_controle' => $cc, 'note_exam' => $exam, 'note_tp' => $tp,
                'moyenne' => $moy, 'credit_acquis' => $sit === 'admis' ? $m->credits : 0,
                'situation' => $sit, 'statut' => $statut,
            ]);
        };

        foreach ($stuByMat as $mat => $stu) {
            $sem = $gradedSem[$stu->niveau] ?? null;
            if (! $sem) continue; // ING1 : pas de notes publiées (exemple roster)
            $mods = Module::where('filiere', 'Informatique')->where('niveau', $stu->niveau)->where('semestre', $sem)->get();
            foreach ($mods as $m) {
                // Compte principal : une note contestable en Compilation pour illustrer le recours
                if ($mat === $primaryMat && $m->code === 'INF3504') {
                    $makeNote($stu, $m, 9.0, 8.5, $m->has_tp ? 9.5 : null);
                    continue;
                }
                $cc   = mt_rand(80, 170) / 10;
                $exam = mt_rand(65, 175) / 10;
                $tp   = $m->has_tp ? mt_rand(90, 180) / 10 : null;
                $makeNote($stu, $m, $cc, $exam, $tp);
            }
        }

        // Compte principal (KADI Islam) : ajout du semestre S6 pour un relevé complet
        $primary = $stuByMat[$primaryMat];
        foreach (Module::where('filiere', 'Informatique')->where('niveau', 'L3')->where('semestre', 'S6')->get() as $m) {
            $cc   = mt_rand(110, 165) / 10;
            $exam = mt_rand(105, 170) / 10;
            $tp   = $m->has_tp ? mt_rand(120, 175) / 10 : null;
            $makeNote($primary, $m, $cc, $exam, $tp, 'publie');
        }

        // ════════════════════════════════════════════════════════════════════
        // 8. SÉANCES — Emploi du temps L3 / S5 (semaine algérienne Dim → Jeu)
        // ════════════════════════════════════════════════════════════════════
        $seancesData = [
            // moduleCode, type, jour, début, fin, salle, groupes, statut, enseignantCode
            ['INF3501','CM','Dimanche','08:00','09:30','Amphi A',     ['Groupe 1','Groupe 2'],'normal', 'KHELIFI'],
            ['INF3505','CM','Dimanche','09:45','11:15','Amphi A',     ['Groupe 1','Groupe 2'],'normal', 'BOUKHALFA'],
            ['INF3502','CM','Lundi',   '08:00','09:30','Amphi B',     ['Groupe 1','Groupe 2'],'normal', 'BELKACEM'],
            ['INF3503','CM','Lundi',   '09:45','11:15','Amphi B',     ['Groupe 1','Groupe 2'],'annule', 'LAHMAR'],
            ['INF3504','CM','Mardi',   '08:00','09:30','Amphi A',     ['Groupe 1','Groupe 2'],'normal', 'NMANSOURI'],
            ['INF3506','CM','Mardi',   '09:45','11:15','Amphi A',     ['Groupe 1','Groupe 2'],'normal', 'BENMABROUK'],
            ['INF3505','TP','Mercredi','08:00','09:30','Labo BDD',    ['Groupe 1'],           'normal', 'BOUKHALFA'],
            ['INF3501','TP','Mercredi','09:45','11:15','Labo Systèmes',['Groupe 2'],          'reporte','KHELIFI'],
            ['INF3502','TP','Jeudi',   '08:00','09:30','Labo Réseaux',['Groupe 1'],           'normal', 'BELKACEM'],
            ['INF3504','TD','Jeudi',   '09:45','11:15','Salle 12',    ['Groupe 2'],           'normal', 'NMANSOURI'],
        ];
        foreach ($seancesData as $sd) {
            if (! isset($modules[$sd[0]])) continue;
            Seance::create([
                'module_id' => $modules[$sd[0]]->id,
                'enseignant_id' => $ens[$sd[8]]?->id,
                'salle_id' => $salles[$sd[5]]?->id,
                'type' => $sd[1], 'jour' => $sd[2], 'heure_debut' => $sd[3], 'heure_fin' => $sd[4],
                'groupes' => $sd[6], 'statut' => $sd[7],
                'filiere' => 'Informatique', 'niveau' => 'L3', 'semestre' => 'S5',
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 9. SUPPORTS DE COURS (L3 / S5)
        // ════════════════════════════════════════════════════════════════════
        $supportsData = [
            ['INF3501','Cours 1 — Gestion de la mémoire','cours','pdf','2.6 MB','KHELIFI'],
            ['INF3501','TP 1 — Ordonnancement des processus','tp','pdf','0.9 MB','KHELIFI'],
            ['INF3505','Cours — Optimisation des requêtes SQL','cours','pdf','3.4 MB','BOUKHALFA'],
            ['INF3505','TP 2 — Indexation et transactions','tp','pdf','1.2 MB','BOUKHALFA'],
            ['INF3502','Cours — Couches TCP/IP','cours','ppt','5.1 MB','BELKACEM'],
            ['INF3503','Cours — Cycle en V et méthodes agiles','cours','pdf','2.2 MB','LAHMAR'],
            ['INF3504','Cours — Analyse lexicale et syntaxique','cours','pdf','2.8 MB','NMANSOURI'],
            ['INF3504','Corrigé TD 1 — Automates','corriges','pdf','1.0 MB','NMANSOURI'],
        ];
        foreach ($supportsData as $i => $sp) {
            if (! isset($modules[$sp[0]])) continue;
            Support::create([
                'module_id' => $modules[$sp[0]]->id, 'enseignant_id' => $ens[$sp[5]]?->id,
                'nom' => $sp[1], 'type' => $sp[2], 'format' => $sp[3], 'taille' => $sp[4],
                'date_upload' => '2025-10-'.str_pad((string) (5 + $i), 2, '0', STR_PAD_LEFT),
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 10. SOUMISSIONS DE NOTES (workflow enseignant → agent)
        // ════════════════════════════════════════════════════════════════════
        $gsData = [
            // moduleCode, niveau, groupe, semestre, statut, nb, notesSoumises, dateDepot
            ['INF3501','L3','Groupe 1','S5','soumis',     28, true,  '2026-01-05'],
            ['INF3501','L3','Groupe 2','S5','valide',     22, true,  '2026-01-05'],
            ['INF3505','L3','Groupe 1','S5','publie',     28, true,  '2026-01-03'],
            ['INF3505','L3','Groupe 2','S5','publie',     22, true,  '2026-01-03'],
            ['INF3503','L3','Groupe 1','S5','soumis',     28, true,  '2026-01-06'],
            ['INF3503','L3','Groupe 2','S5','en_attente', 22, false, null],
            ['INF3502','L3','Groupe 1','S5','publie',     28, true,  '2026-01-02'],
            ['INF3504','L3','Groupe 1','S5','soumis',     28, true,  '2026-01-07'],
            ['INF3506','L3','Groupe 2','S5','valide',     22, true,  '2026-01-04'],
            ['INF3601','L3','Groupe 1','S6','en_attente', 28, false, null],
        ];
        foreach ($gsData as $gs) {
            if (! isset($modules[$gs[0]])) continue;
            $module = $modules[$gs[0]];
            SoumissionNote::create([
                'module_id' => $module->id, 'enseignant_id' => $module->enseignant_id,
                'filiere' => 'Informatique', 'niveau' => $gs[1], 'groupe' => $gs[2], 'semestre' => $gs[3],
                'type' => 'CC+Examen', 'nb_etudiants' => $gs[5], 'statut' => $gs[4],
                'notes_soumises' => $gs[6], 'date_depot' => $gs[7],
                'valide_par' => in_array($gs[4], ['valide', 'publie'], true) ? $infoAgent->id : null,
                'valide_le' => in_array($gs[4], ['valide', 'publie'], true) ? now() : null,
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 11. RECOURS (réclamations de notes) — les 4 états du workflow
        // ════════════════════════════════════════════════════════════════════
        $recoursData = [
            // matricule, moduleCode, note_type, note_actuelle, motif, statut, note_proposee, commentaire, enseignantCode, agentValide, notifie
            [$primaryMat,'INF3504','exam',8.5,
                "Je conteste la note de l'examen de Compilation : je pense qu'une partie de ma copie (exercice 3 sur l'analyse syntaxique) n'a pas été corrigée.",
                'en_attente', null, null, null, false, false],
            ['222237347305','INF3502','controle',9.0,
                "Erreur probable dans le report de ma note de contrôle continu de Réseaux.",
                'accepte', 12.5, "Après vérification, une erreur de report a été constatée. Note corrigée.", 'BELKACEM', false, true],
            ['222237335208','INF3505','exam',11.0,
                "Demande de révision de la note d'examen de Bases de Données Avancées.",
                'refuse', null, "Copie recorrigée : la note initiale est confirmée.", 'BOUKHALFA', false, true],
            ['222237401612','INF3503','generale',9.5,
                "Demande de réexamen de la moyenne du module Génie Logiciel.",
                'valide_agent', 10.5, "Réclamation fondée : moyenne réévaluée et validée par l'administration.", 'LAHMAR', true, true],
            ['222237347817','INF3501','tp',10.0,
                "Ma note de TP de Systèmes d'Exploitation 2 ne correspond pas au travail rendu.",
                'en_attente', null, null, null, false, false],
        ];
        foreach ($recoursData as $r) {
            if (! isset($stuByMat[$r[0]]) || ! isset($modules[$r[1]])) continue;
            $treated = in_array($r[5], ['accepte', 'refuse', 'valide_agent'], true);
            Recour::create([
                'etudiant_id' => $stuByMat[$r[0]]->id, 'module_id' => $modules[$r[1]]->id, 'semestre' => 'S5',
                'note_type' => $r[2], 'note_actuelle' => $r[3], 'motif' => $r[4], 'statut' => $r[5],
                'note_proposee' => $r[6], 'commentaire_enseignant' => $r[7],
                'enseignant_id' => $r[8] ? ($ens[$r[8]]->id ?? null) : null,
                'agent_id' => $r[9] ? $infoAgent->id : null,
                'notifie_etudiant' => $r[10],
                'traite_le' => $treated ? now()->subDays(2) : null,
                'valide_le' => $r[5] === 'valide_agent' ? now()->subDay() : null,
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 12. PERMISSIONS DE SAISIE (agent → enseignants, S5)
        // ════════════════════════════════════════════════════════════════════
        $permData = [
            ['KHELIFI',   true,  true],
            ['BELKACEM',  true,  true],
            ['BOUKHALFA', true,  true],
            ['NMANSOURI', true,  true],
            ['LAHMAR',    true,  false], // CC seulement
        ];
        foreach ($permData as $p) {
            EnseignantPermission::create([
                'enseignant_id' => $ens[$p[0]]->id, 'agent_id' => $infoAgent->id,
                'peut_saisir_cc' => $p[1], 'peut_saisir_examen' => $p[2], 'semestre' => 'S5',
                'notes_admin' => 'Saisie autorisée pour la session du semestre S5 (2025-2026).',
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 13. DÉLIBÉRATIONS
        // ════════════════════════════════════════════════════════════════════
        $delibData = [
            ['L3','S5','terminee',      '2026-01-22', 16, 2, 2],
            ['L2','S3','en_cours',      null,          0, 0, 0],
            ['L1','S1','en_preparation',null,          0, 0, 0],
            ['L3','S6','en_preparation',null,          0, 0, 0],
        ];
        foreach ($delibData as $d) {
            Deliberation::create([
                'filiere' => 'Informatique', 'niveau' => $d[0], 'semestre' => $d[1],
                'annee_universitaire' => $this->ANNEE, 'statut' => $d[2], 'date_deliberation' => $d[3],
                'nb_admis' => $d[4], 'nb_ajourne' => $d[5], 'nb_rattrapage' => $d[6], 'agent_id' => $infoAgent->id,
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 14. RÉINSCRIPTIONS (dossiers — différents états)
        // ════════════════════════════════════════════════════════════════════
        $docTypes = ['CNI', 'Attestation de naissance', 'Bac original', 'Relevé de notes', 'Reçu de paiement'];
        $reinsStatuts = ['valide', 'valide', 'en_attente', 'incomplet', 'valide', 'en_attente', 'rejete', 'valide'];
        $i = 0;
        foreach (array_slice(array_keys($stuByMat), 0, 8) as $mat) {
            $stu = $stuByMat[$mat];
            $st  = $reinsStatuts[$i % count($reinsStatuts)];
            $paye = $st === 'valide';
            Reinscription::create([
                'etudiant_id' => $stu->id, 'annee_universitaire' => $this->ANNEE, 'statut' => $st,
                'statut_paiement' => $paye ? 'paye' : 'non_paye', 'montant' => $paye ? 2500 : 0,
                'methode_payment' => $paye ? 'CCP' : null, 'reference_payment' => $paye ? 'REF'.$mat : null,
                'date_payment' => $paye ? '2025-09-22' : null,
                'documents' => array_map(fn ($t, $k) => [
                    'type' => $t, 'soumis' => $st !== 'incomplet' || $k < 3, 'verifie' => $st === 'valide',
                ], $docTypes, array_keys($docTypes)),
                'audit_trail' => $st === 'valide'
                    ? [
                        ['date' => '2025-09-12 09:30', 'action' => "Dossier soumis par l'étudiant", 'agent' => 'Système'],
                        ['date' => '2025-09-18 14:20', 'action' => 'Réinscription validée', 'agent' => 'Ferhat Nadia'],
                    ]
                    : [['date' => '2025-09-12 09:30', 'action' => "Dossier soumis par l'étudiant", 'agent' => 'Système']],
                'traite_par' => $st === 'valide' ? $infoAgent->id : null,
                'traite_le' => $st === 'valide' ? now()->subMonths(8) : null,
            ]);
            $i++;
        }

        // ════════════════════════════════════════════════════════════════════
        // 15. ANNONCES UNIVERSITAIRES (visibles enseignants + étudiants)
        // ════════════════════════════════════════════════════════════════════
        $annoncesData = [
            ['Forum des Clubs Scientifiques 2025-2026',
                "La Journée des Clubs de l'Université Oran 1 se tiendra le 26 novembre à la salle omnisports. Clubs robotique, IA, cybersécurité, photographie et plus encore. Inscription libre.",
                'Club', '🎭', 'bg-violet-50 border-violet-200 text-violet-800', '2025-11-20'],
            ['Conférence — Intelligence Artificielle & Société',
                "Le Pr. Hassan Benali animera une conférence ouverte le 25 novembre à 10h en Amphi A. Entrée libre dans la limite des places disponibles.",
                'Conférence', '🎤', 'bg-blue-50 border-blue-200 text-blue-800', '2025-11-15'],
            ['Formation — Git & GitHub pour étudiants',
                "Formation pratique gratuite de 2 jours sur Git et GitHub, les 22 et 23 novembre au Labo BDD. Réservez votre place auprès du département.",
                'Formation', '💻', 'bg-teal-50 border-teal-200 text-teal-800', '2025-11-10'],
            ['Compétition de Programmation ACM/ICPC — Sélection régionale Oran',
                "Représentez le Département d'Informatique à la sélection régionale ACM/ICPC. Équipes de 3 étudiants, inscriptions avant le 5 décembre.",
                'Compétition', '🏆', 'bg-amber-50 border-amber-200 text-amber-800', '2025-11-05'],
            ['Avis — Clôture des réinscriptions pédagogiques',
                "La période de réinscription pédagogique est clôturée le 30 octobre. Tout dossier incomplet après cette date sera traité au cas par cas par la scolarité.",
                'Administratif', '📋', 'bg-slate-50 border-slate-200 text-slate-800', '2025-10-28'],
            ["Journée Portes Ouvertes — Département d'Informatique",
                "Le Département d'Informatique organise sa Journée Portes Ouvertes le 3 décembre : présentation des spécialités, projets étudiants et débouchés. Amphi A & B.",
                'Conférence', '🎤', 'bg-blue-50 border-blue-200 text-blue-800', '2025-12-01'],
        ];
        foreach ($annoncesData as $ad) {
            Annonce::create([
                'titre' => $ad[0], 'contenu' => $ad[1], 'categorie' => $ad[2], 'icon' => $ad[3], 'couleur' => $ad[4],
                'audience' => 'all', 'date_publication' => $ad[5], 'auteur_id' => $infoAgentUser->id,
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 16. NOTIFICATIONS (compte étudiant principal — KADI Islam)
        // ════════════════════════════════════════════════════════════════════
        $notifsData = [
            ["Le cours de Réseaux Informatiques du Lundi 08h (Amphi B) est annulé.", 'annulation', false],
            ["Le TP de Systèmes d'Exploitation 2 est reporté au Jeudi 16h (Labo Systèmes).", 'horaire', false],
            ["Votre réclamation concernant la note de Compilation a bien été enregistrée.", 'recours', false],
            ["Les notes de Bases de Données Avancées ont été publiées.", 'note', true],
            ["Nouveau support de cours disponible pour Génie Logiciel.", 'general', true],
        ];
        foreach ($notifsData as $nd) {
            Notification::create(['user_id' => $primary->user_id, 'message' => $nd[0], 'type' => $nd[1], 'lu' => $nd[2]]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 17. CALENDRIER ACADÉMIQUE + PLANNING DES EXAMENS (2025-2026)
        // ════════════════════════════════════════════════════════════════════
        $eventsData = [
            // Calendrier académique
            ['2025-09-14', 'Rentrée universitaire 2025-2026', "Début officiel de l'année académique", 'green'],
            ['2025-09-15', 'Ouverture des réinscriptions', 'Début de la période de réinscription pédagogique', 'green'],
            ['2025-10-30', 'Clôture des réinscriptions', 'Date limite de dépôt des dossiers de réinscription', 'red'],
            ['2025-11-16', 'Contrôles continus S5 — Semaine 1', 'Première série de contrôles continus', 'blue'],
            ['2026-01-15', 'Date limite de soumission des notes S5', 'Les enseignants doivent soumettre les notes', 'red'],
            ['2026-01-22', 'Délibérations S5', 'Commission de délibération du semestre 5', 'blue'],
            ['2026-01-28', 'Publication des résultats S5', 'Mise en ligne officielle des résultats', 'red'],
            ['2026-02-15', 'Début du semestre S6', 'Reprise des cours', 'green'],
            ['2026-06-25', 'Délibérations finales', 'Commission de délibération annuelle', 'blue'],
            // Planning des examens — session S5 (janvier 2026)
            ['2026-01-04', 'Examen — Systèmes d\'Exploitation 2', 'Amphi A · 09:00 — L3 Informatique', 'amber'],
            ['2026-01-06', 'Examen — Réseaux Informatiques', 'Amphi A · 09:00 — L3 Informatique', 'amber'],
            ['2026-01-08', 'Examen — Génie Logiciel', 'Amphi B · 11:00 — L3 Informatique', 'amber'],
            ['2026-01-11', 'Examen — Compilation', 'Amphi A · 09:00 — L3 Informatique', 'amber'],
            ['2026-01-13', 'Examen — Bases de Données Avancées', 'Amphi B · 09:00 — L3 Informatique', 'amber'],
            ['2026-01-15', 'Examen — Intelligence Artificielle', 'Amphi A · 11:00 — L3 Informatique', 'amber'],
        ];
        foreach ($eventsData as $ed) {
            Evenement::create(['date' => $ed[0], 'titre' => $ed[1], 'description' => $ed[2], 'type' => $ed[3]]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 18. GÉNÉRATION EN MASSE — population réaliste de l'université
        //     (Informatique + Mathématiques + Physique + Chimie · tous niveaux)
        // ════════════════════════════════════════════════════════════════════
        DB::transaction(function () use ($agents, $salles) {
            $this->seedBulkDepartments($agents, $salles);
        });

        // ════════════════════════════════════════════════════════════════════
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('  EduSpace — Données de démonstration · '.$this->UNIV);
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('  Comptes de démonstration (mot de passe : password)');
        $this->command->info('  • Super Agent : superagent@'.$this->DOM);
        $this->command->info('  • Agent Info. : n.ferhat@'.$this->DOM);
        $this->command->info('  • Enseignant  : m.hadj@'.$this->DOM);
        $this->command->info('  • Étudiant    : '.$primaryMat.' (KADI Islam)');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('  Étudiants: '.Etudiant::count().' · Modules: '.Module::count().' · Enseignants: '.Enseignant::count());
        $this->command->info('  Notes: '.Note::count().' · Recours: '.Recour::count().' · Annonces: '.Annonce::count());
        $this->command->info('═══════════════════════════════════════════════════════════');
    }

    // ════════════════════════════════════════════════════════════════════════
    // Génération en masse — étudiants/enseignants/modules/emplois du temps/notes
    // pour Informatique + Mathématiques + Physique + Chimie, tous niveaux.
    // Chaque niveau : 2 sections (A/B) × 2 groupes, ~30 étudiants, chaque groupe
    // ayant son propre emploi du temps. Mots de passe persistés (initial_password).
    // ════════════════════════════════════════════════════════════════════════
    private function seedBulkDepartments(array $agents, array $salles): void
    {
        $salleList = array_values($salles);
        $jours     = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi'];
        $creneaux  = [['08:00', '09:30'], ['09:45', '11:15'], ['11:30', '13:00'], ['13:30', '15:00'], ['15:15', '16:45']];

        // ── Réservoirs de noms algériens ──────────────────────────────────────
        $noms = [
            'Benali','Boukhalfa','Khaldi','Belhadj','Cherif','Mansouri','Hamdani','Saadi','Zerrouki','Larbi',
            'Bouzid','Meziane','Djebbar','Rahmani','Brahimi','Achouri','Kaddour','Slimani','Bouchama','Hadjadj',
            'Ferhat','Belkacem','Touati','Dahmani','Bennour','Guerroudj','Mokrani','Lounis','Benyahia','Aitouche',
            'Naceri','Belaid','Charef','Ouali','Berkane','Hammou','Sebti','Yahiaoui','Khelil','Bensalem',
            'Madani','Tahar','Boudjema','Reguig','Senouci','Bechiri','Maamar','Hocine','Djellal','Benabbou',
            'Lakhdari','Mestari','Bouras','Nedjar','Ziane','Bakhti','Heddad','Saidani','Merabet','Drici',
        ];
        $prenomsM = [
            'Mohamed','Ahmed','Yacine','Bilal','Amine','Sofiane','Riad','Walid','Adel','Karim',
            'Oussama','Anis','Zakaria','Réda','Hocine','Khaled','Rayan','Islam','Younes','Nabil',
            'Toufik','Abdelkader','Mehdi','Idris','Samir','Lotfi','Fouad','Hamza','Aymen','Imad',
        ];
        $prenomsF = [
            'Amina','Yasmine','Sara','Lina','Nour','Imane','Meriem','Selma','Nesrine','Kawther',
            'Fatima','Khadidja','Soumia','Asma','Lamia','Nadia','Hanene','Rania','Wissam','Chaima',
            'Ikram','Zahra','Hiba','Maroua','Manel','Loubna','Djamila','Sabrina','Nawel','Rym',
        ];

        // ── Réservoirs de modules par département / niveau (10 modules → 5+5) ──
        $C = [
            'Informatique' => [
                'L1' => ['Algorithmique 1','Analyse 1','Algèbre 1','Structure Machine 1','Terminologie Scientifique','Algorithmique 2','Analyse 2','Algèbre 2','Probabilités & Statistiques','Anglais Technique'],
                'L2' => ['Structures de Données','Programmation Orientée Objet','Architecture des Ordinateurs','Logique Mathématique','Mathématiques Discrètes','Théorie des Langages','Systèmes d\'Exploitation 1','Bases de Données','Réseaux 1','Conception Orientée Objet'],
                'L3' => ['Systèmes d\'Exploitation 2','Réseaux Informatiques','Génie Logiciel','Compilation','Bases de Données Avancées','Intelligence Artificielle','Sécurité Informatique','Programmation Web et Mobile','Systèmes Distribués','Projet de Fin de Cycle'],
                'M1' => ['Systèmes d\'Information Avancés','Apprentissage Automatique','Recherche Opérationnelle','Sécurité des Systèmes','Méthodes Formelles','Fouille de Données','Vision par Ordinateur','Systèmes Multi-Agents','Cloud et Virtualisation','Anglais Scientifique'],
                'M2' => ['Apprentissage Profond','Big Data','Traitement du Langage Naturel','Sécurité des Réseaux Avancée','Informatique Décisionnelle','Systèmes Distribués Avancés','Méthodologie de Recherche','Entrepreneuriat','Projet de Recherche','Séminaire'],
                'ING1' => ['Mathématiques 1','Algorithmique et Programmation 1','Électronique Fondamentale','Systèmes Logiques','Physique 1','Mathématiques 2','Algorithmique et Programmation 2','Structure Machine','Probabilités et Statistiques','Anglais Technique'],
                'ING2' => ['Programmation Orientée Objet','Structures de Données','Architecture des Ordinateurs','Théorie des Graphes','Bases de Données','Systèmes d\'Exploitation','Réseaux 1','Méthodes Numériques','Logique Mathématique','Économie Numérique'],
                'ING3' => ['Génie Logiciel','Compilation','Réseaux 2','Bases de Données Avancées','Intelligence Artificielle','Sécurité Informatique','Programmation Web','Systèmes Temps Réel','Recherche Opérationnelle','Management de Projet'],
                'ING4' => ['Apprentissage Automatique','Cloud Computing','Cybersécurité','Big Data','Développement Mobile','Vision par Ordinateur','Systèmes Embarqués','DevOps','Blockchain','Anglais Professionnel'],
                'ING5' => ['Projet de Fin d\'Études','Intelligence Artificielle Avancée','Architecture Logicielle','Sécurité Offensive','Gestion d\'Entreprise','Internet des Objets','Systèmes Distribués','Stage en Entreprise','Séminaire Industriel','Éthique du Numérique'],
            ],
            'Mathématiques' => [
                'L1' => ['Analyse 1','Algèbre 1','Géométrie','Informatique 1','Logique Mathématique','Analyse 2','Algèbre 2','Statistique Descriptive','Physique 1','Anglais 1'],
                'L2' => ['Analyse 3','Algèbre Linéaire','Probabilités','Topologie 1','Analyse Numérique','Analyse 4','Algèbre 4','Équations Différentielles','Programmation','Anglais 2'],
                'L3' => ['Analyse Fonctionnelle','Théorie de la Mesure','Topologie 2','Algèbre Générale','Probabilités Avancées','Optimisation','Analyse Complexe','Géométrie Différentielle','Statistique Inférentielle','Méthodes Numériques'],
                'M1' => ['Analyse Réelle Avancée','Processus Stochastiques','Géométrie Algébrique','Théorie des Nombres','Statistique Mathématique','Analyse Harmonique','Équations aux Dérivées Partielles','Recherche Opérationnelle','Modélisation','Anglais Scientifique'],
                'M2' => ['Probabilités Avancées','Statistique Bayésienne','Théorie Spectrale','Optimisation Stochastique','Mathématiques Financières','Analyse Numérique Avancée','Cryptographie Mathématique','Méthodologie','Projet de Recherche','Séminaire'],
            ],
            'Physique' => [
                'L1' => ['Mécanique du Point','Électricité','Thermodynamique','Mathématiques pour Physiciens 1','Chimie Générale','Optique Géométrique','Mathématiques pour Physiciens 2','Informatique','Métrologie','Anglais 1'],
                'L2' => ['Mécanique Analytique','Électromagnétisme 1','Optique Physique','Thermodynamique Statistique','Électronique 1','Électromagnétisme 2','Mécanique des Fluides','Méthodes Mathématiques','Travaux Pratiques','Anglais 2'],
                'L3' => ['Mécanique Quantique','Physique du Solide','Physique Atomique','Physique Nucléaire','Électronique 2','Physique Statistique','Relativité Restreinte','Lasers et Optique','Capteurs','Projet'],
                'M1' => ['Mécanique Quantique Avancée','Physique des Matériaux','Physique des Semi-conducteurs','Électrodynamique','Physique Numérique','Spectroscopie','Nanophysique','Énergies Renouvelables','Instrumentation','Anglais Scientifique'],
                'M2' => ['Physique des Plasmas','Photonique','Matière Condensée','Modélisation Numérique','Physique du Laser','Caractérisation des Matériaux','Énergie Solaire','Méthodologie','Projet de Recherche','Séminaire'],
            ],
            'Chimie' => [
                'L1' => ['Chimie Générale','Chimie Organique 1','Chimie Minérale','Mathématiques','Physique 1','Thermodynamique Chimique','Chimie des Solutions','Informatique','Métrologie','Anglais 1'],
                'L2' => ['Chimie Organique 2','Chimie Analytique','Chimie Physique','Cristallographie','Cinétique Chimique','Spectroscopie','Électrochimie','Chimie Inorganique','Travaux Pratiques','Anglais 2'],
                'L3' => ['Chimie Organique Avancée','Chimie de Coordination','Chimie Quantique','Polymères','Chimie Industrielle','Analyse Instrumentale','Catalyse','Chimie de l\'Environnement','Projet','Anglais 3'],
                'M1' => ['Synthèse Organique','Chimie des Matériaux','Modélisation Moléculaire','Méthodes Spectroscopiques','Chimie Verte','Génie des Procédés','Nanomatériaux','Sécurité Chimique','Caractérisation','Anglais Scientifique'],
                'M2' => ['Chimie Pharmaceutique','Chimie Supramoléculaire','Procédés Industriels','Chimie Analytique Avancée','Photochimie','Toxicologie','Valorisation','Méthodologie','Projet de Recherche','Séminaire'],
            ],
        ];

        // ── Configuration des départements ────────────────────────────────────
        $depts = [
            ['name' => 'Informatique',   'agentKey' => "Département d'Informatique",   'prefix' => 'INF', 'matDept' => '37', 'niveaux' => ['L1','L2','L3','M1','M2','ING1','ING2','ING3','ING4','ING5']],
            ['name' => 'Mathématiques',  'agentKey' => 'Département de Mathématiques', 'prefix' => 'MAT', 'matDept' => '31', 'niveaux' => ['L1','L2','L3','M1','M2']],
            ['name' => 'Physique',       'agentKey' => 'Département de Physique',      'prefix' => 'PHY', 'matDept' => '42', 'niveaux' => ['L1','L2','L3','M1','M2']],
            ['name' => 'Chimie',         'agentKey' => 'Département de Chimie',        'prefix' => 'CHM', 'matDept' => '55', 'niveaux' => ['L1','L2','L3','M1','M2']],
        ];

        // Semestres par niveau (1er = semestre publié, avec notes)
        $semMap = [
            'L1' => ['S1','S2'], 'L2' => ['S3','S4'], 'L3' => ['S5','S6'],
            'M1' => ['S1','S2'], 'M2' => ['S3','S4'],
            'ING1' => ['S1','S2'], 'ING2' => ['S3','S4'], 'ING3' => ['S5','S6'], 'ING4' => ['S7','S8'], 'ING5' => ['S9','S10'],
        ];
        $niveauCode = ['L1'=>'11','L2'=>'12','L3'=>'13','M1'=>'21','M2'=>'22','ING1'=>'31','ING2'=>'32','ING3'=>'33','ING4'=>'34','ING5'=>'35'];
        $grades = ['MAA','MAB','MCA','MCB','Professeur'];
        $sectionsMap = ['Section 1' => ['Groupe 1','Groupe 2'], 'Section 2' => ['Groupe 3','Groupe 4']];
        $allGroups = ['Groupe 1','Groupe 2','Groupe 3','Groupe 4'];

        $used = ['email' => [], 'mat' => [], 'code' => []];
        $rndPwd = function (): string {
            $c = 'abcdefghijkmnpqrstuvwxyz23456789';
            return substr(str_shuffle(str_repeat($c, 2)), 0, 8);
        };
        $uniqueEmail = function (string $base) use (&$used): string {
            $email = $base.'@eduspace.local'; $i = 1;
            while (in_array($email, $used['email'], true) || User::where('email', $email)->exists()) {
                $email = $base.$i++.'@eduspace.local';
            }
            $used['email'][] = $email;
            return $email;
        };

        foreach ($depts as $d) {
            $deptName = $d['name'];
            $agent    = $agents[$d['agentKey']] ?? null;

            // ── Corps enseignant du département (existants + 10 générés) ──
            $teachers = Enseignant::where('departement', $deptName)->get()->all();
            for ($t = 0; $t < 10; $t++) {
                $isF   = mt_rand(0, 1) === 1;
                $nom   = $noms[array_rand($noms)];
                $prenom = $isF ? $prenomsF[array_rand($prenomsF)] : $prenomsM[array_rand($prenomsM)];
                $uname = strtolower(Str::ascii(mb_substr($prenom, 0, 1)).'.'.preg_replace('/[^a-z]/', '', strtolower(Str::ascii($nom))));
                $email = $uniqueEmail($uname);
                $pwd   = $rndPwd();
                $mat   = 'ENS-'.$d['prefix'].'-'.(200 + $t);
                while (in_array($mat, $used['mat'], true) || Enseignant::where('matricule', $mat)->exists()) { $mat .= mt_rand(0,9); }
                $used['mat'][] = $mat;
                $u = User::create(['email' => $email, 'password' => $pwd, 'initial_password' => $pwd, 'role' => 'enseignant']);
                $teachers[] = Enseignant::create([
                    'user_id' => $u->id, 'matricule' => $mat, 'nom' => $nom, 'prenom' => $prenom,
                    'grade' => $grades[array_rand($grades)], 'departement' => $deptName, 'statut_compte' => 'actif',
                ]);
            }
            $pickTeacher = fn () => $teachers[array_rand($teachers)];

            foreach ($d['niveaux'] as $niveau) {
                [$semA, $semB] = $semMap[$niveau];
                $titles = $C[$deptName][$niveau] ?? [];
                $semTitles = [$semA => array_slice($titles, 0, 5), $semB => array_slice($titles, 5, 5)];

                // ── Modules : réutiliser ceux qui existent, compléter jusqu'à 5 ──
                $modulesBySem = [];
                foreach ([$semA, $semB] as $si => $sem) {
                    $mods = Module::where('filiere', $deptName)->where('niveau', $niveau)->where('semestre', $sem)->get()->all();
                    $haveTitles = array_map(fn ($m) => $m->intitule, $mods);
                    $ti = count($mods);
                    foreach (($semTitles[$sem] ?? []) as $title) {
                        if (count($mods) >= 5) break;
                        if (in_array($title, $haveTitles, true)) continue;
                        $resp  = $pickTeacher();
                        $hasTp = $ti % 2 === 0;
                        $code  = $d['prefix'].'-'.$niveau.'-'.$sem.'-'.str_pad((string)($ti + 1), 2, '0', STR_PAD_LEFT);
                        while (in_array($code, $used['code'], true) || Module::where('code', $code)->exists()) { $code .= 'x'; }
                        $used['code'][] = $code;
                        $m = Module::create([
                            'code' => $code, 'intitule' => $title, 'credits' => mt_rand(2, 6), 'coefficient' => mt_rand(1, 4),
                            'type_ue' => ['UEF','UEF','UEM','UED','UET'][$ti % 5], 'nature' => 'obligatoire', 'vhs' => $hasTp ? 90 : 67,
                            'has_cours' => true, 'duree_cours' => '1h30', 'has_td' => true, 'duree_td' => '1h30',
                            'has_tp' => $hasTp, 'duree_tp' => '1h30',
                            'pct_examen' => 60, 'pct_td' => $hasTp ? 20 : 40, 'pct_tp' => $hasTp ? 20 : 0,
                            'filiere' => $deptName, 'niveau' => $niveau, 'semestre' => $sem, 'enseignant_id' => $resp->id,
                        ]);
                        $m->enseignants()->syncWithoutDetaching([$resp->id => [
                            'role' => 'cc+tp', 'responsable' => true, 'groupes' => json_encode($allGroups),
                        ]]);
                        $mods[] = $m;
                        $haveTitles[] = $title;
                        $ti++;
                    }
                    $modulesBySem[$sem] = $mods;
                }
                // S'assurer que chaque module a un enseignant responsable
                // (certains modules réutilisés du showcase, ex. Chimie, n'en avaient pas)
                foreach ([$semA, $semB] as $sem) {
                    foreach ($modulesBySem[$sem] as $m) {
                        if (! $m->enseignant_id) {
                            $resp = $pickTeacher();
                            $m->enseignant_id = $resp->id;
                            $m->save();
                            $m->enseignants()->syncWithoutDetaching([$resp->id => [
                                'role' => 'cc+tp', 'responsable' => true, 'groupes' => json_encode($allGroups),
                            ]]);
                        }
                    }
                }

                $activeMods = array_slice($modulesBySem[$semA], 0, 5);

                // ── Emploi du temps (séances) — par section / groupe, distinct ──
                $covered = [];
                foreach (Seance::where('filiere', $deptName)->where('niveau', $niveau)->where('semestre', $semA)->get() as $sc) {
                    foreach (($sc->groupes ?? []) as $g) $covered[$g] = true;
                }
                $slot = 0;
                foreach ($sectionsMap as $section => $grps) {
                    $sectionUncovered = ! ($covered[$grps[0]] ?? false) && ! ($covered[$grps[1]] ?? false);
                    foreach (array_slice($activeMods, 0, 4) as $mi => $m) {
                        // CM partagé par la section
                        if ($sectionUncovered) {
                            [$hd, $hf] = $creneaux[$slot % count($creneaux)];
                            Seance::create([
                                'module_id' => $m->id, 'enseignant_id' => $m->enseignant_id,
                                'salle_id' => $salleList[array_rand($salleList)]->id,
                                'type' => 'CM', 'jour' => $jours[$slot % count($jours)], 'heure_debut' => $hd, 'heure_fin' => $hf,
                                'groupes' => $grps, 'statut' => 'normal',
                                'filiere' => $deptName, 'niveau' => $niveau, 'semestre' => $semA,
                            ]);
                            $slot++;
                        }
                        // TD/TP propre à chaque groupe → emplois du temps différents
                        foreach ($grps as $gi => $g) {
                            if ($covered[$g] ?? false) continue;
                            [$hd, $hf] = $creneaux[($slot + $gi) % count($creneaux)];
                            Seance::create([
                                'module_id' => $m->id, 'enseignant_id' => $pickTeacher()->id,
                                'salle_id' => $salleList[array_rand($salleList)]->id,
                                'type' => $m->has_tp ? 'TP' : 'TD',
                                'jour' => $jours[($slot + $gi + 2) % count($jours)], 'heure_debut' => $hd, 'heure_fin' => $hf,
                                'groupes' => [$g], 'statut' => 'normal',
                                'filiere' => $deptName, 'niveau' => $niveau, 'semestre' => $semA,
                            ]);
                        }
                        $slot++;
                    }
                }

                // ── Étudiants : compléter jusqu'à ~30 ──
                $existingCount = Etudiant::where('filiere', $deptName)->where('niveau', $niveau)->count();
                $toCreate = max(0, 30 - $existingCount);
                $newStudents = [];
                for ($k = 0; $k < $toCreate; $k++) {
                    $isF    = mt_rand(0, 1) === 1;
                    $nom    = $noms[array_rand($noms)];
                    $prenom = $isF ? $prenomsF[array_rand($prenomsF)] : $prenomsM[array_rand($prenomsM)];
                    $group  = $allGroups[$k % 4];
                    $section = $k % 4 < 2 ? 'Section 1' : 'Section 2';
                    $mat = '24'.$d['matDept'].$niveauCode[$niveau].str_pad((string)($k + 1), 4, '0', STR_PAD_LEFT);
                    while (in_array($mat, $used['mat'], true) || Etudiant::where('matricule', $mat)->exists()) { $mat = (string)((int)$mat + 1); }
                    $used['mat'][] = $mat;
                    $pwd   = $rndPwd();
                    $email = $uniqueEmail($mat);
                    $paye  = mt_rand(0, 100) < 80;
                    $u = User::create(['email' => $email, 'password' => $pwd, 'initial_password' => $pwd, 'role' => 'etudiant']);
                    $newStudents[] = Etudiant::create([
                        'user_id' => $u->id, 'matricule' => $mat, 'nom' => $nom, 'prenom' => $prenom,
                        'filiere' => $deptName, 'niveau' => $niveau, 'groupe' => $group, 'section' => $section,
                        'departement' => 'Département de '.$deptName, 'universite' => $this->UNIV,
                        'annee_universitaire' => $this->ANNEE, 'statut_compte' => 'actif',
                        'statut_reinscription' => ['valide','valide','valide','en_attente','incomplet'][$k % 5],
                        'statut_paiement' => $paye ? 'paye' : 'non_paye', 'montant_paye' => $paye ? 2500 : 0,
                        'methode_payment' => $paye ? 'CCP' : null, 'reference_payment' => $paye ? 'REF'.$mat : null,
                        'date_payment' => $paye ? '2025-09-'.str_pad((string)mt_rand(10, 28), 2, '0', STR_PAD_LEFT) : null,
                    ]);
                }

                // ── Notes publiées (semestre actif) pour les nouveaux étudiants ──
                foreach ($newStudents as $stu) {
                    foreach ($activeMods as $m) {
                        $cc   = mt_rand(70, 175) / 10;
                        $exam = mt_rand(60, 180) / 10;
                        $tp   = $m->has_tp ? mt_rand(80, 185) / 10 : null;
                        $moy  = $tp !== null ? round($exam * 0.6 + $cc * 0.2 + $tp * 0.2, 2) : round($exam * 0.6 + $cc * 0.4, 2);
                        $sit  = $moy >= 10 ? 'admis' : ($moy >= 8 ? 'rattrapage' : 'ajourne');
                        Note::create([
                            'etudiant_id' => $stu->id, 'module_id' => $m->id, 'semestre' => $semA,
                            'note_controle' => $cc, 'note_exam' => $exam, 'note_tp' => $tp,
                            'moyenne' => $moy, 'credit_acquis' => $sit === 'admis' ? $m->credits : 0,
                            'situation' => $sit, 'statut' => 'publie',
                        ]);
                    }
                }

                // ── Soumissions de notes (workflow) pour le semestre actif ──
                $subStatuts = ['publie','valide','soumis','en_attente'];
                foreach (array_slice($activeMods, 0, 3) as $mi => $m) {
                    foreach (['Groupe 1','Groupe 3'] as $gi => $g) {
                        if (SoumissionNote::where('module_id', $m->id)->where('niveau', $niveau)->where('groupe', $g)->where('semestre', $semA)->exists()) continue;
                        $st = $subStatuts[($mi + $gi) % count($subStatuts)];
                        SoumissionNote::create([
                            'module_id' => $m->id, 'enseignant_id' => $m->enseignant_id,
                            'filiere' => $deptName, 'niveau' => $niveau, 'groupe' => $g, 'semestre' => $semA,
                            'type' => 'CC+Examen', 'nb_etudiants' => 7 + mt_rand(0, 5),
                            'statut' => $st, 'notes_soumises' => $st !== 'en_attente',
                            'date_depot' => $st !== 'en_attente' ? '2026-01-'.str_pad((string)(2 + $mi), 2, '0', STR_PAD_LEFT) : null,
                            'valide_par' => ($agent && in_array($st, ['valide','publie'], true)) ? $agent->id : null,
                            'valide_le'  => in_array($st, ['valide','publie'], true) ? now() : null,
                        ]);
                    }
                }

                // ── Supports de cours (semestre actif) ──
                foreach (array_slice($activeMods, 0, 3) as $i => $m) {
                    Support::create([
                        'module_id' => $m->id, 'enseignant_id' => $m->enseignant_id,
                        'nom' => 'Cours '.($i + 1).' — '.$m->intitule, 'type' => 'cours', 'format' => 'pdf',
                        'taille' => round(mt_rand(8, 50) / 10, 1).' MB',
                        'date_upload' => '2025-10-'.str_pad((string)(5 + $i), 2, '0', STR_PAD_LEFT),
                    ]);
                }

                // ── Délibération du semestre actif ──
                if ($agent && ! Deliberation::where('filiere', $deptName)->where('niveau', $niveau)->where('semestre', $semA)->exists()) {
                    $notes = Note::whereIn('module_id', array_map(fn ($m) => $m->id, $activeMods))->get();
                    Deliberation::create([
                        'filiere' => $deptName, 'niveau' => $niveau, 'semestre' => $semA,
                        'annee_universitaire' => $this->ANNEE,
                        'statut' => $niveau === 'L3' ? 'terminee' : (in_array($niveau, ['L1','L2'], true) ? 'en_cours' : 'en_preparation'),
                        'date_deliberation' => $niveau === 'L3' ? '2026-01-22' : null,
                        'nb_admis' => $notes->where('situation', 'admis')->count(),
                        'nb_ajourne' => $notes->where('situation', 'ajourne')->count(),
                        'nb_rattrapage' => $notes->where('situation', 'rattrapage')->count(),
                        'agent_id' => $agent->id,
                    ]);
                }

                // ── Réinscriptions (échantillon, 6 étudiants) ──
                foreach (array_slice($newStudents, 0, 6) as $j => $stu) {
                    $st = ['valide','valide','en_attente','incomplet','valide','rejete'][$j % 6];
                    $paye = $st === 'valide';
                    Reinscription::create([
                        'etudiant_id' => $stu->id, 'annee_universitaire' => $this->ANNEE, 'statut' => $st,
                        'statut_paiement' => $paye ? 'paye' : 'non_paye', 'montant' => $paye ? 2500 : 0,
                        'methode_payment' => $paye ? 'CCP' : null, 'reference_payment' => $paye ? 'REF'.$stu->matricule : null,
                        'date_payment' => $paye ? '2025-09-22' : null,
                        'documents' => [
                            ['type' => 'CNI', 'soumis' => true, 'verifie' => $paye],
                            ['type' => 'Bac original', 'soumis' => $st !== 'incomplet', 'verifie' => $paye],
                            ['type' => 'Reçu de paiement', 'soumis' => $paye, 'verifie' => $paye],
                        ],
                        'audit_trail' => [['date' => '2025-09-12 09:30', 'action' => "Dossier soumis par l'étudiant", 'agent' => 'Système']],
                        'traite_par' => $paye && $agent ? $agent->id : null,
                        'traite_le' => $paye ? now()->subMonths(8) : null,
                    ]);
                }
            }

            // ── Annonces propres au département ──
            if ($agent) {
                $deptAnnonces = [
                    ['Réunion pédagogique — Département de '.$deptName, "L'ensemble des enseignants du département est convié à la réunion de coordination pédagogique du semestre.", 'Administratif', '📋', 'bg-slate-50 border-slate-200 text-slate-800'],
                    ['Calendrier des examens — '.$deptName, "Le planning des examens du semestre est désormais disponible. Consultez votre emploi du temps pour les dates et salles.", 'Administratif', '🗓️', 'bg-blue-50 border-blue-200 text-blue-800'],
                ];
                foreach ($deptAnnonces as $ai => $an) {
                    Annonce::create([
                        'titre' => $an[0], 'contenu' => $an[1], 'categorie' => $an[2], 'icon' => $an[3], 'couleur' => $an[4],
                        'audience' => 'all', 'filiere' => $deptName,
                        'date_publication' => '2025-11-'.str_pad((string)(8 + $ai), 2, '0', STR_PAD_LEFT),
                        'auteur_id' => $agent->user->id,
                    ]);
                }
            }
        }
    }
}
