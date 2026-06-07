# EduSpace — Guide de démonstration (Jury / Examinateurs)

**Établissement simulé :** Université Oran 1 Ahmed Ben Bella
**Faculté :** Faculté des Sciences Exactes et Appliquées
**Départements peuplés :** **Informatique · Mathématiques · Physique · Chimie**
**Année universitaire :** 2025-2026 · Programme **LMD** (Licence + Master) + cycle **Ingéniorat** (Informatique)

> 🏛️ La base est désormais **peuplée comme une vraie université** : ~30 étudiants par niveau, chaque niveau réparti en **2 sections (Section 1 / Section 2) × 2 groupes**, **chaque groupe ayant son propre emploi du temps**. Tous les comptes (étudiants **et** enseignants) ont un **mot de passe persistant** stocké en base, récupérable dans l'interface Agent.

---

## 1. Démarrage

Deux services doivent tourner (déjà lancés pendant le développement) :

| Service | Commande | URL |
|---|---|---|
| Backend (Laravel) | `cd backend && php artisan serve` | http://localhost:8000 |
| Frontend (Vite) | `cd artifacts/eduspace && npm run dev` | http://localhost:5173 |

> ⚠️ Le **backend doit tourner** : c'est lui qui gère les connexions et sert toutes les données.

Pour (ré)injecter les données de démonstration à tout moment :
```bash
cd backend
php artisan migrate:fresh --seed
```

---

## 2. Comptes de démonstration — mot de passe : `password`

### 🟣 Super-Agent — page `/login/super-agent`
Deux types de compte sur la même interface, distingués automatiquement par le compte connecté :
| Identifiant | Rôle |
|---|---|
| `directeur@univ-oran1.dz` | **Directeur (niveau université)** — crée les doyens, voit tous les agents, statistiques étudiants |
| `doyen.sea@univ-oran1.dz` | **Doyen (Faculté des Sciences Exactes)** — crée les agents de sa faculté, modules (faculté fixée) |

### 🔵 Agents pédagogiques (par département) — page `/login/agent`
| Identifiant | Département |
|---|---|
| `n.ferhat@univ-oran1.dz` | **Informatique (compte principal de la démo)** |
| `a.bensaid@univ-oran1.dz` | Mathématiques |
| `r.mansouri@univ-oran1.dz` | Physique |
| `s.boudiaf@univ-oran1.dz` | Chimie |

### 🟢 Enseignants — page `/login/enseignant`
| Identifiant | Modules principaux |
|---|---|
| `m.hadj@univ-oran1.dz` | **Algorithmique / PFE (responsable, compte principal)** |
| `s.khelifi@univ-oran1.dz` | Systèmes d'Exploitation 2 |
| `y.belkacem@univ-oran1.dz` | Réseaux / Sécurité |
| `h.boukhalfa@univ-oran1.dz` | Bases de Données Avancées |
| `f.lahmar@univ-oran1.dz` | Génie Logiciel |
| `n.mansouri@univ-oran1.dz` | Compilation / Web & Mobile |
| `k.benmabrouk@univ-oran1.dz` | Intelligence Artificielle |
| *(aussi : a.ziani, r.taleb, l.saidi, r.amrani, o.djoudi, n.meftah @univ-oran1.dz)* | |

### 🎓 Étudiants — page `/login/etudiant` (connexion par **matricule**)
| Matricule | Étudiant |
|---|---|
| `222237400711` | **KADI Islam — L3 Groupe 1 (compte exemple détaillé)** |
| `222237347305` | Mecheri Fatima Zohra — L3 G1 |
| `222237347817` | Negadi Mohammed Aymene — L3 G2 |
| `222237401612` | Touati Hanene — L3 G2 |
| *(tous les autres matricules L3 de la liste fonctionnent aussi)* | |

#### 🔑 Les ~750 comptes générés (étudiants + enseignants)
- **Étudiants générés** : se connectent par **matricule** (page `/login/etudiant`). Les matricules suivent le format `24<dépt><niveau><n°>` (ex. Maths M1 : `2431210001`). Le **mot de passe** de chaque étudiant est visible côté **Agent → Comptes étudiants** (colonne mot de passe / bouton « Exporter » qui génère un PDF d'identifiants).
- **Enseignants générés** : se connectent par **nom d'utilisateur** (page `/login/enseignant`), au format `<initiale>.<nom>` (ex. `i.bouras`). Mot de passe visible côté **Agent → Comptes enseignants**.
- Comme les mots de passe sont stockés en base (`users.initial_password`), **ils restent affichés après un rafraîchissement de la page** — il n'y a plus de « Non disponible ».

> Pour récupérer un identifiant précis : **Agent → Comptes → Étudiants/Enseignants**, filtrez par niveau, puis « Exporter tout » ou « Exporter sélection » → PDF des identifiants (matricule/username + mot de passe).

---

## 3. Parcours conseillé pour le jury (toutes les fonctionnalités)

### Super-Agent
- **Accueil :** statistiques globales (4 agents, ~262 modules, ~756 étudiants, 53 enseignants).
- **Comptes / Agents :** les 4 départements ; création d'un nouvel agent (génère identifiant + mot de passe).
- **Modules :** section « Tous mes modules créés » = **programme complet L1→L3 + ING1** (codes, crédits, UE). Création/édition d'un module.

### Agent Informatique (`n.ferhat`)
- **Accueil / Comptes étudiants & enseignants** (inscriptions, statuts).
- **Notes & Validation :** workflow enseignant → agent (en attente / soumis / validé / publié).
- **Délibérations** (L3 S5 terminée avec admis/ajournés/rattrapages).
- **Calendrier académique** + **planning des examens** S5 (janvier 2026).
- **Emplois du temps**, **Permissions enseignants** (autorisations de saisie S5).
- **Annonces** : publiez une annonce → visible chez enseignants **et** étudiants.
- **Notifications** : envoi à *tous les étudiants / par niveau / un étudiant* et *tous les enseignants / un enseignant*.

### Enseignant (`m.hadj`)
- Modules, étudiants, **saisie des notes** (selon permissions), supports de cours.
- **Recours** : décisions sur les réclamations des étudiants.
- Notifications de l'administration sur l'accueil.

### Étudiant (`222237400711` — KADI Islam)
- Relevé de notes **S5 + S6** (dont une note de **Compilation en rattrapage**).
- Emploi du temps, supports, annonces universitaires.
- **Recours** : une réclamation **en attente** sur l'examen de Compilation (illustre le cycle étudiant → enseignant → agent).

> 💡 **Histoire de réclamation à montrer :** KADI Islam conteste sa note d'examen de Compilation (8.5). On retrouve ce recours côté **enseignant** (à décider) et côté **agent** (à valider). Les 4 états existent dans les données : *en attente, accepté, refusé, validé par l'agent*.

---

## 4. Contenu des données injectées

Université peuplée sur **4 départements** (Informatique, Mathématiques, Physique, Chimie) :

- **~756 étudiants** — **30 par niveau** :
  - Informatique : L1, L2, L3, M1, M2, ING1→ING5 (10 niveaux)
  - Mathématiques / Physique / Chimie : L1, L2, L3, M1, M2 (5 niveaux chacun)
  - Chaque niveau = **2 sections (Section 1 / Section 2) × 2 groupes** (Groupe 1→4), **chaque groupe a son propre emploi du temps**.
- **53 enseignants** (corps existant + générés par département) — chacun avec modules assignés et mot de passe persistant.
- **262 modules** — programmes complets par département/niveau (UEF/UEM/UED/UET, crédits, coefficients, CM/TD/TP).
- **~3 800 notes** publiées, **157 soumissions** de notes (workflow complet), **5 recours** (les 4 états), **26 délibérations**.
- **158 réinscriptions** (états variés), **permissions**, **598 séances** (emplois du temps par groupe), **83 supports**, **14 annonces** (générales + par département), **15 événements**.
- **Mots de passe persistants** pour **814 comptes** (`users.initial_password`).

> Le **compte exemple détaillé** reste **KADI Islam (`222237400711`)** avec son recours de Compilation, conservé intact au milieu de la population générale.

---

## 5. ↩️ Revenir à la version PRÉCÉDENTE (avant cette démo)

Tout l'état antérieur (code **et** base de données) est figé dans le tag git **`pre-jury-demo`**.

**Restauration complète en une commande :**
```bash
git reset --hard pre-jury-demo
```
> Cela restaure tout le code **et** l'ancienne base `eduspace.sqlite` (la base était incluse dans le checkpoint).

**Filet de sécurité supplémentaire** — une copie brute de l'ancienne base est conservée :
```
backend/database/eduspace.sqlite.pre-demo-backup
```
Pour ne restaurer que la base (Windows) :
```bash
copy /Y backend\database\eduspace.sqlite.pre-demo-backup backend\database\eduspace.sqlite
```

**Pour revenir À la démo après un revert :** `git reset --hard main` (si la démo a été committée) ou relancer `php artisan migrate:fresh --seed`.

---

## 6. Note technique
Un correctif a été appliqué à `backend/app/Http/Controllers/AuthController.php` pour permettre la connexion d'un agent par **e-mail complet** (auparavant la connexion agent échouait). Les comptes agents fonctionnent désormais avec leur adresse `@univ-oran1.dz`.
