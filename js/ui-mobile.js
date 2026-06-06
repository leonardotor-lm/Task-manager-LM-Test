// js/ui-mobile.js
// Capa de presentación exclusiva para el MVP móvil

// STUBS: Contención para funciones de escritorio
window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) { console.log("Sincronización móvil:", status); };
window.showNotice = function(mensaje) { console.log("Notificación móvil:", mensaje); };
window.refreshAllDropdowns = function() {};

// Interceptamos la orden de actualización del controlador
window.updateUI = function() { 
    window.renderTasks(); 
};

// RENDERIZADO MVP: Iteración plana sobre la raíz del modelo de datos
window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    if (typeof tasks === 'undefined' || !Array.isArray(tasks) || tasks.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">No hay tareas disponibles.</div>';
        return;
    }

    let htmlMarkup = '';
    
    // Iteramos sobre las tareas crudas en memoria (sin filtros temporales aún)
    tasks.forEach(task => {
        if (!task.isDeleted) {
            htmlMarkup += `
            <div style="background-color: #1D313C; margin-bottom: 8px; padding: 12px; border-radius: 6px; border-left: 4px solid #F6723A;">
                <div style="font-weight: 600; font-size: 16px; color: #f8fafc;">${task.name}</div>
                <div style="font-size: 12px; color: #8A9DB5; margin-top: 6px;">Área: ${task.area || 'Inbox'} | Estado: ${task.status}</div>
            </div>`;
        }
    });

    container.innerHTML = htmlMarkup;
};
