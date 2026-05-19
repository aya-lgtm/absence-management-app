<?php
// ============================================================
// ROUTES ABSENCES + LOGIQUE AUTOMATIQUE DES ÉTATS
// ============================================================

function getAbsences() {
    $db = getDB();
    $where = ['1=1'];
    $params = [];

    if (!empty($_GET['session_id'])) { $where[] = 'a.session_id = ?'; $params[] = $_GET['session_id']; }
    if (!empty($_GET['student_id'])) { $where[] = 'a.student_id = ?'; $params[] = $_GET['student_id']; }
    if (!empty($_GET['date']))       { $where[] = 'se.session_date = ?'; $params[] = $_GET['date']; }

    $sql = "SELECT a.*,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                sub.name AS subject_name,
                se.session_date, se.start_time
            FROM absences a
            JOIN students s ON a.student_id = s.id
            JOIN sessions se ON a.session_id = se.id
            JOIN subjects sub ON se.subject_id = sub.id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY se.session_date DESC, s.last_name";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getStudentAbsences($student_id) {
    $db   = getDB();
    $stmt = $db->prepare(
        "SELECT a.*, sub.name AS subject_name, se.session_date, se.start_time,
                ss.state, ss.absence_count, ss.participation_note
         FROM absences a
         JOIN sessions se ON a.session_id = se.id
         JOIN subjects sub ON se.subject_id = sub.id
         LEFT JOIN student_states ss ON ss.student_id = a.student_id AND ss.subject_id = sub.id
         WHERE a.student_id = ?
         ORDER BY se.session_date DESC"
    );
    $stmt->execute([$student_id]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function recordAbsences() {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['session_id']) || empty($data['absences'])) {
        http_response_code(400);
        echo json_encode(['error' => 'session_id et absences requis']);
        return;
    }

    $db       = getDB();
    $user     = getCurrentUser();
    $recorded = 0;

    // Marquer la séance comme appelée
    $db->prepare('UPDATE sessions SET is_call_done = 1 WHERE id = ?')
       ->execute([$data['session_id']]);

    // Récupérer la matière de la séance
    $stmt = $db->prepare('SELECT subject_id FROM sessions WHERE id = ?');
    $stmt->execute([$data['session_id']]);
    $session = $stmt->fetch();

    $stmt = $db->prepare(
        'INSERT INTO absences (student_id, session_id, is_absent, delay_minutes, recorded_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            is_absent=VALUES(is_absent),
            delay_minutes=VALUES(delay_minutes)'
    );

    foreach ($data['absences'] as $entry) {
        if (empty($entry['student_id'])) continue;
        $stmt->execute([
            $entry['student_id'],
            $data['session_id'],
            $entry['is_absent']     ? 1 : 0,
            $entry['delay_minutes'] ?? 0,
            $user['id'],
        ]);

        if ($entry['is_absent']) {
            updateStudentState($entry['student_id'], $session['subject_id'], $db);
        }
        $recorded++;
    }

    sendAbsenceSummaryEmail($data['session_id'], $db);
    echo json_encode(['success' => true, 'recorded' => $recorded]);
}

function updateStudentState($student_id, $subject_id, $db) {
    $stmt = $db->prepare(
        "SELECT COUNT(*) AS cnt FROM absences a
         JOIN sessions se ON a.session_id = se.id
         WHERE a.student_id = ? AND se.subject_id = ? AND a.is_absent = 1"
    );
    $stmt->execute([$student_id, $subject_id]);
    $count = $stmt->fetch()['cnt'];

    $stmt = $db->prepare('SELECT credits FROM subjects WHERE id = ?');
    $stmt->execute([$subject_id]);
    $subject = $stmt->fetch();

    $state = 'normal';
    $participation_note = null;

    if ($subject['credits'] == 3) {
        if ($count >= 6)      { $state = 'warning_2'; $participation_note = 0; }
        elseif ($count >= 3)  { $state = 'warning_1'; $participation_note = 0; }
    }

    $stmt = $db->prepare(
        "SELECT COUNT(*) AS total FROM absences WHERE student_id = ? AND is_absent = 1"
    );
    $stmt->execute([$student_id]);
    $total = $stmt->fetch()['total'];

    if ($total >= 72)     $state = 'redoublant';
    elseif ($total >= 40) $state = 'failed';

    $db->prepare(
        "INSERT INTO student_states
            (student_id, subject_id, absence_count, total_absence_hours, state, participation_note)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            absence_count=VALUES(absence_count),
            total_absence_hours=VALUES(total_absence_hours),
            state=VALUES(state),
            participation_note=VALUES(participation_note)"
    )->execute([$student_id, $subject_id, $count, $count * 1.5, $state, $participation_note]);
}

function justifyAbsence($id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();
    $db->prepare('UPDATE absences SET is_justified=1, justification=? WHERE id=?')
       ->execute([$data['justification'] ?? '', $id]);
    echo json_encode(['success' => true]);
}

function sendAbsenceSummaryEmail($session_id, $db) {
    $stmt = $db->prepare(
        "SELECT CONCAT(s.first_name, ' ', s.last_name) AS name,
                a.delay_minutes, a.is_absent
         FROM absences a
         JOIN students s ON a.student_id = s.id
         WHERE a.session_id = ? AND (a.is_absent = 1 OR a.delay_minutes > 0)"
    );
    $stmt->execute([$session_id]);
    $absents = $stmt->fetchAll();
    if (empty($absents)) return;

    $body = "Récapitulatif des absences :\n\n";
    foreach ($absents as $a) {
        if ($a['is_absent'])
            $body .= "ABSENT : {$a['name']}\n";
        elseif ($a['delay_minutes'] > 0)
            $body .= "RETARD {$a['delay_minutes']}min : {$a['name']}\n";
    }
    @mail('administration@hem.ma', 'Récapitulatif Absences', $body, 'From: systeme@hem.ma');
}