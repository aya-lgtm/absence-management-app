// ============================================================
// SUIVI DES ABSENCES - Historique et justifications
// ============================================================

const API_BASE = 'http://localhost/gestion-absences/backend/api/index.php';

function getToken() {
    return localStorage.getItem('token');
}

// Récupérer toutes les absences
async function loadAbsences(filters = {}) {
    try {
        let url = `${API_BASE}/absences`;
        const params = new URLSearchParams(filters);
        if (params.toString()) url += `?${params}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        if (data.success) {
            displayAbsences(data.data);
        }
    } catch (error) {
        console.error('Erreur absences:', error);
    }
}

// Afficher les absences
function displayAbsences(absences) {
    const tbody = document.getElementById('absences-tbody');
    tbody.innerHTML = '';

    if (absences.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Aucune absence trouvée</td></tr>';
        return;
    }

    absences.forEach(absence => {
        const tr = document.createElement('tr');
        tr.className = absence.is_absent ? 'absent-row' : 'delay-row';
        tr.innerHTML = `
            <td>${absence.student_name}</td>
            <td>${absence.subject_name}</td>
            <td>${formatDate(absence.session_date)}</td>
            <td>${absence.is_absent ? '❌ Absent' : `⏰ Retard ${absence.delay_minutes}min`}</td>
            <td>${absence.is_justified ? '✅ Justifiée' : '❌ Non justifiée'}</td>
            <td>
                ${!absence.is_justified ? 
                    `<button onclick="justifyAbsence(${absence.id})" class="btn-justify">
                        Justifier
                    </button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Justifier une absence
async function justifyAbsence(absenceId) {
    const justification = prompt('Entrez la justification :');
    if (!justification) return;

    try {
        const response = await fetch(`${API_BASE}/absences/${absenceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ justification })
        });
        const data = await response.json();

        if (data.success) {
            alert('Absence justifiée avec succès ✅');
            loadAbsences();
        }
    } catch (error) {
        console.error('Erreur justification:', error);
    }
}

// Filtrer par date
function filterByDate(date) {
    loadAbsences({ date });
}

// Filtrer par étudiant
function filterByStudent(studentId) {
    loadAbsences({ student_id: studentId });
}

// Formater date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

export { loadAbsences, justifyAbsence, filterByDate, filterByStudent };