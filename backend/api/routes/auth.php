<?php
// ============================================================
// ROUTES AUTHENTIFICATION
// ============================================================

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email et mot de passe requis']);
        return;
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
    $stmt->execute([trim($data['email'])]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
        return;
    }

    $token = generateToken($user['id']);

    echo json_encode([
        'success' => true,
        'token'   => $token,
        'user'    => [
            'id'         => $user['id'],
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'email'      => $user['email'],
            'role'       => $user['role'],
            'campus_id'  => $user['campus_id'],
        ]
    ]);
}

function handleLogout() {
    echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
}

function handleRegister() {
    $data = json_decode(file_get_contents('php://input'), true);

    $required = ['first_name', 'last_name', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Champ '$field' requis"]);
            return;
        }
    }

    $allowed_roles = ['admin', 'professor', 'assistant', 'responsable'];
    if (!in_array($data['role'], $allowed_roles)) {
        http_response_code(400);
        echo json_encode(['error' => 'Rôle invalide']);
        return;
    }

    $db = getDB();

    // Vérifier si email déjà utilisé
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email déjà utilisé']);
        return;
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $db->prepare(
        'INSERT INTO users (first_name, last_name, email, password, role, campus_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $hash,
        $data['role'],
        $data['campus_id'] ?? null,
    ]);

    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}