<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

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
require_once __DIR__ . '/routes/filieres.php';
require_once __DIR__ . '/routes/subjects.php';
require_once __DIR__ . '/routes/groups.php';

$method = $_SERVER['REQUEST_METHOD'];

// Routing — support ?route= ET URI
if (isset($_GET['route']) && !empty($_GET['route'])) {
    $parts = explode('/', trim($_GET['route'], '/'));
} else {
    $uri   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri   = preg_replace('#^.*?/backend/api(/index\.php)?#', '', $uri);
    $parts = explode('/', trim($uri, '/'));
}

$route = $parts[0] ?? '';
$id    = $parts[1] ?? null;
if (!$id && !empty($_GET['id'])) {
    $id = $_GET['id'];
}

switch ($route) {

    case 'login':
        if ($method === 'POST') handleLogin();
        break;

        case 'register':
            if ($method === 'POST') { requireAuth('admin'); handleRegister(); }
            break;

    case 'register':
        if ($method === 'POST') { requireAuth('admin'); handleRegister(); }
        break;

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

    case 'absences':
        requireAuth();
        if ($method === 'GET' && !$id)  getAbsences();
        if ($method === 'GET' && $id)   getStudentAbsences($id);
        if ($method === 'POST')         recordAbsences();
        if ($method === 'PUT' && $id)   justifyAbsence($id);
        break;

    case 'sessions':
        requireAuth();
        if ($method === 'GET' && !$id)  getSessions();
        if ($method === 'GET' && $id)   getSession($id);
        if ($method === 'POST')         createSession();
        break;

        case 'stats':
            requireAuth();
            $sub = $parts[1] ?? 'general';
            if ($sub === 'general')   getGeneralStats();
            if ($sub === 'student')   getStudentStats($parts[2] ?? null);
            if ($sub === 'subject')   getSubjectStats($parts[2] ?? null);
            if ($sub === 'alerts')    getAlerts();
            break;
        
        // ← AJOUTER CE NOUVEAU CASE :
        case 'dashboard':
            requireAuth();
            $sub = $parts[1] ?? '';
            if ($sub === 'stats')           getDashboardStats();
            if ($sub === 'alerts')          getDashboardAlerts();
            if ($sub === 'appels-non-faits') getDashboardAppels();
            if ($sub === 'activite')        getDashboardActivite();
            break;

    case 'users':
        requireAuth('admin');
        if ($method === 'GET')           getUsers();
        if ($method === 'POST')          createUser();
        if ($method === 'PUT' && $id)    updateUser($id);
        if ($method === 'DELETE' && $id) deleteUser($id);
        if ($method === 'PATCH' && $id)  resetUserPassword($id);
        break;

        case 'filieres':
            requireAuth();
            if ($method === 'GET')           getFilieres();
            if ($method === 'POST')          createFiliere();
            if ($method === 'PUT'  && $id)   updateFiliere($id);
            if ($method === 'DELETE' && $id) deleteFiliere($id);
            break;


     
            case 'subjects':
                requireAuth();
                if ($method === 'GET')           getMatieres();
                if ($method === 'POST')          createMatiere();
                if ($method === 'PUT'  && $id)   updateMatiere($id);
                if ($method === 'DELETE' && $id) deleteMatiere($id);
                break;
            
            case 'groups':
                requireAuth();
                if ($method === 'GET')           getGroupes();
                if ($method === 'POST')          createGroupe();
                if ($method === 'PUT'  && $id)   updateGroupe($id);
                if ($method === 'DELETE' && $id) deleteGroupe($id);
                break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route introuvable']);
        break;
}