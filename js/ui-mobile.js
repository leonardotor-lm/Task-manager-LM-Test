// ==========================================
// CONTROL MÓVIL (SINTAXIS BLINDADA)
// ==========================================

window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) {};
window.showNotice = function(mensaje) {};
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {};

function obtenerTareasGlobales() {
    if (typeof tasks !== 'undefined') return tasks;
    if (typeof allTasks !== 'undefined') return allTasks;
    return [];
}

let ultimoLargoTareas = -1;

window.updateUI = function() { 
    if (!window.currentState) window.currentState = {};
    if (!window.currentState.view) window.currentState.view = 'today'; 
    window.renderTasks(); 
};

window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    let todasLasTareas = obtenerTareasGlobales();
    let tareasAProcesar = todasLasTareas;

    ultimoLargoTareas = todasLasTareas.length;

    if (window.currentState && window.currentState.area) {
        tareasAProcesar = todasLasTareas.filter(t => t.area === window.currentState.area);
    } else {
        const vista = window.currentState?.view || 'all';
        
        if (vista !== 'all') {
            const hoy = new Date();
            hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
            const hoyStr = hoy.toISOString().split('T')[0];

            let manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            const mananaStr = manana.toISOString().split('T')[0];

            let semana = new Date(hoy);
            semana.setDate(semana.getDate() + 7);
            const semanaStr = semana.toISOString().split('T')[0];

            tareasAProcesar = todasLasTareas.filter(t => {
                if (t.completed) return false;
                
                const fecha = t.date || t.dueDate || t.fecha || t.fechaVencimiento;
                
                // Muro de contención: si no hay fecha, se excluye de vistas temporales
                if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') return false;

                if (vista === 'today') {
                    // Evaluación alfabética estricta: "2026-06-08" <= "2026-06-09" -> true
                    return fecha <= hoyStr;
                }
                if (vista === 'tomorrow') {
                    return fecha === mananaStr;
                }
                if (vista === 'week') {
                    return fecha >= hoyStr && fecha <= semanaStr;
                }
                return true;
            });
        }
    }
    
    if (!tareasAProcesar || tareasAProcesar.length === 0) {
        container.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-secondary); font-size: 15px;">No hay tareas para esta vista.</div>';
        return;
    }

    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div class="task-content" style="flex: 1; min-width: 0;">
                <div class="task-title" style="font-size: 15px; font-weight: 500; color: var(--text-main); line-height: 1.4; ${task.completed ? 'text-decoration: line-through;' : ''}">${task.name || task.text || 'Tarea sin título'}</div>
                <div class="task-subtext" style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                    ${task.area ? `<span class="task-tag" style="background-color: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 11px;">${task.area}</span>` : ''} 
                    <span class="task-date-text" style="font-size: 11px; color: var(--text-secondary);">📅 ${task.date || task.dueDate || task.fecha}</span>
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')" style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--text-secondary); background: ${task.completed ? 'var(--accent-color)' : 'transparent'}; color: ${task.completed ? '#0f172a' : 'var(--text-main)'}; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;">
                ${task.completed ? '✓' : ''}
            </button>
        </div>
    `).join('');
};

window.addMobileTask = function() {
    const input = document.getElementById('mobileTaskInput');
    if (!input || !input.value.trim()) return;

    const hoyLocal = new Date();
    hoyLocal.setMinutes(hoyLocal.getMinutes() - hoyLocal.getTimezoneOffset());
    
    const newTask = {
        id: Date.now(),
        name: input.value.trim(),
        completed: false,
        date: hoyLocal.toISOString().split('T')[0],
        area: window.currentState?.area || 'Inbox'
    };

    const listaGlobal = obtenerTareasGlobales();
    if (listaGlobal && Array.isArray(listaGlobal)) {
        listaGlobal
