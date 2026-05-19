<?php
// ============================================================
// MIDDLEWARE AUTHENTIFICATION - TOKEN SIMPLE
// ============================================================

function generateToken($user_id) {
    $payload = base64_encode(json_encode([
        'user_id' => $user_id,
        'exp'     => time() + JWT_EXPIRY,
        'iat'     => time(),
    ]));
    $signature = hash_hmac('sha256', $payload, JWT_SECRET);
    return $payload . '.' . $signature;
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return false;

    [$payload, $signature] = $parts;
    $expected = hash_hmac('sha256', $payload, JWT_SECRET);
    if (!hash_equals($expected, $signature)) return false;

    $data = json_decode(base64_decode($payload), true);
    if (!$data || $data['exp'] < time()) return false;

    return $data;
}

function requireAuth($role = null) {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        die(json_encode(['error' => 'Token manquant ou invalide']));
    }

    $token = substr($auth, 7);
    $data  = verifyToken($token);

    if (!$data) {
        http_response_code(401);
        die(json_encode(['error' => 'Token expiré ou invalide']));
    }

    // Vérifier le rôle si nécessaire
    if ($role) {
        $db   = getDB();
        $stmt = $db->prepare('SELECT role FROM users WHERE id = ? AND is_active = 1');
        $stmt->execute([$data['user_id']]);
        $user = $stmt->fetch();

        if (!$user || $user['role'] !== $role) {
            http_response_code(403);
            die(json_encode(['error' => 'Accès refusé : permissions insuffisantes']));
        }
    }

    return $data['user_id'];
}

function getCurrentUser() {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) return null;
    $token = substr($auth, 7);
    $data  = verifyToken($token);
    if (!$data) return null;

    $db   = getDB();
    $stmt = $db->prepare('SELECT id, first_name, last_name, email, role, campus_id FROM users WHERE id = ?');
    $stmt->execute([$data['user_id']]);
    return $stmt->fetch();
}