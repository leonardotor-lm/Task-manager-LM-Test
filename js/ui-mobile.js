// js/ui-mobile.js
// Capa de presentación exclusiva para el MVP móvil

// STUBS: Contención para funciones de escritorio
window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) { console.log("Sincronización móvil:", status); };
window.showNotice = function(mensaje) { console.log("Notificación móvil:", mensaje); };
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {}; // Stub protector para el toggle

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

    // 1. Procesamiento de la estructura según el estado
    const processedTree = window.pruneTree(tasks, window.currentState, window.currentFilters);
    
    // 2. Aplanamiento topológico para la vista móvil (MVP)
    const viewList = window.flattenMatches(processedTree);

    if (viewList.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">No hay tareas para esta vista.</div>';
        return;
    }

    let htmlMarkup = '';
    
    // 3. Renderizado de las tareas procesadas con interactividad
    viewList.forEach(task => {
        const subCount = task._subCount !== undefined ? task._subCount : 0;
        const subTag = subCount > 0 ? ` <span style="color: #F88D5D; font-weight: 600;">[+${subCount} sub.]</span>` : '';
        
        // Determinamos el aspecto del botón según el estado actual
        const isCompleted = task.status === 'completed';
        const btnText = isCompleted ? 'Deshacer' : 'Completar';
        const btnColor = isCompleted ? '#4A5B6D' : '#F6723A';

        htmlMarkup += `
        <div style="background-color: #1D313C; margin-bottom: 8px; padding: 12px; border-radius: 6px; border-left: 4px solid ${isCompleted ? '#4A5B6D' : '#F6723A'}; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: 600; font-size: 16px; color: ${isCompleted ? '#8A9DB5' : '#f8fafc'}; text-decoration: ${isCompleted ? 'line-through' : 'none'};">${task.name}</div>
                <div style="font-size: 12px; color: #8A9DB5; margin-top: 6px;">
                    Área: ${task.area || 'Inbox'} | Estado: ${task.status}${subTag}
                </div>
            </div>
            <button onclick="window.toggleTaskUniversal(${task.id})" style="background-color: ${btnColor}; color: #0A1318; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                ${btnText}
            </button>
        </div>`;
    });

    // Esta era la asignación final que faltaba en la sintaxis rota
    container.innerHTML = htmlMarkup;
};
