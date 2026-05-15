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
    $stmt = $db->prepare('UPDATE users SET first_name=?, last_name=?, email=?, role=?, campus_id=?, is_active=? WHERE id=?');
    $stmt->execute([$data['first_name'], $data['last_name'], $data['email'], $data['role'], $data['campus_id'] ?? null, $data['is_active'] ?? 1, $id]);
    echo json_encode(['success' => true]);
}

function deleteUser($id) {
    $db = getDB();
    $db->prepare('UPDATE users SET is_active = 0 WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
}