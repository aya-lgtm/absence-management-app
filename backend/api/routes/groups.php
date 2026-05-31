<?php
function getGroupes() {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT g.*, 
                COUNT(s.id) as student_count
         FROM `groups` g
         LEFT JOIN students s ON s.group_id = g.id AND s.is_active = 1
         GROUP BY g.id
         ORDER BY g.name'
    );
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
}

function createGroupe() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom obligatoire']);
        return;
    }
    $db   = getDB();
    $stmt = $db->prepare('INSERT INTO `groups` (name, filiere_id) VALUES (?, ?)');
    $stmt->execute([$data['name'], $data['filiere_id'] ?? null]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

function updateGroupe($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();
    $stmt = $db->prepare('UPDATE `groups` SET name=?, filiere_id=? WHERE id=?');
    $stmt->execute([$data['name'], $data['filiere_id'] ?? null, $id]);
    echo json_encode(['success' => true]);
}

function deleteGroupe($id) {
    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM `groups` WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}