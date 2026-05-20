// ============================================================
// STATISTIQUES - Graphiques absences par matière
// ============================================================

const API_BASE = 'http://localhost/gestion-absences/backend/api/index.php';

// Récupérer le token stocké
function getToken() {
    return localStorage.getItem('token');
}

// Récupérer les stats générales
async function loadGeneralStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/general`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        
        if (data.success) {
            displayGeneralStats(data.data);
        }
    } catch (error) {
        console.error('Erreur stats:', error);
    }
}

// Afficher les stats générales
function displayGeneralStats(stats) {
    document.getElementById('total-students').textContent = stats.total_students;
    document.getElementById('total-absences').textContent = stats.total_absences;
    document.getElementById('total-delays').textContent = stats.total_delays;
    document.getElementById('total-alerts').textContent = stats.total_alerts;
}

// Récupérer stats d'un étudiant
async function loadStudentStats(studentId) {
    try {
        const response = await fetch(`${API_BASE}/stats/student/${studentId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        
        if (data.success) {
            displayStudentStats(data.data);
        }
    } catch (error) {
        console.error('Erreur stats étudiant:', error);
    }
}

// Afficher stats étudiant
function displayStudentStats(stats) {
    const container = document.getElementById('student-stats');
    container.innerHTML = '';

    stats.by_subject.forEach(subject => {
        const card = document.createElement('div');
        card.className = `stat-card ${subject.state}`;
        card.innerHTML = `
            <h3>${subject.subject}</h3>
            <p>Absences : <strong>${subject.absence_count}</strong></p>
            <p>Heures : <strong>${subject.total_absence_hours}h</strong></p>
            <p>État : <strong class="state-${subject.state}">${getStateLabel(subject.state)}</strong></p>
            ${subject.participation_note !== null ? 
                `<p class="warning">Note participation : ${subject.participation_note}/20</p>` : ''}
        `;
        container.appendChild(card);
    });

    // Statut global
    document.getElementById('global-status').textContent = stats.status;
    document.getElementById('rachettage').textContent = stats.rachettage;
}

// Label état
function getStateLabel(state) {
    const labels = {
        'normal':    '✅ Normal',
        'warning_1': '⚠️ Avertissement 1',
        'warning_2': '🔴 Avertissement 2',
        'failed':    '❌ Échoué',
        'redoublant':'🚫 Redoublant'
    };
    return labels[state] || state;
}

// Récupérer alertes
async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE}/stats/alerts`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        
        if (data.success) {
            displayAlerts(data.data);
        }
    } catch (error) {
        console.error('Erreur alertes:', error);
    }
}

// Afficher alertes
function displayAlerts(alerts) {
    const container = document.getElementById('alerts-list');
    container.innerHTML = '';

    if (alerts.length === 0) {
        container.innerHTML = '<p>Aucune alerte pour le moment ✅</p>';
        return;
    }

    alerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-item alert-${alert.state}`;
        item.innerHTML = `
            <span class="student-name">${alert.student_name}</span>
            <span class="subject-name">${alert.subject_name}</span>
            <span class="absence-count">${alert.absence_count} absences</span>
            <span class="state-badge ${alert.state}">${getStateLabel(alert.state)}</span>
        `;
        container.appendChild(item);
    });
}

// Exporter les fonctions
export { loadGeneralStats, loadStudentStats, loadAlerts };