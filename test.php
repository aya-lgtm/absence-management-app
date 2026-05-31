<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/backend/api/config/database.php';
try {
    $db = getDB();
    echo json_encode(['success' => true, 'message' => 'Connexion BDD OK !']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
