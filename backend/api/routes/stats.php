<?php
// ============================================================
// ROUTES STATISTIQUES
// ============================================================

function getGeneralStats() {
    $db = getDB();

    $students = $db->query('SELECT COUNT(*) FROM students WHERE is_active = 1')->fetchColumn();
    $absences = $db->query('SELECT COUNT(*) FROM absences WHERE is_absent = 1')->fetchColumn();
    $delays   = $db->query('SELECT COUNT(*) FROM absences WHERE delay_minutes > 0')->fetchColumn();
    $sessions = $db->query('SELECT COUNT(*) FROM sessions')->fetchColumn();
    $alerts   = $db->query("SELECT COUNT(*) FROM student_states WHERE state != 'normal'")->fetchColumn();

    echo json_encode(['success' => true, 'data' => [
        'total_students' => (int)$students,
        'total_absences' => (int)$absences,
        'total_delays'   => (int)$delays,
        'total_sessions' => (int)$sessions,
        'total_alerts'   => (int)$alerts,
    ]]);
}

function getStudentStats($student_id) {
    if (!$student_id) {
        http_response_code(400);
        echo json_encode(['error' => 'student_id requis']);
        return;
    }
    $db = getDB();

    $stmt = $db->prepare(
        "SELECT sub.name AS subject, ss.absence_count,
                ss.total_absence_hours, ss.state, ss.participation_note
         FROM student_states ss
         JOIN subjects sub ON ss.subject_id = sub.id
         WHERE ss.student_id = ?"
    );
    $stmt->execute([$student_id]);
    $by_subject = $stmt->fetchAll();

    $stmt2 = $db->prepare(
        "SELECT COUNT(*) AS total FROM absences WHERE student_id = ? AND is_absent = 1"
    );
    $stmt2->execute([$student_id]);
    $total = $stmt2->fetch()['total'];

    echo json_encode(['success' => true, 'data' => [
        'total_absences' => (int)$total,
        'by_subject'     => $by_subject,
        'rachettage'     => $total >= 40 ? 'perdu' : ($total >= 20 ? 'un perdu' : 'OK'),
        'status'         => $total >= 72 ? 'REDOUBLANT' : 'OK',
    ]]);
}

function getSubjectStats($subject_id) {
    if (!$subject_id) {
        http_response_code(400);
        echo json_encode(['error' => 'subject_id requis']);
        return;
    }
    $db = getDB();

    $stmt = $db->prepare(
        "SELECT s.id, CONCAT(s.first_name,' ',s.last_name) AS name,
                ss.absence_count, ss.state
         FROM students s
         LEFT JOIN student_states ss ON s.id = ss.student_id AND ss.subject_id = ?
         WHERE s.is_active = 1
         ORDER BY ss.absence_count DESC"
    );
    $stmt->execute([$subject_id]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}

function getAlerts() {
    $db   = getDB();
    $stmt = $db->query(
        "SELECT ss.*, CONCAT(s.first_name,' ',s.last_name) AS student_name,
                sub.name AS subject_name
         FROM student_states ss
         JOIN students s ON ss.student_id = s.id
         JOIN subjects sub ON ss.subject_id = sub.id
         WHERE ss.state != 'normal'
         ORDER BY ss.state DESC"
    );
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
}