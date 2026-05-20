// ============================================================
// AVANCEMENT DE FORMATION - Suivi du syllabus
// ============================================================

const API_BASE = 'http://localhost/gestion-absences/backend/api/index.php';

function getToken() {
    return localStorage.getItem('token');
}

// Charger l'avancement par matière
async function loadTrainingProgress() {
    try {
        const response = await fetch(`${API_BASE}/sessions`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        if (data.success) {
            displayProgress(data.data);
        }
    } catch (error) {
        console.error('Erreur avancement:', error);
    }
}

// Afficher l'avancement
function displayProgress(sessions) {
    const container = document.getElementById('progress-container');
    container.innerHTML = '';

    // Grouper les séances par matière
    const bySubject = {};
    sessions.forEach(session => {
        if (!bySubject[session.subject_name]) {
            bySubject[session.subject_name] = {
                total: 0,
                done: 0,
                sessions: []
            };
        }
        bySubject[session.subject_name].total++;
        if (session.is_call_done) {
            bySubject[session.subject_name].done++;
        }
        bySubject[session.subject_name].sessions.push(session);
    });

    // Afficher chaque matière
    Object.entries(bySubject).forEach(([subject, info]) => {
        const percentage = info.total > 0 ?
            Math.round((info.done / info.total) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'progress-card';
        card.innerHTML = `
            <div class="progress-header">
                <h3>${subject}</h3>
                <span class="progress-percent">${percentage}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%">
                </div>
            </div>
            <div class="progress-details">
                <span>${info.done} séances effectuées</span>
                <span>${info.total} séances totales</span>
            </div>
            <button onclick="toggleSessions('${subject}')" class="btn-toggle">
                Voir les séances
            </button>
            <div id="sessions-${subject.replace(/\s/g, '_')}" 
                 class="sessions-list" style="display:none">
                ${info.sessions.map(s => `
                    <div class="session-item ${s.is_call_done ? 'done' : 'pending'}">
                        <span>${formatDate(s.session_date)}</span>
                        <span>${s.start_time} - ${s.end_time}</span>
                        <span>${s.professor_name}</span>
                        <span>${s.is_call_done ? '✅ Appel fait' : '⏳ En attente'}</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(card);
    });

    // Afficher résumé global
    displayGlobalProgress(bySubject);
}

// Résumé global
function displayGlobalProgress(bySubject) {
    const summary = document.getElementById('global-progress');
    if (!summary) return;

    const totalSubjects  = Object.keys(bySubject).length;
    const totalSessions  = Object.values(bySubject).reduce((a, b) => a + b.total, 0);
    const doneSessions   = Object.values(bySubject).reduce((a, b) => a + b.done, 0);
    const globalPercent  = totalSessions > 0 ?
        Math.round((doneSessions / totalSessions) * 100) : 0;

    summary.innerHTML = `
        <div class="global-card">
            <h3>Avancement Global</h3>
            <div class="global-stats">
                <div class="stat">
                    <span class="stat-value">${totalSubjects}</span>
                    <span class="stat-label">Matières</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${doneSessions}/${totalSessions}</span>
                    <span class="stat-label">Séances effectuées</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${globalPercent}%</span>
                    <span class="stat-label">Avancement</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar global" style="width: ${globalPercent}%"></div>
            </div>
        </div>
    `;
}

// Afficher/cacher les séances
function toggleSessions(subject) {
    const id = `sessions-${subject.replace(/\s/g, '_')}`;
    const el = document.getElementById(id);
    if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
}

// Formater date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

export { loadTrainingProgress };