<?php
// ============================================================
// API REST - POINT D'ENTRÉE PRINCIPAL
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/students.php';
require_once __DIR__ . '/routes/absences.php';
require_once __DIR__ . '/routes/sessions.php';
require_once __DIR__ . '/routes/stats.php';
require_once __DIR__ . '/routes/users.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Supprimer le prefixe du projet
$uri    = preg_replace('#^/gestion-absences/backend/api(/index\.php)?#', '', $uri);
$parts  = explode('/', trim($uri, '/'));
$route  = $parts[0] ?? '';
$id     = $parts[1] ?? null;

switch ($route) {

    // ── AUTH ──────────────────────────────────────────────
    case 'login':
        if ($method === 'POST') handleLogin();
        break;

    case 'logout':
        if ($method === 'POST') { requireAuth(); handleLogout(); }
        break;

    case 'register':
        if ($method === 'POST') { requireAuth('admin'); handleRegister(); }
        break;

    // ── ÉTUDIANTS ─────────────────────────────────────────
    case 'students':
        requireAuth();
        if ($method === 'GET' && !$id)   getStudents();
        if ($method === 'GET' && $id)    getStudent($id);
        if ($method === 'POST' && !$id)  createStudent();
        if ($method === 'PUT' && $id)    updateStudent($id);
        if ($method === 'DELETE' && $id) { requireAuth('admin'); deleteStudent($id); }
        break;

    case 'import-students':
        requireAuth('admin');
        if ($method === 'POST') importStudentsCSV();
        break;

    // ── ABSENCES ──────────────────────────────────────────
    case 'absences':
        requireAuth();
        if ($method === 'GET' && !$id)  getAbsences();
        if ($method === 'GET' && $id)   getStudentAbsences($id);
        if ($method === 'POST')         recordAbsences();
        if ($method === 'PUT' && $id)   justifyAbsence($id);
        break;

    // ── SÉANCES ───────────────────────────────────────────
    case 'sessions':
        requireAuth();
        if ($method === 'GET' && !$id)  getSessions();
        if ($method === 'GET' && $id)   getSession($id);
        if ($method === 'POST')         createSession();
        break;

    // ── STATISTIQUES ──────────────────────────────────────
    case 'stats':
        requireAuth();
        $sub = $parts[1] ?? 'general';
        if ($sub === 'general') getGeneralStats();
        if ($sub === 'student') getStudentStats($parts[2] ?? null);
        if ($sub === 'subject') getSubjectStats($parts[2] ?? null);
        if ($sub === 'alerts')  getAlerts();
        break;

    // ── UTILISATEURS ──────────────────────────────────────
    case 'users':
        requireAuth('admin');
        if ($method === 'GET')           getUsers();
        if ($method === 'POST')          createUser();
        if ($method === 'PUT' && $id)    updateUser($id);
        if ($method === 'DELETE' && $id) deleteUser($id);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route introuvable']);
        break;
}