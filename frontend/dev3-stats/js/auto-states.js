// ============================================================
// ÉTATS AUTOMATIQUES - Règles métier HEM
// ============================================================

const API_BASE = 'http://localhost/gestion-absences/backend/api/index.php';

function getToken() {
    return localStorage.getItem('token');
}

// Récupérer et afficher les états de tous les étudiants
async function loadAllStates() {
    try {
        const response = await fetch(`${API_BASE}/stats/alerts`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        if (data.success) {
            displayStates(data.data);
            displayStatsSummary(data.data);
        }
    } catch (error) {
        console.error('Erreur états:', error);
    }
}

// Afficher les états
function displayStates(states) {
    const container = document.getElementById('states-container');
    container.innerHTML = '';

    if (states.length === 0) {
        container.innerHTML = `
            <div class="no-alerts">
                <p>✅ Aucun étudiant en situation critique</p>
            </div>`;
        return;
    }

    // Grouper par état
    const grouped = {
        redoublant: states.filter(s => s.state === 'redoublant'),
        failed:     states.filter(s => s.state === 'failed'),
        warning_2:  states.filter(s => s.state === 'warning_2'),
        warning_1:  states.filter(s => s.state === 'warning_1'),
    };

    // Afficher chaque groupe
    Object.entries(grouped).forEach(([state, students]) => {
        if (students.length === 0) return;

        const section = document.createElement('div');
        section.className = `state-section state-${state}`;
        section.innerHTML = `
            <h3 class="state-title">${getStateLabel(state)} (${students.length})</h3>
            <div class="state-rule">${getStateRule(state)}</div>
            <table class="states-table">
                <thead>
                    <tr>
                        <th>Étudiant</th>
                        <th>Matière</th>
                        <th>Absences</th>
                        <th>Heures</th>
                        <th>Note participation</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td>${s.student_name}</td>
                            <td>${s.subject_name}</td>
                            <td>${s.absence_count}</td>
                            <td>${s.total_absence_hours}h</td>
                            <td>${s.participation_note !== null ? 
                                s.participation_note + '/20' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.appendChild(section);
    });
}

// Résumé statistiques
function displayStatsSummary(states) {
    const summary = document.getElementById('states-summary');
    const counts = {
        redoublant: states.filter(s => s.state === 'redoublant').length,
        failed:     states.filter(s => s.state === 'failed').length,
        warning_2:  states.filter(s => s.state === 'warning_2').length,
        warning_1:  states.filter(s => s.state === 'warning_1').length,
    };

    summary.innerHTML = `
        <div class="summary-card redoublant">
            <span class="count">${counts.redoublant}</span>
            <span class="label">Redoublants</span>
        </div>
        <div class="summary-card failed">
            <span class="count">${counts.failed}</span>
            <span class="label">Échec</span>
        </div>
        <div class="summary-card warning_2">
            <span class="count">${counts.warning_2}</span>
            <span class="label">Avert. 2</span>
        </div>
        <div class="summary-card warning_1">
            <span class="count">${counts.warning_1}</span>
            <span class="label">Avert. 1</span>
        </div>
    `;
}

// Labels des états
function getStateLabel(state) {
    const labels = {
        'normal':    '✅ Normal',
        'warning_1': '⚠️ Avertissement 1',
        'warning_2': '🔴 Avertissement 2',
        'failed':    '❌ Échec',
        'redoublant':'🚫 Redoublant'
    };
    return labels[state] || state;
}

// Règles métier
function getStateRule(state) {
    const rules = {
        'warning_1': '3ème absence dans un cours à 3 crédits → Note participation 00/20',
        'warning_2': '6ème absence dans un cours à 3 crédits → Note moyenne 00/20',
        'failed':    '40 absences globales → Perte des 2 rachettages + mention',
        'redoublant':'72 absences globales → Redoublant automatique',
    };
    return rules[state] || '';
}

export { loadAllStates };