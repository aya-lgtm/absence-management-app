<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/backend/api/config/database.php';
require_once __DIR__ . '/backend/api/middleware/auth.php';
require_once __DIR__ . '/backend/api/routes/auth.php';
echo json_encode(['success' => true, 'message' => 'Tous les fichiers chargés OK !']);
