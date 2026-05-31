<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    
    $etudiants = (int)$db->query('SELECT COUNT(*) FROM students WHERE is_active = 1')->fetchColumn();
    $profs     = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'professor' AND is_active = 1")->fetchColumn();
    $matieres  = (int)$db->query('SELECT COUNT(*) FROM subjects')->fetchColumn();
    $absences  = (int)$db->query(
        "SELECT COUNT(*) FROM absences a
         JOIN sessions s ON a.session_id = s.id
         WHERE a.is_absent = 1 AND s.session_date = CURDATE()"
    )->fetchColumn();

    echo json_encode([
        'status'    => 'OK',
        'etudiants' => $etudiants,
        'profs'     => $profs,
        'matieres'  => $matieres,
        'absences_jour' => $absences,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}