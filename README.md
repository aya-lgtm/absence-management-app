<<<<<<< HEAD
# student-management-app
 Application web de gestion des étudiants - CRUD avec Express.js
=======
 # Backend — Gestion des Absences API

## Stack
- PHP 8+ / Apache
- MySQL 8+

## Installation
1. Importer `database/absences.sql` dans MySQL
2. Copier `config/database.example.php` → `config/database.php` et remplir les identifiants
3. Placer le dossier dans `htdocs/` (XAMPP) ou `/var/www/html/`
4. Activer `mod_rewrite` sur Apache

## Compte par défaut
- Email : `admin@hem.ma`
- Mot de passe : `Password123`

---

## Endpoints API

### Auth
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/login` | Connexion → retourne un token |
| POST | `/api/logout` | Déconnexion |
| POST | `/api/register` | Créer un compte (admin only) |

### Étudiants
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/students` | Liste (filtres: filiere_id, campus_id, search) |
| GET | `/api/students/{id}` | Détail d'un étudiant |
| POST | `/api/students` | Créer un étudiant |
| PUT | `/api/students/{id}` | Modifier |
| DELETE | `/api/students/{id}` | Supprimer (admin) |
| POST | `/api/import-students` | Import CSV |

### Absences
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/absences` | Liste (filtres: session_id, student_id, date) |
| GET | `/api/absences/{student_id}` | Absences d'un étudiant |
| POST | `/api/absences` | Enregistrer les absences d'une séance |
| PUT | `/api/absences/{id}` | Justifier une absence |

### Séances
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/sessions` | Liste des séances |
| GET | `/api/sessions/{id}` | Détail + liste étudiants |
| POST | `/api/sessions` | Créer une séance |

### Statistiques
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/stats/general` | Chiffres globaux |
| GET | `/api/stats/student/{id}` | Stats d'un étudiant |
| GET | `/api/stats/subject/{id}` | Stats d'une matière |
| GET | `/api/stats/alerts` | Étudiants en alerte |

### Utilisateurs (admin)
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users` | Liste |
| POST | `/api/users` | Créer |
| PUT | `/api/users/{id}` | Modifier |
| DELETE | `/api/users/{id}` | Désactiver |

---

## Format des requêtes

### Login
```json
POST /api/login
{ "email": "prof@hem.ma", "password": "Password123" }
```

### Enregistrer les absences
```json
POST /api/absences
Authorization: Bearer <token>
{
  "session_id": 1,
  "absences": [
    { "student_id": 1, "is_absent": true,  "delay_minutes": 0 },
    { "student_id": 2, "is_absent": false, "delay_minutes": 15 },
    { "student_id": 3, "is_absent": false, "delay_minutes": 0 }
  ]
}
```

## Règles métier automatiques
- **3ème absence** (cours 3 crédits) → note participation = 00/20
- **6ème absence** (cours 3 crédits) → note moyenne = 00/20
- **20 absences globales** → perte d'un rachettage
- **40 absences globales** → perte des 2 rachettages + mention
- **72 absences globales** → redoublant automatique
>>>>>>> 2e8fa6ffbb4d2c50e7162fc6745085be8b50a738
