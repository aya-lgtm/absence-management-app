<?php
function getFilieres() {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM filieres ORDER BY name');
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
}

function createFiliere() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom obligatoire']);
        return;
    }
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO filieres (name, code, campus_id) VALUES (?, ?, ?)'
    );
    $stmt->execute([
        $data['name'],
        $data['code']      ?? null,
        $data['campus_id'] ?? null,
    ]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

function updateFiliere($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();
    $stmt = $db->prepare(
        'UPDATE filieres SET name=?, code=?, campus_id=? WHERE id=?'
    );
    $stmt->execute([
        $data['name'],
        $data['code']      ?? null,
        $data['campus_id'] ?? null,
        $id
    ]);
    echo json_encode(['success' => true]);
}

function deleteFiliere($id) {
    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM filieres WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}