<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/backend/api/config/database.php';
require_once __DIR__ . '/backend/api/middleware/auth.php';
require_once __DIR__ . '/backend/api/routes/auth.php';

$_SERVER['REQUEST_METHOD'] = 'POST';
$data = ['email' => 'admin@hem.ma', 'password' => 'password'];
file_put_contents('php://input', json_encode($data));

ob_start();
handleLogin();
$result = ob_get_clean();
echo $result;
