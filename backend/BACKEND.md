# EduSpace Backend API

Laravel 11 + SQLite + Sanctum

## First-time setup

**Requirements:** PHP 8.3, Composer

```bash
# 1. Install PHP 8.3 (Windows)
winget install PHP.PHP.8.3

# 2. Install Composer (Windows) — download from https://getcomposer.org/Composer-Setup.exe
#    Then restart your terminal.

# 3. Install dependencies
cd backend
composer install

# 4. Create environment file
cp .env.example .env
php artisan key:generate

# 5. Create the database and seed demo data
php artisan migrate --seed
```

## Start the server

```bash
php artisan serve
# API available at http://localhost:8000
```

## Reset & re-seed

```bash
php artisan migrate:fresh --seed
```

## Demo accounts (password: `password`)

| Role        | Email                             |
|-------------|-----------------------------------|
| Étudiant    | k.bensalem@univ-alger.dz         |
| Enseignant  | m.hadj@univ-alger.dz             |
| Agent       | n.ferhat@univ-alger.dz           |
| Super Agent | superagent@univ-alger.dz         |

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

```
POST /api/auth/login       → { token, user }
POST /api/auth/logout
GET  /api/auth/me
```

## Endpoint groups

| Prefix            | Role required  |
|-------------------|----------------|
| `/api/etudiant/*` | etudiant       |
| `/api/enseignant/*` | enseignant   |
| `/api/agent/*`    | agent          |
| `/api/super-agent/*` | super_agent |

## Key endpoints

### Étudiant
- `GET  /api/etudiant/notes`
- `GET  /api/etudiant/emploi-du-temps`
- `GET  /api/etudiant/supports`
- `GET  /api/etudiant/notifications`
- `POST /api/etudiant/recours`
- `GET  /api/etudiant/recours`

### Enseignant
- `GET  /api/enseignant/modules`
- `GET  /api/enseignant/recours`
- `POST /api/enseignant/recours/{id}/decision`  body: `{decision, note_proposee?, commentaire?}`
- `GET  /api/enseignant/soumissions`
- `POST /api/enseignant/soumissions/{id}/submit`

### Agent
- `GET  /api/agent/students`
- `GET  /api/agent/grade-submissions`
- `POST /api/agent/grade-submissions/{id}/validate`
- `POST /api/agent/grade-submissions/{id}/publish`
- `GET  /api/agent/recours/pending`
- `POST /api/agent/recours/{id}/validate`
- `GET  /api/agent/salles`
- `GET  /api/agent/evenements`
- `GET  /api/agent/deliberations`

### Super Agent
- `GET  /api/super-agent/agents`
- `POST /api/super-agent/agents`
- `GET  /api/super-agent/modules`
- `POST /api/super-agent/modules`
