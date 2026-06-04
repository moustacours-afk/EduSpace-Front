# INFOS_SITE.md — EduSpace : état réel du code

> Généré à partir du code source. Les mentions « non implémenté » signifient que la fonctionnalité est absente du code actuellement présent dans ce dépôt.

---

## 1. Stack réel

### Backend (`backend/`)
| Composant | Valeur réelle |
|-----------|--------------|
| Langage | PHP ^8.3 |
| Framework | Laravel 13.8 (`laravel/framework: ^13.8`) |
| Auth API | Laravel Sanctum 4.3 (`laravel/sanctum: ^4.3`) |
| Base de données (dev) | **SQLite** — fichier `backend/database/eduspace.sqlite` |
| Base de données (prod) | MySQL configurable mais **non utilisée actuellement** |
| Hachage mots de passe | bcrypt, 12 rounds (`BCRYPT_ROUNDS=12` dans `.env`) |
| Tests | PHPUnit 12.5 |

### Frontend (`artifacts/eduspace/`)
| Composant | Valeur réelle |
|-----------|--------------|
| Langage | TypeScript 5.x (`@types/react: ^19.2.0`) |
| Framework UI | **React 19.1.0** (exact, fixé dans le catalog pnpm) |
| Bundler | Vite 7.3.2 |
| CSS | **Tailwind CSS 4.1.14** — pas de Bootstrap |
| Composants UI | Radix UI (shadcn/ui) — accordéon, dialog, select, toast, etc. |
| Routeur | **wouter 3.3.5** — pas de React Router |
| Requêtes HTTP | `fetch` natif, encapsulé dans `src/lib/api.ts` |
| Graphiques | Recharts 2.15.2 |
| Formulaires | react-hook-form 7.55 + zod 3.25 |
| Animations | framer-motion 12.23 |
| Icônes | lucide-react 0.545 + react-icons 5.4 |

**Confirmation / correction des hypothèses :**
- Bootstrap 5 → **absent**, remplacé par Tailwind CSS 4
- jQuery → **absent**
- Vanilla JS → **absent**, tout est TypeScript/React

---

## 2. Base de données

Connexion réelle : `DB_CONNECTION=sqlite`, `DB_DATABASE=database/eduspace.sqlite` (`.env` ligne 23-24).  
Toutes les tables sont définies dans `backend/database/migrations/`.

### Tables réelles

| Table | Colonnes principales | Clés étrangères |
|-------|---------------------|----------------|
| `users` | `id`, `email` (unique), `password` (bcrypt), `role` (enum: etudiant/enseignant/agent/super_agent), `initial_password`, `remember_token` | — |
| `filieres` | `id`, `nom` (unique), `departement` | — |
| `etudiants` | `id`, `user_id`, `matricule` (unique), `nom`, `prenom`, `filiere`, `niveau` (L1/L2/L3), `groupe`, `section`, `departement`, `universite`, `annee_universitaire`, `date_naissance`, `wilaya`, `statut_compte`, `statut_reinscription`, `statut_paiement`, `montant_paye`, `methode_payment`, `reference_payment`, `date_payment` | `user_id → users` (CASCADE) |
| `enseignants` | `id`, `user_id`, `matricule` (unique), `nom`, `prenom`, `grade`, `departement`, `statut_compte` | `user_id → users` (CASCADE) |
| `agents` | `id`, `user_id`, `nom`, `prenom`, `role`, `departement`, `statut`, `universite` | `user_id → users` (CASCADE) |
| `super_agents` | `id`, `user_id`, `nom`, `prenom`, `role`, `departement`, `universite` | `user_id → users` (CASCADE) |
| `modules` | `id`, `code` (unique), `intitule`, `credits`, `filiere`, `niveau`, `semestre`, `enseignant_id` | `enseignant_id → enseignants` (SET NULL) |
| `enseignant_module` | `id`, `enseignant_id`, `module_id`, `role` (cc/tp/cc+tp), `responsable`, `groupes` (JSON) | `enseignant_id → enseignants`, `module_id → modules` (CASCADE) — UNIQUE(enseignant_id, module_id) |
| `notes` | `id`, `etudiant_id`, `module_id`, `semestre`, `note_exam`, `note_controle`, `note_tp`, `moyenne`, `credit_acquis`, `situation` (admis/ajourne/rattrapage), `absent`, `statut` (en_attente/soumis/valide/publie) | `etudiant_id → etudiants`, `module_id → modules` (CASCADE) — UNIQUE(etudiant_id, module_id, semestre) |
| `recours` | `id`, `etudiant_id`, `module_id`, `semestre`, `note_type`, `note_actuelle`, `motif`, `statut`, `note_proposee`, `commentaire_enseignant`, `enseignant_id`, `agent_id`, `notifie_etudiant`, `traite_le`, `valide_le` | `etudiant_id → etudiants`, `module_id → modules`, `enseignant_id → enseignants`, `agent_id → agents` |
| `salles` | `id`, `nom` (unique), `capacite`, `type`, `disponible` | — |
| `seances` | `id`, `module_id`, `enseignant_id`, `salle_id`, `type` (CM/TD/TP), `jour`, `heure_debut`, `heure_fin`, `groupes` (JSON), `statut` (normal/annule/reporte), `filiere`, `niveau`, `semestre` | `module_id → modules`, `enseignant_id → enseignants`, `salle_id → salles` |
| `annonces` | `id`, `titre`, `contenu`, `categorie`, `couleur`, `icon`, `audience` (all/etudiant/enseignant/agent), `filiere`, `niveau`, `auteur_id`, `date_publication` | `auteur_id → users` (SET NULL) |
| `supports` | `id`, `module_id`, `enseignant_id`, `nom`, `type` (cours/td/tp/corriges/autre), `format` (pdf/ppt/doc/zip/autre), `taille`, `chemin_fichier`, `date_upload` | `module_id → modules`, `enseignant_id → enseignants` (SET NULL) |
| `notifications` | `id`, `user_id`, `message`, `type` (annulation/horaire/note/recours/general), `lu` | `user_id → users` (CASCADE) |
| `soumissions_notes` | `id`, `module_id`, `enseignant_id`, `filiere`, `niveau`, `groupe`, `semestre`, `type`, `nb_etudiants`, `statut`, `notes_soumises`, `rejection_reason`, `date_depot`, `valide_par`, `valide_le` | `module_id → modules`, `enseignant_id → enseignants`, `valide_par → agents` |
| `evenements` | `id`, `date`, `titre`, `description`, `type` (green/red/blue/amber) | — |
| `deliberations` | `id`, `filiere`, `niveau`, `semestre`, `annee_universitaire`, `statut`, `date_deliberation`, `nb_admis`, `nb_ajourne`, `nb_rattrapage`, `agent_id` | `agent_id → agents` (SET NULL) |
| `reinscriptions` | `id`, `etudiant_id`, `annee_universitaire`, `statut`, `statut_paiement`, `montant`, `methode_payment`, `reference_payment`, `date_payment`, `documents` (JSON), `audit_trail` (JSON), `traite_par`, `traite_le` | `etudiant_id → etudiants`, `traite_par → agents` (SET NULL) |
| `personal_access_tokens` | `id`, `tokenable_type`, `tokenable_id`, `name`, `token` (unique), `abilities`, `last_used_at`, `expires_at` | Table Sanctum (polymorphique) |

**Tables Laravel internes :** `cache`, `jobs`, `password_reset_tokens`, `migrations`.

### Comparaison avec les tables attendues
| Table attendue | État |
|---------------|------|
| `etudiant` | ✅ Existe (`etudiants`) |
| `enseignant` | ✅ Existe (`enseignants`) |
| `agent_pedago` | ✅ Existe sous le nom `agents` |
| `module` | ✅ Existe (`modules`) |
| `note` | ✅ Existe (`notes`) |
| `emploi_temps` | ✅ Existe sous le nom `seances` |
| `support_cours` | ✅ Existe sous le nom `supports` |
| `notification` | ✅ Existe (`notifications`) |

---

## 3. Pages / écrans réels

Routeur : `wouter` dans `artifacts/eduspace/src/App.tsx`.

### Pages publiques
| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | Landing | Page d'accueil |
| `/login/etudiant` | LoginEtudiant | Connexion étudiant (matricule + mot de passe) |
| `/login/enseignant` | LoginEnseignant | Connexion enseignant (matricule + mot de passe) |
| `/login/agent` | LoginAgent | Connexion agent pédagogique (email + mot de passe) |
| `/login/super-agent` | LoginSuperAgent | Connexion super agent |
| `/admin/create-super-agent` | CreateSuperAgent | Création du compte super agent (page de setup) |

### Pages Étudiant
| Route | Composant | Description |
|-------|-----------|-------------|
| `/etudiant/dashboard` | EtudiantDashboard | Tableau de bord, stats générales |
| `/etudiant/notes/controles` | EtudiantControles | Notes de contrôles |
| `/etudiant/notes/examens` | EtudiantExamens | Notes d'examens |
| `/etudiant/notes/general` | EtudiantGeneral | Moyenne générale |
| `/etudiant/notes/dettes` | EtudiantDettes | Modules non validés |
| `/etudiant/emploi-du-temps` | EtudiantEmploiDuTemps | Emploi du temps filtré par filière/niveau/groupe |
| `/etudiant/supports` | EtudiantSupports | Supports de cours |
| `/etudiant/profil` | EtudiantProfil | Profil étudiant |

### Pages Enseignant
| Route | Composant | Description |
|-------|-----------|-------------|
| `/enseignant/dashboard` | EnseignantDashboard | Tableau de bord |
| `/enseignant/supports` | EnseignantSupports | Upload et gestion des supports |
| `/enseignant/notes` | EnseignantNotes | Saisie et soumission des notes |
| `/enseignant/emploi-du-temps` | EnseignantEmploiDuTemps | Emploi du temps |
| `/enseignant/annonces` | EnseignantAnnonces | Création d'annonces |

### Pages Agent Pédagogique
| Route | Composant | Description |
|-------|-----------|-------------|
| `/agent/dashboard` | AgentDashboard | KPIs (nb étudiants, enseignants, modules, etc.) |
| `/agent/comptes/etudiants` | AgentComptes | CRUD comptes étudiants |
| `/agent/comptes/enseignants` | AgentComptes | CRUD comptes enseignants |
| `/agent/emploi-du-temps` | AgentEmploiDuTemps | Gestion des séances |
| `/agent/notes` | AgentValidationNotes | Validation et publication des notes |
| `/agent/deliberations` | AgentDeliberations | Délibérations académiques |
| `/agent/calendrier` | AgentCalendrier | Calendrier académique (événements) |
| `/agent/notifications` | AgentNotifications | Annonces et notifications |
| `/agent/organisation-etudiants` | AgentOrganisationEtudiants | Organisation des étudiants |
| `/agent/feuilles` | AgentFeuilles | Feuilles / exports |

### Pages Super Agent
| Route | Composant | Description |
|-------|-----------|-------------|
| `/super-agent/dashboard` | SuperAgentDashboard | Tableau de bord super agent |
| `/super-agent/comptes` | SuperAgentComptes | Gestion des agents pédagogiques |
| `/super-agent/modules` | SuperAgentModules | Gestion des modules |

---

## 4. Fonctionnalités par rôle

### Authentification
- **Méthode réelle :** Laravel Sanctum — tokens Bearer stockés dans `localStorage` (`eduspace_token`)
- **Hachage :** `Hash::check()` / `Hash::make()` bcrypt (BCRYPT_ROUNDS=12)
- **Pas de sessions PHP** — API stateless
- Login par matricule (étudiants et enseignants) ou par email (agents, super agents)

Comptes de démo (mot de passe : `password`) :
| Rôle | Email | Matricule |
|------|-------|-----------|
| Étudiant | k.bensalem@univ-alger.dz | 20221234 |
| Enseignant | m.hadj@univ-alger.dz | ENS001 |
| Agent | n.ferhat@univ-alger.dz | — |
| Super Agent | superagent@univ-alger.dz | — |

### Étudiant
| Fonctionnalité | État |
|---------------|------|
| Voir ses notes (exam, contrôle, TP, moyenne) | ✅ Implémenté (`GET /api/etudiant/notes`) |
| Voir son emploi du temps | ✅ Implémenté (filtrage par filière/niveau/groupe) |
| Télécharger des supports de cours | ✅ Implémenté (liste via API) |
| Soumettre un recours (appel de note) | ✅ Implémenté (`POST /api/etudiant/recours`) |
| Voir les annonces | ✅ Implémenté |
| Voir les notifications | ✅ Implémenté (avec marquer comme lu) |
| Réinscription en ligne | ✅ Table `reinscriptions` + endpoint agent ; interface étudiant non implémentée |
| Changement de mot de passe | non implémenté |
| Messagerie directe | non implémenté |

### Enseignant
| Fonctionnalité | État |
|---------------|------|
| Saisie et soumission des notes | ✅ Implémenté (`POST /api/enseignant/soumissions/{id}/submit`) |
| Upload de supports de cours (fichier) | ✅ Implémenté (`POST /api/enseignant/supports`, multipart/form-data) |
| Voir et répondre aux recours | ✅ Implémenté (`POST /api/enseignant/recours/{id}/decision`) |
| Créer des annonces | ✅ Implémenté |
| Voir son emploi du temps | ✅ Implémenté |
| Voir son profil | ✅ Implémenté |
| Changement de mot de passe | non implémenté |

### Agent Pédagogique
| Fonctionnalité | État |
|---------------|------|
| Créer / modifier / suspendre comptes étudiants | ✅ Implémenté |
| Créer / modifier comptes enseignants | ✅ Implémenté |
| Valider et publier les notes soumises | ✅ Implémenté |
| Rejeter une soumission de notes | ✅ Implémenté (avec motif de rejet) |
| Valider les recours après décision enseignant | ✅ Implémenté |
| Gérer l'emploi du temps (créer/modifier séances) | ✅ Implémenté |
| Gérer le calendrier académique (événements) | ✅ Implémenté |
| Lancer une délibération | ✅ Implémenté (table + endpoint) |
| Gérer les réinscriptions | ✅ Implémenté (validation paiement + documents) |
| Gérer les salles | ✅ Implémenté (CRUD) |
| Publier des annonces | ✅ Implémenté |
| Suspension d'un agent (super agent seulement) | ✅ Implémenté |

### Super Agent
| Fonctionnalité | État |
|---------------|------|
| Gérer les agents pédagogiques (CRUD + suspend) | ✅ Implémenté |
| Gérer les modules | ✅ Implémenté |
| Tableau de bord avec statistiques | ✅ Implémenté |

---

## 5. Extraits de code réels

### Authentification — `backend/app/Http/Controllers/AuthController.php`
```php
public function login(Request $request)
{
    if ($request->has('matricule')) {
        $identifier = $request->matricule;
        $password   = $request->password ?? '';
        $user       = null;

        // Matricule → cherche enseignant, puis étudiant
        $user = User::where('email', $identifier . '@eduspace.local')->first();
        if (! $user) {
            $ens = \App\Models\Enseignant::where('matricule', $identifier)->first();
            if ($ens) $user = $ens->user;
        }
        if (! $user) {
            $etu = \App\Models\Etudiant::where('matricule', $identifier)->first();
            if ($etu) $user = $etu->user;
        }

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }
    } else {
        // Login email pour agent / super_agent
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }
    }

    $token = $user->createToken('api-token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => [...]);
}
```

### Récupération des notes — `backend/app/Http/Controllers/EtudiantController.php`
```php
public function notes(Request $request)
{
    $etudiant = $request->user()->etudiant;
    $notes = $etudiant->notes()->with('module')->get()->map(function ($n) {
        return [
            'id'           => $n->id,
            'moduleId'     => $n->module_id,
            'module'       => $n->module->intitule,
            'semestre'     => $n->semestre,
            'exam'         => $n->note_exam,
            'controle'     => $n->note_controle,
            'tp'           => $n->note_tp,
            'moyenne'      => $n->moyenne,
            'creditAcquis' => $n->credit_acquis,
            'situation'    => $n->situation,
            'statut'       => $n->statut,
        ];
    });
    return response()->json($notes);
}
```

### Upload de fichier (support de cours) — `backend/app/Http/Controllers/EnseignantController.php`
```php
// Validation + upload
$request->validate([
    'module_id' => 'required|exists:modules,id',
    'nom'       => 'required|string',
    'type'      => 'required|in:cours,td,tp,corriges,autre',
    'format'    => 'required|in:pdf,ppt,doc,zip,autre',
    'fichier'   => 'nullable|file|max:51200',   // max 50 Mo
]);

$path = null;
if ($request->hasFile('fichier')) {
    $path = $request->file('fichier')->store('supports', 'public');
}

$support = Support::create([
    'module_id'      => $request->module_id,
    'enseignant_id'  => $e->id,
    'nom'            => $request->nom,
    'type'           => $request->type,
    'format'         => $request->format,
    'taille'         => $request->hasFile('fichier')
                          ? round($request->file('fichier')->getSize() / 1024, 1) . ' KB'
                          : null,
    'chemin_fichier' => $path,
    'date_upload'    => now()->toDateString(),
]);
return response()->json($support, 201);
```

---

## 6. Déploiement réel

| Aspect | Valeur |
|--------|--------|
| Frontend | **GitHub Pages** — `https://moustacours-afk.github.io/EduSpace-Front/` |
| CI/CD | GitHub Actions — `.github/workflows/deploy.yml`, déclenché sur push `main` |
| Build frontend | `pnpm --filter @workspace/eduspace run build` (Vite, base path `/EduSpace-Front/`) |
| Backend | **Local uniquement** — non déployé, tourne sur `http://localhost:8000` |
| DB backend déployée | non implémenté (SQLite local uniquement) |
| URL API frontend | Codée en dur dans `src/lib/api.ts` ligne 1 : `const BASE = "http://localhost:8000/api"` |
| Environnement DB | SQLite, fichier `backend/database/eduspace.sqlite` |
| Connexion MySQL | Configurable dans `.env` mais non utilisée |

**Conséquence :** le frontend déployé sur GitHub Pages ne peut pas appeler le backend (qui n'est pas hébergé). L'application est fonctionnelle uniquement en développement local.

---

## 7. Outils réellement utilisés

| Outil | Usage |
|-------|-------|
| Git | Contrôle de version |
| GitHub | Dépôt : `https://github.com/moustacours-afk/EduSpace-Front` |
| GitHub Actions | CI/CD, déploiement GitHub Pages automatique |
| pnpm 11 | Gestionnaire de paquets Node.js (workspace monorepo) |
| Composer | Gestionnaire de dépendances PHP |
| PHP 8.3 | Serveur de développement via `php artisan serve` |
| SQLite | Base de données de développement (fichier `.sqlite`) |
| Vite 7 | Bundler et serveur de dev frontend |
| TypeScript | Typage statique sur tout le frontend |

---

*Dernière mise à jour : 2026-06-02*
