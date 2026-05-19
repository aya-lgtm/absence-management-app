-- ============================================================
-- SYSTÈME CENTRALISÉ DE GESTION DES ABSENCES - HEM
-- Base de données complète
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_absences CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_absences;

-- ── CAMPUS ──────────────────────────────────────────────────
CREATE TABLE campuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO campuses (name, city) VALUES
('HEM Engineering School', 'Casablanca'),
('HEM Business School', 'Casablanca'),
('HEM Business School', 'Rabat'),
('HEM Business School', 'Marrakech'),
('HEM Business School', 'Tanger');

-- ── FILIÈRES ────────────────────────────────────────────────
CREATE TABLE filieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    campus_id INT NOT NULL,
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

INSERT INTO filieres (name, code, campus_id) VALUES
('Engineering School Semestre 4', 'ES-S4', 1),
('Business School Semestre 2',    'BS-S2', 2);

-- ── MATIÈRES ────────────────────────────────────────────────
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20),
    volume_horaire INT NOT NULL COMMENT 'en heures',
    credits INT DEFAULT 3,
    filiere_id INT NOT NULL,
    FOREIGN KEY (filiere_id) REFERENCES filieres(id)
);

INSERT INTO subjects (name, code, volume_horaire, credits, filiere_id) VALUES
('Langues 2 : Français',                          'L2-FR',  15, 1, 1),
('Langues 2 : Anglais',                           'L2-EN',  30, 2, 1),
('Recherche Opérationnelle & Théorie décision',   'RO-TD',  45, 3, 1),
('Droit Appliqué à l\'informatique',              'DAI',    30, 2, 1),
('Programmation Web',                             'PWEB',   30, 2, 1),
('Administration BD : Oracle',                    'ABD',    45, 3, 1),
('Développement Mobile',                          'DMOB',   45, 3, 1),
('Macro Economie',                                'MECO',   36, 3, 2),
('Techniques Quantitatives 2',                    'TQ2',    36, 3, 2),
('Informatique de Gestion',                       'IG',     36, 3, 2),
('Comptabilité d\'Entreprise 2',                  'CE2',    36, 3, 2),
('Expression française',                          'EXFR',   36, 3, 2),
('Expression Anglaise',                           'EXEN',   36, 3, 2),
('Séminaires Développement personnel 1',          'SDP1',   18, 1, 2);

-- ── UTILISATEURS ────────────────────────────────────────────
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    role ENUM('admin','professor','assistant','responsable') NOT NULL,
    campus_id INT,
    token VARCHAR(255) DEFAULT NULL,
    token_expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- Mot de passe par défaut : "Password123" (bcrypt)
INSERT INTO users (first_name, last_name, email, password, role, campus_id) VALUES
('Admin', 'HEM', 'admin@hem.ma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
('Prof', 'Dupont', 'prof@hem.ma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor', 1);

-- ── ÉTUDIANTS ───────────────────────────────────────────────
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    code_apogee VARCHAR(20) UNIQUE,
    filiere_id INT NOT NULL,
    campus_id INT NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filiere_id) REFERENCES filieres(id),
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- ── SÉANCES ─────────────────────────────────────────────────
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    professor_id INT NOT NULL,
    filiere_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_call_done TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (professor_id) REFERENCES users(id),
    FOREIGN KEY (filiere_id) REFERENCES filieres(id)
);

-- ── ABSENCES ────────────────────────────────────────────────
CREATE TABLE absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    is_absent TINYINT(1) DEFAULT 0,
    delay_minutes INT DEFAULT 0 COMMENT '0 = pas de retard',
    is_justified TINYINT(1) DEFAULT 0,
    justification TEXT DEFAULT NULL,
    justification_file VARCHAR(255) DEFAULT NULL,
    recorded_by INT NOT NULL COMMENT 'user_id du prof',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    UNIQUE KEY unique_absence (student_id, session_id)
);

-- ── ÉTATS AUTOMATIQUES ──────────────────────────────────────
CREATE TABLE student_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    absence_count INT DEFAULT 0,
    total_absence_hours DECIMAL(5,2) DEFAULT 0,
    state ENUM('normal','warning_1','warning_2','failed','redoublant') DEFAULT 'normal',
    participation_note DECIMAL(4,2) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY unique_state (student_id, subject_id)
);

-- ── VUE : résumé absences par étudiant ──────────────────────
CREATE OR REPLACE VIEW v_absence_summary AS
SELECT
    s.id AS student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    sub.name AS subject_name,
    COUNT(CASE WHEN a.is_absent = 1 THEN 1 END) AS total_absences,
    SUM(CASE WHEN a.delay_minutes > 0 THEN a.delay_minutes ELSE 0 END) AS total_delay_minutes,
    COUNT(CASE WHEN a.is_absent = 1 AND a.is_justified = 1 THEN 1 END) AS justified_absences,
    COUNT(CASE WHEN a.is_absent = 1 AND a.is_justified = 0 THEN 1 END) AS unjustified_absences
FROM students s
JOIN absences a ON s.id = a.student_id
JOIN sessions se ON a.session_id = se.id
JOIN subjects sub ON se.subject_id = sub.id
GROUP BY s.id, sub.id; 
