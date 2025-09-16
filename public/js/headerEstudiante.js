const socket = io();
const notificationIcon = document.querySelector('.notification-icon');
const notificationBadge = document.getElementById('notification-badge');
const notificationDropdown = document.getElementById('notification-dropdown');

// Obtener el userId del data attribute
const userSection = document.querySelector('.user-section');
const userId = userSection ? userSection.getAttribute('data-user-id') : null;

if (userId) {
    console.log('Conectando usuario:', userId);
    socket.emit('user_connected', userId);
} else {
    console.error('No se pudo obtener el ID del usuario');
}

// Escuchar nuevas notificaciones
socket.on('new_notification', function(notification) {
    // Actualizar el badge de notificaciones
    updateNotificationBadge();
    
    // Mostrar notificación toast (opcional)
    showToast(notification.mensaje);
    
    // Si el panel está abierto, agregar la nueva notificación
    if (notificationDropdown.style.display === 'block') {
        loadNotifications();
    }
    
    // Opcional: hacer parpadear el ícono
    notificationIcon.style.animation = 'pulse 0.5s ease-in-out 3';
});

function updateNotificationBadge() {
    // Obtener el conteo actual de notificaciones no leídas
    fetch('/estudiante/notificaciones/count')
        .then(response => response.json())
        .then(data => {
            if (data.count > 0) {
                notificationBadge.textContent = data.count;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        })
        .catch(console.error);
}

function showToast(mensaje) {
    // Crear un toast simple
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    // Remover el toast después de 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Toggle del panel de notificaciones
notificationIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    
    if (notificationDropdown.style.display === 'block') {
        closeNotificationPanel();
    } else {
        openNotificationPanel();
    }
});

function openNotificationPanel() {
    notificationDropdown.style.display = 'block';
    
    // Marcar todas las notificaciones como leídas
    markAllAsRead();
    
    // Cargar las notificaciones
    loadNotifications();
}

function closeNotificationPanel() {
    notificationDropdown.style.display = 'none';
}

function markAllAsRead() {
    fetch('/estudiante/notificaciones/mark-all-read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Ocultar el badge
            notificationBadge.style.display = 'none';
        }
    })
    .catch(console.error);
}

function loadNotifications() {
    fetch('/estudiante/notificaciones/list')
        .then(response => response.json())
        .then(data => {
            displayNotifications(data.notificaciones || []);
        })
        .catch(console.error);
}

function displayNotifications(notificaciones) {
    const notificationList = document.getElementById('notification-list');
    
    if (notificaciones.length === 0) {
        notificationList.innerHTML = `
            <div class="no-notifications">
                <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: #cbd5e1; margin-bottom: 12px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }
    
    notificationList.innerHTML = notificaciones.map(notificacion => `
        <div class="notification-item ${!notificacion.leido ? 'unread' : ''}">
            <div class="notification-content">
                <div class="notification-message">${notificacion.mensaje}</div>
                <div class="notification-time">${formatTime(notificacion.fechaCreacion)}</div>
            </div>
            <button class="delete-notification" onclick="deleteNotification('${notificacion._id}')">
                ×
            </button>
        </div>
    `).join('');
}

function deleteNotification(notificationId) {
    fetch(`/estudiante/notificaciones/${notificationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Recargar las notificaciones
            loadNotifications();
            // Actualizar el badge
            updateNotificationBadge();
        }
    })
    .catch(console.error);
}

function clearAllNotifications() {
    fetch('/estudiante/notificaciones/clear-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadNotifications();
            updateNotificationBadge();
        }
    })
    .catch(console.error);
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
}

// Cerrar el panel al hacer click fuera
document.addEventListener('click', function(e) {
    if (!notificationIcon.contains(e.target) && !notificationDropdown.contains(e.target)) {
        closeNotificationPanel();
    }
});

// CSS para las animaciones (agregar al head)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Cargar el conteo inicial de notificaciones
updateNotificationBadge();