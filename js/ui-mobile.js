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

// RENDERIZADO MVP: Filtrado dinámico a través del motor lógico
window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    if (typeof tasks === 'undefined' || !Array.isArray(tasks) || tasks.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">No hay tareas en el sistema.</div>';
        return;
    }

    // 1. Procesamiento de la estructura según el estado (ej. view: 'today')
    const processedTree = window.pruneTree(tasks, window.currentState, window.currentFilters);
    
    // 2. Aplanamiento topológico para la vista móvil (MVP)
    const viewList = window.flattenMatches(processedTree);

    if (viewList.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">No hay tareas para esta vista.</div>';
        return;
    }

    let htmlMarkup = '';
    
    // 3. Renderizado de las tareas procesadas
    viewList.forEach(task => {
        const subCount = task._subCount !== undefined ? task._subCount : 0;
        const subTag = subCount > 0 ? ` <span style="color: #F88D5D; font-weight: 600;">[+${subCount} sub.]</span>` : '';

        htmlMarkup += `
        <div style="background-color: #1D313C; margin-bottom: 8px; padding: 12px; border-radius: 6px; border-left: 4px solid #F6723A;">
            <div style="font-weight: 600; font-size: 16px; color: #f8fafc;">${task.name}</div>
            <div style="font-size: 12px; color: #8A9DB5; margin-top: 6px;">
                Área: ${task.area || 'Inbox'} | Estado: ${task.status}${subTag}
            </div>
        </div>`;
    });

    container.innerHTML = htmlMarkup;
};
