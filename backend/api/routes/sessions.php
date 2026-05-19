<?php
// ============================================================
// ROUTES SÉANCES
// ============================================================

function getSessions() {
    $db = getDB();
    $where = ['1=1']; $params = [];

    if (!empty($_GET['professor_id'])) { $where[] = 'se.professor_id = ?'; $params[] = $_GET['professor_id']; }
    if (!empty($_GET['filiere_id']))   { $where[] = 'se.filiere_id = ?';   $params[] = $_GET['filiere_id']; }
    if (!empty($_GET['date']))         { $where[] = 'se.session_date = ?'; $params[] = $_GET['date']; }

    $sql = "SELECT se.*,
                sub.name AS subject_name,
                CONCAT(u.first_name, ' ', u.last_name) AS professor_name,
                f.name AS filiere_name
            FROM sessions se
            JOIN subjects sub ON se.subject_id = sub.id
            JOIN users u ON se.professor_id = u.id
            JOIN filieres f ON se.filiere_id = f.id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY se.session_date DESC, se.start_time";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getSession($id) {
    $db   = getDB();
    $stmt = $db->prepare("SELECT * FROM sessions WHERE id = ?");
    $stmt->execute([$id]);
    $session = $stmt->fetch();
    if (!$session) { http_response_code(404); echo json_encode(['error' => 'Séance non trouvée']); return; }

    // Récupérer aussi la liste des étudiants avec leurs absences pour cette séance
    $stmt2 = $db->prepare(
        "SELECT s.id, s.first_name, s.last_name, s.code_apogee,
                COALESCE(a.is_absent, 0) AS is_absent,
                COALESCE(a.delay_minutes, 0) AS delay_minutes,
                COALESCE(a.is_justified, 0) AS is_justified
         FROM students s
         LEFT JOIN absences a ON s.id = a.student_id AND a.session_id = ?
         WHERE s.filiere_id = ? AND s.is_active = 1
         ORDER BY s.last_name, s.first_name"
    );
    $stmt2->execute([$id, $session['filiere_id']]);
    $session['students'] = $stmt2->fetchAll();

    echo json_encode(['success' => true, 'data' => $session]);
}

function createSession() {
    $data     = json_decode(file_get_contents('php://input'), true);
    $required = ['subject_id', 'filiere_id', 'session_date', 'start_time', 'end_time'];
    foreach ($required as $f) {
        if (empty($data[$f])) { http_response_code(400); echo json_encode(['error' => "Champ '$f' requis"]); return; }
    }

    $user = getCurrentUser();
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO sessions (subject_id, professor_id, filiere_id, session_date, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $data['subject_id'],
        $data['professor_id'] ?? $user['id'],
        $data['filiere_id'],
        $data['session_date'],
        $data['start_time'],
        $data['end_time'],
    ]);
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}