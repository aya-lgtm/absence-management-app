<?php
function getMatieres() {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM subjects ORDER BY name');
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
}

function createMatiere() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom obligatoire']);
        return;
    }
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO subjects (name, code, volume_horaire, credits, filiere_id)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $data['name'],
        $data['code']          ?? null,
        $data['heures']        ?? null,  // heures → volume_horaire
        $data['coefficient']   ?? null,  // coefficient → credits
        $data['filiere_id']    ?? null,
    ]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

function updateMatiere($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();
    $stmt = $db->prepare(
        'UPDATE subjects SET name=?, code=?, volume_horaire=?, credits=?, filiere_id=? WHERE id=?'
    );
    $stmt->execute([
        $data['name'],
        $data['code']        ?? null,
        $data['heures']      ?? null,
        $data['coefficient'] ?? null,
        $data['filiere_id']  ?? null,
        $id
    ]);
    echo json_encode(['success' => true]);
}

function deleteMatiere($id) {
    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM subjects WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}