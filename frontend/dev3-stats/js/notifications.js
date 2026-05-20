// ============================================================
// NOTIFICATIONS - Alertes automatiques
// ============================================================

const API_BASE = 'http://localhost/gestion-absences/backend/api/index.php';

function getToken() {
    return localStorage.getItem('token');
}

// Charger toutes les notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/stats/alerts`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();

        if (data.success) {
            displayNotifications(data.data);
            updateNotificationBadge(data.data.length);
        }
    } catch (error) {
        console.error('Erreur notifications:', error);
    }
}

// Afficher les notifications
function displayNotifications(alerts) {
    const container = document.getElementById('notifications-list');
    container.innerHTML = '';

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="notification-empty">
                <p>✅ Aucune notification</p>
            </div>`;
        return;
    }

    alerts.forEach(alert => {
        const notif = document.createElement('div');
        notif.className = `notification notification-${alert.state}`;
        notif.innerHTML = `
            <div class="notif-icon">${getStateIcon(alert.state)}</div>
            <div class="notif-content">
                <p class="notif-title">
                    <strong>${alert.student_name}</strong> — ${alert.subject_name}
                </p>
                <p class="notif-message">${getNotifMessage(alert)}</p>
                <p class="notif-time">
                    ${alert.absence_count} absences • ${alert.total_absence_hours}h
                </p>
            </div>
            <div class="notif-badge ${alert.state}">
                ${getStateLabel(alert.state)}
            </div>
        `;
        container.appendChild(notif);
    });
}

// Message de notification
function getNotifMessage(alert) {
    const messages = {
        'warning_1': `A atteint la 3ème absence → Note participation 00/20`,
        'warning_2': `A atteint la 6ème absence → Note moyenne 00/20`,
        'failed':    `A dépassé 40 absences → Perte des rachettages et mention`,
        'redoublant':`A dépassé 72 absences → Déclaré redoublant automatiquement`,
    };
    return messages[alert.state] || 'Situation à surveiller';
}

// Icône selon état
function getStateIcon(state) {
    const icons = {
        'warning_1': '⚠️',
        'warning_2': '🔴',
        'failed':    '❌',
        'redoublant':'🚫',
    };
    return icons[state] || '📢';
}

// Label état
function getStateLabel(state) {
    const labels = {
        'warning_1': 'Avert. 1',
        'warning_2': 'Avert. 2',
        'failed':    'Échec',
        'redoublant':'Redoublant',
    };
    return labels[state] || state;
}

// Mettre à jour le badge de notifications
function updateNotificationBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
}

// Marquer toutes comme lues
function markAllAsRead() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(n => n.classList.add('read'));
    updateNotificationBadge(0);
}

export { loadNotifications, markAllAsRead };