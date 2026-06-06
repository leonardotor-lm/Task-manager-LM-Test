// js/ui-mobile.js
// Capa de presentación exclusiva para el MVP móvil

window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) { console.log("Sincronización:", status); };
window.showNotice = function(mensaje) { console.log("Notificación:", mensaje); };
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {}; 

window.updateUI = function() { 
    window.renderTasks(); 
};

window.changeMobileView = function(viewName) {
    if (!window.currentState) window.currentState = {};
    window.currentState.view = viewName;
    window.renderTasks();
};

window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    if (typeof tasks === 'undefined' || !Array.isArray(tasks) || tasks.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">No hay tareas.</div>';
        return;
    }

    const processedTree = window.pruneTree(tasks, window.currentState, window.currentFilters);
    const viewList = window.flattenMatches(processedTree);

    if (viewList.length === 0) {
        container.innerHTML = '<div style="padding: 16px; color: #8A9DB5; text-align: center;">Vista vacía.</div>';
        return;
    }

    let htmlMarkup = '';
    
    viewList.forEach(task => {
        const subCount = task._subCount !== undefined ? task._subCount : 0;
        const subTag = subCount > 0 ? ` <span style="color: #F88D5D; font-weight: 600;">[+${subCount} sub.]</span>` : '';
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

    container.innerHTML = htmlMarkup;
};
