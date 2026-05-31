<?php
// ============================================================
// STATS GÉNÉRALES (ancienne route /stats/general)
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

// ============================================================
// STATS PAR ÉTUDIANT
// ============================================================
function getStudentStats($student_id) {
    if (!$student_id) { http_response_code(400); echo json_encode(['error' => 'student_id requis']); return; }
    $db = getDB();
    $stmt = $db->prepare(
        "SELECT sub.name AS subject, ss.absence_count, ss.total_absence_hours, ss.state, ss.participation_note
         FROM student_states ss
         JOIN subjects sub ON ss.subject_id = sub.id
         WHERE ss.student_id = ?"
    );
    $stmt->execute([$student_id]);
    $by_subject = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt2 = $db->prepare("SELECT COUNT(*) AS total FROM absences WHERE student_id = ? AND is_absent = 1");
    $stmt2->execute([$student_id]);
    $total = (int)$stmt2->fetch(PDO::FETCH_ASSOC)['total'];
    echo json_encode(['success' => true, 'data' => [
        'total_absences' => $total,
        'by_subject'     => $by_subject,
        'rachettage'     => $total >= 40 ? 'perdu' : ($total >= 20 ? 'un perdu' : 'OK'),
        'status'         => $total >= 72 ? 'REDOUBLANT' : 'OK',
    ]]);
}

// ============================================================
// STATS PAR MATIÈRE
// ============================================================
function getSubjectStats($subject_id) {
    if (!$subject_id) { http_response_code(400); echo json_encode(['error' => 'subject_id requis']); return; }
    $db = getDB();
    $stmt = $db->prepare(
        "SELECT s.id, CONCAT(s.first_name,' ',s.last_name) AS name, ss.absence_count, ss.state
         FROM students s
         LEFT JOIN student_states ss ON s.id = ss.student_id AND ss.subject_id = ?
         WHERE s.is_active = 1
         ORDER BY ss.absence_count DESC"
    );
    $stmt->execute([$subject_id]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

// ============================================================
// ALERTES (ancienne route /stats/alerts)
// ============================================================
function getAlerts() {
    $db   = getDB();
    $stmt = $db->query(
        "SELECT ss.*, CONCAT(s.first_name,' ',s.last_name) AS student_name, sub.name AS subject_name
         FROM student_states ss
         JOIN students s   ON ss.student_id = s.id
         JOIN subjects sub ON ss.subject_id = sub.id
         WHERE ss.state != 'normal'
         ORDER BY ss.state DESC"
    );
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

// ============================================================
// ╔══════════════════════════════════════════════════════════╗
// ║        FONCTIONS DASHBOARD — appelées par index.php      ║
// ╚══════════════════════════════════════════════════════════╝

// ────────────────────────────────────────────────────────────
// 1. getDashboardStats()
// ────────────────────────────────────────────────────────────
function getDashboardStats() {
    $db = getDB();

    // ── ÉTUDIANTS ──────────────────────────────────────────
    $total_etudiants = (int)$db->query(
        'SELECT COUNT(*) FROM students WHERE is_active = 1'
    )->fetchColumn();

    $etudiants_mois = (int)$db->query(
        "SELECT COUNT(*) FROM students
         WHERE is_active = 1
           AND MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at)  = YEAR(CURDATE())"
    )->fetchColumn();

    $spark_et = [];
    for ($i = 5; $i >= 0; $i--) {
        $spark_et[] = (int)$db->query(
            "SELECT COUNT(*) FROM students
             WHERE is_active = 1
               AND created_at <= LAST_DAY(DATE_SUB(CURDATE(), INTERVAL $i MONTH))"
        )->fetchColumn();
    }

    // ── PROFESSEURS ────────────────────────────────────────
    $total_profs = (int)$db->query(
        "SELECT COUNT(*) FROM users WHERE role = 'professor' AND is_active = 1"
    )->fetchColumn();

    $profs_mois = (int)$db->query(
        "SELECT COUNT(*) FROM users
         WHERE role = 'professor' AND is_active = 1
           AND MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at)  = YEAR(CURDATE())"
    )->fetchColumn();

    $spark_pr = [];
    for ($i = 5; $i >= 0; $i--) {
        $spark_pr[] = (int)$db->query(
            "SELECT COUNT(*) FROM users
             WHERE role = 'professor' AND is_active = 1
               AND created_at <= LAST_DAY(DATE_SUB(CURDATE(), INTERVAL $i MONTH))"
        )->fetchColumn();
    }

    // ── ABSENCES AUJOURD'HUI & HIER ────────────────────────
    $absences_jour = (int)$db->query(
        "SELECT COUNT(*) FROM absences a
         JOIN sessions s ON a.session_id = s.id
         WHERE a.is_absent = 1 AND s.session_date = CURDATE()"
    )->fetchColumn();

    $absences_hier = (int)$db->query(
        "SELECT COUNT(*) FROM absences a
         JOIN sessions s ON a.session_id = s.id
         WHERE a.is_absent = 1 AND s.session_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"
    )->fetchColumn();

    $rows_ab = $db->query(
        "SELECT s.session_date, COUNT(*) AS c
         FROM absences a
         JOIN sessions s ON a.session_id = s.id
         WHERE a.is_absent = 1
           AND s.session_date >= DATE_SUB(CURDATE(), INTERVAL 5 DAY)
         GROUP BY s.session_date ORDER BY s.session_date ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    $spark_ab = [];
    for ($i = 5; $i >= 0; $i--) {
        $day = date('Y-m-d', strtotime("-$i days"));
        $c   = 0;
        foreach ($rows_ab as $r) { if ($r['session_date'] === $day) { $c = (int)$r['c']; break; } }
        $spark_ab[] = $c;
    }

    // ── MATIÈRES ───────────────────────────────────────────
    $total_matieres = (int)$db->query('SELECT COUNT(*) FROM subjects')->fetchColumn();
    $spark_ma = [];
    for ($i = 5; $i >= 0; $i--) { $spark_ma[] = max(0, $total_matieres - $i); }

    // ── ALERTES ACTIVES ────────────────────────────────────
    $total_alertes = (int)$db->query(
        "SELECT COUNT(*) FROM student_states WHERE state != 'normal'"
    )->fetchColumn();

    $rows_al = $db->query(
        "SELECT DATE_FORMAT(updated_at,'%Y-%m') AS mois, COUNT(*) AS c
         FROM student_states
         WHERE state != 'normal'
           AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
         GROUP BY mois ORDER BY mois ASC"
    )->fetchAll(PDO::FETCH_ASSOC);

    $spark_al = [];
    for ($i = 5; $i >= 0; $i--) {
        $mois = date('Y-m', strtotime("-$i months"));
        $c    = 0;
        foreach ($rows_al as $r) { if ($r['mois'] === $mois) { $c = (int)$r['c']; break; } }
        $spark_al[] = $c;
    }

    echo json_encode([
        'etudiants'       => $total_etudiants,
        'etudiants_mois'  => $etudiants_mois,
        'etudiants_spark' => $spark_et,

        'profs'           => $total_profs,
        'profs_mois'      => $profs_mois,
        'profs_spark'     => $spark_pr,

        'absences_jour'   => $absences_jour,
        'absences_hier'   => $absences_hier,
        'absences_spark'  => $spark_ab,

        'matieres'        => $total_matieres,
        'matieres_mois'   => 0,
        'matieres_spark'  => $spark_ma,

        'alertes'         => $total_alertes,
        'alertes_spark'   => $spark_al,
    ]);
}

// ────────────────────────────────────────────────────────────
// 2. getDashboardAlerts()
//    ✅ BUG CORRIGÉ : sous-requête pour COUNT correct
// ────────────────────────────────────────────────────────────
function getDashboardAlerts() {
    $db = getDB();

    $seuils = [
        [
            'seuil' => 3,
            'level' => 'warn',
            'color' => '#FF6B2B',
            'text'  => 'étudiants ont atteint 3 absences',
            'note'  => '(Note participation = 00/20)',
        ],
        [
            'seuil' => 6,
            'level' => 'warn',
            'color' => '#FFB703',
            'text'  => 'étudiants ont atteint 6 absences',
            'note'  => '(Note moyenne = 00/20)',
        ],
        [
            'seuil' => 20,
            'level' => 'warn',
            'color' => '#FF6B2B',
            'text'  => 'étudiants ont atteint 20 séances',
            'note'  => '(Perd 1 rattrapage)',
        ],
        [
            'seuil' => 40,
            'level' => 'high',
            'color' => '#F72585',
            'text'  => 'étudiant a atteint 40 séances',
            'note'  => '(Perd 2 rattrapages)',
        ],
        [
            'seuil' => 72,
            'level' => 'high',
            'color' => '#F72585',
            'text'  => 'étudiant a atteint 72 séances',
            'note'  => '(Redoublant automatique)',
        ],
    ];

    $result = [];
    foreach ($seuils as $s) {
        // ✅ CORRIGÉ : sous-requête pour compter correctement
        $stmt = $db->prepare(
            "SELECT COUNT(*) FROM (
                SELECT a.student_id
                FROM absences a
                JOIN sessions s ON a.session_id = s.id
                WHERE a.is_absent = 1
                GROUP BY a.student_id
                HAVING COUNT(*) >= ?
            ) AS sub"
        );
        $stmt->execute([$s['seuil']]);
        $count = (int)$stmt->fetchColumn();

        $result[] = [
            'level' => $s['level'],
            'color' => $s['color'],
            'count' => $count,
            'text'  => $s['text'],
            'note'  => $s['note'],
            'time'  => '',
        ];
    }

    echo json_encode($result);
}

// ────────────────────────────────────────────────────────────
// 3. getDashboardAppels()
// ────────────────────────────────────────────────────────────
function getDashboardAppels() {
    $db = getDB();

    $colors = ['#4361EE', '#2DC653', '#FF6B2B', '#9B5DE5', '#F72585'];
    $bgs    = ['var(--blue-bg)', 'var(--green-bg)', 'var(--orange-bg)', 'var(--purple-bg)', 'var(--red-bg)'];
    $icos   = ['var(--blue)', 'var(--green)', 'var(--orange)', 'var(--purple)', 'var(--red)'];

    $stmt = $db->query(
        "SELECT
            s.id,
            CONCAT(sub.name, ' – ', g.name) AS lbl,
            COUNT(DISTINCT sg.student_id)    AS total_students
         FROM sessions s
         JOIN subjects sub      ON s.subject_id = sub.id
         JOIN groups g          ON s.group_id   = g.id
         JOIN student_groups sg ON g.id = sg.group_id
         WHERE s.session_date = CURDATE()
           AND s.id NOT IN (
               SELECT DISTINCT session_id FROM absences
           )
         GROUP BY s.id, sub.name, g.name
         ORDER BY s.start_time ASC
         LIMIT 5"
    );

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($rows as $i => $r) {
        $result[] = [
            'lbl'   => $r['lbl'],
            'count' => '0/' . $r['total_students'],
            'pct'   => 0,
            'color' => $colors[$i % count($colors)],
            'bg'    => $bgs[$i % count($bgs)],
            'ico_c' => $icos[$i % count($icos)],
        ];
    }

    echo json_encode($result);
}

// ────────────────────────────────────────────────────────────
// 4. getDashboardActivite()
// ────────────────────────────────────────────────────────────
function getDashboardActivite() {
    $db = getDB();

    $tables = $db->query("SHOW TABLES LIKE 'activity_log'")->fetchAll();

    if (empty($tables)) {
        // Construire l'activité depuis les tables existantes
        $rows = [];

        // Derniers étudiants ajoutés
        $stmt = $db->query(
            "SELECT
                'var(--green-bg)' AS bg,
                'var(--green)'    AS ic,
                'user-plus'       AS ico,
                'Nouvel étudiant inscrit' AS action,
                CONCAT(first_name, ' ', last_name) AS name,
                'Étudiants' AS module,
                created_at
             FROM students
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             ORDER BY created_at DESC
             LIMIT 3"
        );
        $rows = array_merge($rows, $stmt->fetchAll(PDO::FETCH_ASSOC));

        // Dernières absences justifiées
        $stmt2 = $db->query(
            "SELECT
                'var(--blue-bg)' AS bg,
                'var(--blue)'    AS ic,
                'check'          AS ico,
                'Absence justifiée' AS action,
                CONCAT(st.first_name,' ',st.last_name,' – ',sub.name) AS name,
                'Absences' AS module,
                a.updated_at AS created_at
             FROM absences a
             JOIN sessions s   ON a.session_id = s.id
             JOIN students st  ON a.student_id = st.id
             JOIN subjects sub ON s.subject_id = sub.id
             WHERE a.is_justified = 1
               AND a.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             ORDER BY a.updated_at DESC
             LIMIT 3"
        );
        $rows = array_merge($rows, $stmt2->fetchAll(PDO::FETCH_ASSOC));

        // Trier par date décroissante et limiter à 5
        usort($rows, fn($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));
        $rows = array_slice($rows, 0, 5);

        // Formater le temps
        foreach ($rows as &$r) {
            $diff = (int)((time() - strtotime($r['created_at'])) / 60);
            if ($diff < 60) {
                $r['time'] = "Il y a $diff min";
            } elseif ($diff < 1440) {
                $h = round($diff / 60);
                $r['time'] = "Il y a $h h";
            } else {
                $d = round($diff / 1440);
                $r['time'] = "Il y a $d j";
            }
            unset($r['created_at']);
        }

        echo json_encode($rows);

    } else {
        // Table activity_log présente
        $stmt = $db->query(
            "SELECT
                CASE action_type
                    WHEN 'create_student'  THEN 'var(--green-bg)'
                    WHEN 'justify'         THEN 'var(--blue-bg)'
                    WHEN 'update_subject'  THEN 'var(--orange-bg)'
                    WHEN 'disable_user'    THEN 'var(--red-bg)'
                    WHEN 'import_csv'      THEN 'var(--blue-bg)'
                    ELSE 'var(--bg)'
                END AS bg,
                CASE action_type
                    WHEN 'create_student'  THEN 'var(--green)'
                    WHEN 'justify'         THEN 'var(--blue)'
                    WHEN 'update_subject'  THEN 'var(--orange)'
                    WHEN 'disable_user'    THEN 'var(--red)'
                    WHEN 'import_csv'      THEN 'var(--blue)'
                    ELSE 'var(--muted)'
                END AS ic,
                CASE action_type
                    WHEN 'create_student' THEN 'user-plus'
                    WHEN 'justify'        THEN 'check'
                    WHEN 'update_subject' THEN 'edit'
                    WHEN 'import_csv'     THEN 'upload'
                    ELSE 'check'
                END AS ico,
                description AS action,
                detail      AS name,
                module,
                CONCAT('Il y a ',
                    CASE
                        WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 60
                            THEN CONCAT(TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' min')
                        WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24
                            THEN CONCAT(TIMESTAMPDIFF(HOUR, created_at, NOW()), ' h')
                        ELSE
                            CONCAT(TIMESTAMPDIFF(DAY, created_at, NOW()), ' j')
                    END
                ) AS time
             FROM activity_log
             ORDER BY created_at DESC
             LIMIT 5"
        );
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}