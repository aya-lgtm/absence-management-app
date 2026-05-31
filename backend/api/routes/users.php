<?php
// ============================================================
// ROUTES UTILISATEURS (admin only)
// ============================================================

function getUsers() {
    $db   = getDB();
    $stmt = $db->query(
        "SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active,
                c.name AS campus_name
         FROM users u LEFT JOIN campuses c ON u.campus_id = c.id
         ORDER BY u.last_name"
    );
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function createUser() {
    $data     = json_decode(file_get_contents('php://input'), true);
    $required = ['first_name', 'last_name', 'email', 'password', 'role'];
    foreach ($required as $f) {
        if (empty($data[$f])) { http_response_code(400); echo json_encode(['error' => "Champ '$f' requis"]); return; }
    }
    $db   = getDB();
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $db->prepare(
        'INSERT INTO users (first_name, last_name, email, password, role, campus_id) VALUES (?,?,?,?,?,?)'
    );
    $stmt->execute([$data['first_name'], $data['last_name'], $data['email'], $hash, $data['role'], $data['campus_id'] ?? null]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

function updateUser($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();

    // Toggle seul (is_active uniquement)
    if (isset($data['is_active']) && count($data) === 1) {
        $stmt = $db->prepare('UPDATE users SET is_active = ? WHERE id = ?');
        $stmt->execute([$data['is_active'], $id]);
        echo json_encode(['success' => true]);
        return;
    }

    // Mise à jour complète
    $stmt = $db->prepare(
        'UPDATE users SET first_name=?, last_name=?, email=?, role=?, is_active=? WHERE id=?'
    );
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email']     ?? null,
        $data['role']      ?? 'professor',
        $data['is_active'] ?? 1,
        $id
    ]);
    echo json_encode(['success' => true]);
}

function deleteUser($id) {
    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}


function resetUserPassword($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nouveau mot de passe requis']);
        return;
    }
    $db   = getDB();
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hash, $id]);
    echo json_encode(['success' => true]);
}