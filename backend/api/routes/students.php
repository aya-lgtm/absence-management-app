<?php
// ============================================================
// ROUTES ÉTUDIANTS
// ============================================================

function getStudents() {
    $db = getDB();
    $where = ['1=1'];
    $params = [];

    if (!empty($_GET['filiere_id'])) {
        $where[]  = 's.filiere_id = ?';
        $params[] = $_GET['filiere_id'];
    }
    if (!empty($_GET['campus_id'])) {
        $where[]  = 's.campus_id = ?';
        $params[] = $_GET['campus_id'];
    }
    if (!empty($_GET['search'])) {
        $where[]  = "(s.first_name LIKE ? OR s.last_name LIKE ? OR s.code_apogee LIKE ?)";
        $like     = '%' . $_GET['search'] . '%';
        $params   = array_merge($params, [$like, $like, $like]);
    }

    $sql = "SELECT s.*, f.name AS filiere_name, c.name AS campus_name
        FROM students s
        LEFT JOIN filieres f ON s.filiere_id = f.id
        LEFT JOIN campuses c ON s.campus_id = c.id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY s.last_name, s.first_name";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getStudent($id) {
    $db   = getDB();
    $stmt = $db->prepare(
        "SELECT s.*, f.name AS filiere_name, c.name AS campus_name
         FROM students s
         JOIN filieres f ON s.filiere_id = f.id
         JOIN campuses c ON s.campus_id = c.id
         WHERE s.id = ?"
    );
    $stmt->execute([$id]);
    $student = $stmt->fetch();
    if (!$student) { http_response_code(404); echo json_encode(['error' => 'Étudiant non trouvé']); return; }
    echo json_encode(['success' => true, 'data' => $student]);
}

function createStudent() {
    $data = json_decode(file_get_contents('php://input'), true);
    $required = ['first_name', 'last_name', 'filiere_id'];
    foreach ($required as $f) {
        if (empty($data[$f])) { 
            http_response_code(400); 
            echo json_encode(['error' => "Champ '$f' requis"]); 
            return; 
        }
    }

    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO students (first_name, last_name, email, code_apogee, filiere_id, campus_id, group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email']       ?? null,
        $data['code_apogee'] ?? null,
        $data['filiere_id'],
        $data['campus_id']   ?? null,
        $data['group_id']    ?? null, // ← ajouté
    ]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

function updateStudent($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();
    $stmt = $db->prepare(
        'UPDATE students SET first_name=?, last_name=?, email=?, code_apogee=?, 
         filiere_id=?, campus_id=?, is_active=?, group_id=? WHERE id=?'
    );
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email']      ?? null,
        $data['code_apogee']?? null,
        $data['filiere_id'] ?? null,
        $data['campus_id']  ?? null,
        $data['is_active']  ?? 1,
        $data['group_id'] ?? null,
        $id
    ]);
    echo json_encode(['success' => true]);
}
function deleteStudent($id) {
    $db   = getDB();
    $stmt = $db->prepare('DELETE FROM students WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}

function importStudentsCSV() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['students']) || !is_array($data['students'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        return;
    }

    $db    = getDB();
    $stmt  = $db->prepare(
        'INSERT IGNORE INTO students (first_name, last_name, email, code_apogee, filiere_id, campus_id)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $count  = 0;
    $errors = [];

    foreach ($data['students'] as $row) {
        if (empty($row['first_name']) || empty($row['last_name'])) continue;
        try {
            $stmt->execute([
                trim($row['first_name']),
                trim($row['last_name']),
                trim($row['email'])       ?: null,
                trim($row['code_apogee']) ?: null,
                $row['filiere_id']        ?? null,
                $row['campus_id']         ?? null,
            ]);
            $count++;
        } catch (Exception $e) {
            $errors[] = $row['first_name'] . ' ' . $row['last_name'] . ' : ' . $e->getMessage();
        }
    }

    echo json_encode([
        'success'  => true,
        'imported' => $count,
        'errors'   => $errors
    ]);
}