<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Annonce;
use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\Evenement;
use App\Models\Module;
use App\Models\Note;
use App\Models\Notification;
use App\Models\Salle;
use App\Models\Seance;
use App\Models\SoumissionNote;
use App\Models\SuperAgent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EduSpaceSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Users & profiles ───────────────────────────────────────────────

        // Super agent
        $saUser = User::create(['email' => 'superagent@univ-alger.dz', 'password' => Hash::make('password'), 'role' => 'super_agent']);
        SuperAgent::create(['user_id' => $saUser->id, 'nom' => 'Benali', 'prenom' => 'Kamel', 'role' => 'Super Agent', 'departement' => 'Direction Pédagogique']);

        // Agent
        $agentUser = User::create(['email' => 'n.ferhat@univ-alger.dz', 'password' => Hash::make('password'), 'role' => 'agent']);
        $agent = Agent::create(['user_id' => $agentUser->id, 'nom' => 'Ferhat', 'prenom' => 'Nadia', 'role' => 'Agent Pédagogique', 'departement' => 'Scolarité - Informatique']);

        // Teachers
        $teacherData = [
            ['m.hadj@univ-alger.dz',    'ENS001', 'Hadj',       'Mohamed', 'MCB',       'Informatique'],
            ['a.ziani@univ-alger.dz',   'ENS002', 'Ziani',      'Amira',   'MAA',       'Informatique'],
            ['y.bouzid@univ-alger.dz',  'ENS003', 'Bouzid',     'Yacine',  'Professeur','Réseaux'],
            ['s.khelif@univ-alger.dz',  'ENS004', 'Khelif',     'Samia',   'MCA',       'Systèmes'],
            ['r.amrani@univ-alger.dz',  'ENS005', 'Amrani',     'Rachid',  'MCB',       'Mathématiques'],
            ['k.benmabrouk@univ-alger.dz','ENS006','Benmabrouk', 'Karim',  'MAB',       'Informatique'],
            ['f.lahmar@univ-alger.dz',  'ENS007', 'Lahmar',     'Fatima',  'MCA',       'Informatique'],
        ];
        $enseignants = [];
        foreach ($teacherData as $td) {
            $u = User::create(['email' => $td[0], 'password' => Hash::make('password'), 'role' => 'enseignant']);
            $enseignants[$td[2]] = Enseignant::create([
                'user_id' => $u->id, 'matricule' => $td[1], 'nom' => $td[2],
                'prenom' => $td[3], 'grade' => $td[4], 'departement' => $td[5],
            ]);
        }

        // Modules L3-S5
        $moduleData = [
            ['INF301', 'Algorithmique',          6, 'Informatique', 'L3', 'S5', 'Hadj'],
            ['INF302', 'Structures de Données',  6, 'Informatique', 'L3', 'S5', 'Ziani'],
            ['INF303', 'Base de Données',        4, 'Informatique', 'L3', 'S5', 'Hadj'],
            ['INF304', 'Réseaux Informatiques',  4, 'Informatique', 'L3', 'S5', 'Bouzid'],
            ['INF305', "Systèmes d'Exploitation",4, 'Informatique', 'L3', 'S5', 'Khelif'],
            ['MAT301', 'Analyse Mathématique',   4, 'Informatique', 'L3', 'S5', 'Amrani'],
            ['INF401', 'Compilation',            6, 'Informatique', 'L3', 'S6', 'Hadj'],
            ['INF402', 'Intelligence Artificielle',6,'Informatique','L3', 'S6', 'Benmabrouk'],
            ['INF403', 'Sécurité Informatique',  4, 'Informatique', 'L3', 'S6', 'Bouzid'],
            ['INF404', 'Génie Logiciel',         4, 'Informatique', 'L3', 'S6', 'Lahmar'],
        ];
        $modules = [];
        foreach ($moduleData as $md) {
            $ens = $enseignants[$md[6]] ?? null;
            $modules[$md[1]] = Module::create([
                'code' => $md[0], 'intitule' => $md[1], 'credits' => $md[2],
                'filiere' => $md[3], 'niveau' => $md[4], 'semestre' => $md[5],
                'enseignant_id' => $ens?->id,
            ]);
            if ($ens) {
                $modules[$md[1]]->enseignants()->attach($ens->id, [
                    'role' => 'cc+tp', 'responsable' => true,
                    'groupes' => json_encode(['Groupe 1', 'Groupe 2']),
                ]);
            }
        }

        // Main student
        $stuUser = User::create(['email' => 'k.bensalem@univ-alger.dz', 'password' => Hash::make('password'), 'role' => 'etudiant']);
        $etudiant = Etudiant::create([
            'user_id' => $stuUser->id,
            'matricule' => '20221234',
            'nom' => 'Bensalem',
            'prenom' => 'Karim',
            'filiere' => 'Informatique',
            'niveau' => 'L3',
            'groupe' => 'Groupe 2',
            'section' => 'Section A',
            'departement' => 'Département Informatique',
            'universite' => 'Université des Sciences et de la Technologie Houari Boumediene',
            'annee_universitaire' => '2024-2025',
            'statut_compte' => 'actif',
            'statut_reinscription' => 'valide',
            'statut_paiement' => 'paye',
            'montant_paye' => 2500,
        ]);

        // Notes for main student
        $notesData = [
            ['Algorithmique',         'S5', 14.5, 12.0, 15.0, 13.8, 6, 'admis'],
            ['Structures de Données', 'S5', 11.0, 13.0, 14.0, 12.3, 6, 'rattrapage'],
            ['Base de Données',       'S5', 16.0, 15.0, 17.0, 16.0, 4, 'admis'],
            ['Réseaux Informatiques', 'S5',  8.5,  9.0, 11.0,  9.2, 0, 'ajourne'],
            ["Systèmes d'Exploitation",'S5',13.0, 14.0, 15.0, 13.8, 4, 'admis'],
            ['Analyse Mathématique',  'S5', 12.0, 11.0, null, 11.5, 4, 'admis'],
            ['Compilation',           'S6', 15.0, 13.0, 16.0, 14.7, 6, 'admis'],
            ['Intelligence Artificielle','S6',12.0,11.0,13.0, 12.0, 6, 'admis'],
            ['Sécurité Informatique', 'S6',  9.0, 10.0, 11.0,  9.8, 0, 'ajourne'],
            ['Génie Logiciel',        'S6', 14.0, 15.0, 14.0, 14.3, 4, 'admis'],
        ];
        foreach ($notesData as $nd) {
            if (! isset($modules[$nd[0]])) continue;
            Note::create([
                'etudiant_id' => $etudiant->id,
                'module_id' => $modules[$nd[0]]->id,
                'semestre' => $nd[1],
                'note_exam' => $nd[2],
                'note_controle' => $nd[3],
                'note_tp' => $nd[4],
                'moyenne' => $nd[5],
                'credit_acquis' => $nd[6],
                'situation' => $nd[7],
                'statut' => 'publie',
            ]);
        }

        // More students (for teacher view)
        $extraStudents = [
            ['20221235', 'Ouali',     'Amina',   'Groupe 2'],
            ['20221236', 'Mekkaoui', 'Youssef', 'Groupe 2'],
            ['20221237', 'Brahimi',  'Sara',    'Groupe 2'],
            ['20221238', 'Cherif',   'Amine',   'Groupe 2'],
            ['20221239', 'Hamidi',   'Lina',    'Groupe 2'],
        ];
        foreach ($extraStudents as $i => $es) {
            $u = User::create(['email' => strtolower($es[2][0]) . '.' . strtolower($es[1]) . "@univ-alger.dz", 'password' => Hash::make('password'), 'role' => 'etudiant']);
            Etudiant::create([
                'user_id' => $u->id, 'matricule' => $es[0],
                'nom' => $es[1], 'prenom' => $es[2],
                'filiere' => 'Informatique', 'niveau' => 'L3', 'groupe' => $es[3],
                'annee_universitaire' => '2024-2025', 'statut_compte' => 'actif',
            ]);
        }

        // ── 2. Salles ─────────────────────────────────────────────────────────
        $sallesData = [
            ['Amphi A',    200, 'Amphithéâtre', true],
            ['Amphi B',    180, 'Amphithéâtre', true],
            ['Salle 201',  40,  'Salle TD',     true],
            ['Salle 204',  40,  'Salle TD',     false],
            ['Salle 205',  40,  'Salle TD',     true],
            ['Labo Info 1',30,  'Laboratoire',  true],
            ['Labo Info 2',30,  'Laboratoire',  true],
            ['Labo Unix',  25,  'Laboratoire',  false],
        ];
        $salles = [];
        foreach ($sallesData as $sd) {
            $salles[$sd[0]] = Salle::create(['nom' => $sd[0], 'capacite' => $sd[1], 'type' => $sd[2], 'disponible' => $sd[3]]);
        }

        // ── 3. Séances ────────────────────────────────────────────────────────
        $seancesData = [
            ['Algorithmique',         'CM', 'Dimanche', '08:00', '10:00', 'Amphi A',    ['Groupe 1','Groupe 2'], 'normal',  'Hadj'],
            ['Structures de Données', 'TD', 'Dimanche', '10:00', '12:00', 'Salle 204',  ['Groupe 2'],            'normal',  'Ziani'],
            ['Base de Données',       'TP', 'Lundi',    '08:00', '10:00', 'Labo Info 1',['Groupe 2'],            'normal',  'Hadj'],
            ['Réseaux Informatiques', 'CM', 'Lundi',    '10:00', '12:00', 'Amphi B',    ['Groupe 1','Groupe 2'], 'annule',  'Bouzid'],
            ["Systèmes d'Exploitation",'CM','Mardi',    '08:00', '10:00', 'Amphi A',    ['Groupe 1','Groupe 2'], 'normal',  'Khelif'],
            ['Analyse Mathématique',  'TD', 'Mardi',    '14:00', '16:00', 'Salle 205',  ['Groupe 2'],            'normal',  'Amrani'],
            ['Algorithmique',         'TP', 'Mercredi', '10:00', '12:00', 'Labo Info 2',['Groupe 2'],            'normal',  'Hadj'],
            ['Base de Données',       'TD', 'Jeudi',    '08:00', '10:00', 'Salle 205',  ['Groupe 2'],            'normal',  'Hadj'],
            ["Systèmes d'Exploitation",'TP','Jeudi',    '14:00', '16:00', 'Labo Unix',  ['Groupe 2'],            'reporte', 'Khelif'],
            ['Structures de Données', 'TP', 'Samedi',   '08:00', '10:00', 'Labo Info 1',['Groupe 2'],            'normal',  'Ziani'],
        ];
        foreach ($seancesData as $sd) {
            if (! isset($modules[$sd[0]])) continue;
            Seance::create([
                'module_id' => $modules[$sd[0]]->id,
                'enseignant_id' => $enseignants[$sd[8]]?->id,
                'salle_id' => $salles[$sd[5]]?->id,
                'type' => $sd[1], 'jour' => $sd[2], 'heure_debut' => $sd[3], 'heure_fin' => $sd[4],
                'groupes' => $sd[6], 'statut' => $sd[7],
                'filiere' => 'Informatique', 'niveau' => 'L3', 'semestre' => 'S5',
            ]);
        }

        // ── 4. Grade submissions ───────────────────────────────────────────────
        $gsData = [
            ['Algorithmique',         'L3', 'Groupe 1', 'S5', 'Hadj',  'soumis',    28, true,  '2025-05-10'],
            ['Algorithmique',         'L3', 'Groupe 2', 'S5', 'Hadj',  'valide',    25, true,  '2025-05-10'],
            ['Base de Données',       'L3', 'Groupe 2', 'S5', 'Hadj',  'publie',    25, true,  '2025-05-08'],
            ['Structures de Données', 'L3', 'Groupe 1', 'S5', 'Ziani', 'soumis',    28, true,  '2025-05-09'],
            ['Structures de Données', 'L3', 'Groupe 2', 'S5', 'Ziani', 'en_attente',25, false, null],
            ['Réseaux Informatiques', 'L3', 'Groupe 1', 'S5', 'Bouzid','publie',    28, true,  '2025-05-06'],
            ["Systèmes d'Exploitation",'L3','Groupe 1', 'S5', 'Khelif','soumis',    28, true,  '2025-05-11'],
            ['Analyse Mathématique',  'L3', 'Groupe 2', 'S5', 'Amrani','valide',    25, true,  '2025-05-07'],
            ['Intelligence Artificielle','L3','Groupe 1','S6','Benmabrouk','en_attente',28,false,null],
            ['Compilation',           'L3', 'Groupe 2', 'S6', 'Hadj',  'soumis',    25, true,  '2025-05-12'],
            ['Génie Logiciel',        'L3', 'Groupe 1', 'S6', 'Lahmar','publie',    28, true,  '2025-05-05'],
            ['Sécurité Informatique', 'L3', 'Groupe 2', 'S6', 'Bouzid','valide',    25, true,  '2025-05-08'],
        ];
        foreach ($gsData as $gs) {
            if (! isset($modules[$gs[0]]) || ! isset($enseignants[$gs[4]])) continue;
            SoumissionNote::create([
                'module_id' => $modules[$gs[0]]->id,
                'enseignant_id' => $enseignants[$gs[4]]->id,
                'filiere' => 'Informatique',
                'niveau' => $gs[1],
                'groupe' => $gs[2],
                'semestre' => $gs[3],
                'type' => 'CC+Examen',
                'nb_etudiants' => $gs[6],
                'statut' => $gs[5],
                'notes_soumises' => $gs[7],
                'date_depot' => $gs[8],
                'valide_par' => in_array($gs[5], ['valide', 'publie']) ? $agent->id : null,
                'valide_le' => in_array($gs[5], ['valide', 'publie']) ? now() : null,
            ]);
        }

        // ── 5. Annonces ───────────────────────────────────────────────────────
        $annoncesData = [
            ['Forum des clubs étudiants 2025', "La Journée des Clubs se tiendra le 25 mai à la salle omnisports. Plus de 20 clubs présents.", 'Club', '2025-05-14'],
            ['Conférence — Intelligence Artificielle et Avenir', "Pr. Hassan Benali donnera une conférence ouverte le 20 mai à 10h en Amphi Central.", 'Conférence', '2025-05-12'],
            ['Formation — Git & GitHub pour étudiants', "Formation pratique gratuite de 2 jours sur Git et GitHub. Du 22 au 23 mai, Labo Info 5.", 'Formation', '2025-05-10'],
            ['Compétition nationale de programmation', "Représentez votre université à la compétition nationale ICPC.", 'Compétition', '2025-05-08'],
        ];
        foreach ($annoncesData as $ad) {
            Annonce::create([
                'titre' => $ad[0], 'contenu' => $ad[1], 'categorie' => $ad[2],
                'audience' => 'all', 'date_publication' => $ad[3],
                'auteur_id' => $agentUser->id,
            ]);
        }

        // ── 6. Notifications ──────────────────────────────────────────────────
        $notifsData = [
            ["Le cours de Réseaux Informatiques du Lundi 10h est annulé.", 'annulation'],
            ["Le TP Systèmes d'Exploitation est reporté au Jeudi 16h en Labo Unix 2.", 'horaire'],
            ["Les notes de Base de Données ont été publiées.", 'note'],
            ["Nouveau corrigé TD 1 disponible pour Algorithmique.", 'note'],
        ];
        foreach ($notifsData as $i => $nd) {
            Notification::create([
                'user_id' => $stuUser->id,
                'message' => $nd[0],
                'type' => $nd[1],
                'lu' => $i >= 2,
            ]);
        }

        // ── 7. Calendar events ────────────────────────────────────────────────
        $eventsData = [
            ['2025-09-01', 'Rentrée universitaire 2025-2026', 'Début de l\'année académique', 'green'],
            ['2025-09-01', 'Ouverture des réinscriptions', 'Début de la période de réinscription pédagogique', 'green'],
            ['2025-09-30', 'Date limite réinscriptions', 'Clôture des dossiers de réinscription', 'red'],
            ['2025-10-01', 'Début paiement en ligne', 'Ouverture du paiement des frais de scolarité', 'green'],
            ['2025-11-15', 'Contrôles S1 — Semaine 1', 'Première série de contrôles continus', 'blue'],
            ['2026-01-10', 'Date limite soumission notes S1', 'Les enseignants doivent soumettre les notes', 'red'],
            ['2026-01-20', 'Délibérations S1', 'Commission de délibération semestre 1', 'blue'],
            ['2026-01-25', 'Publication résultats S1', 'Mise en ligne officielle des résultats', 'red'],
            ['2026-02-01', 'Début S2', 'Reprise des cours semestre 2', 'green'],
            ['2026-06-15', 'Examens finaux S2', "Session d'examens de fin de semestre", 'blue'],
            ['2026-07-01', 'Date limite soumission notes S2', 'Clôture saisie des notes enseignants', 'red'],
            ['2026-07-15', 'Délibérations finales', 'Commission de délibération annuelle', 'blue'],
        ];
        foreach ($eventsData as $ed) {
            Evenement::create(['date' => $ed[0], 'titre' => $ed[1], 'description' => $ed[2], 'type' => $ed[3]]);
        }

        $this->command->info('EduSpace demo data seeded successfully!');
        $this->command->info('');
        $this->command->info('Demo accounts:');
        $this->command->info('  Étudiant    : k.bensalem@univ-alger.dz / password');
        $this->command->info('  Enseignant  : m.hadj@univ-alger.dz / password');
        $this->command->info('  Agent       : n.ferhat@univ-alger.dz / password');
        $this->command->info('  Super Agent : superagent@univ-alger.dz / password');
    }
}
