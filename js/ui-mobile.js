// ==========================================
// CONTROL MÓVIL (ARQUITECTURA V20 - FILTRADO ABSOLUTO)
// ==========================================

window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) {};
window.showNotice = function(mensaje) {};
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {};

// Extracción directa de la matriz de datos
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

    // 1. FILTRADO TAXONÓMICO (ÁREAS)
    if (window.currentState && window.currentState.area) {
        tareasAProcesar = todasLasTareas.filter(t => t.area === window.currentState.area);
    } 
    // 2. FILTRADO TEMPORAL RIGUROSO
    else {
        const vista = window.currentState?.view || 'all';
        
        if (vista !== 'all') {
            // Cálculo de fechas exactas compensando la zona horaria local
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
                // Las vistas temporales excluyen por defecto lo completado
                if (t.completed) return false;
                
                // Escaneo multipropiedad para garantizar la captura de la fecha
                const fecha = t.date || t.dueDate || t.fecha || t.fechaVencimiento;

                if (vista === 'today') {
                    // Retiene tareas sin fecha, o aquellas vencidas/agendadas para hoy
                    return !fecha || fecha <= hoyStr;
                }
                if (vista === 'tomorrow') {
                    return fecha === mananaStr;
                }
                if (vista === 'week') {
                    return !fecha || fecha <= semanaStr;
                }
                return true;
            });
        }
    }
    
    if (!tareasAProcesar || tareasAProcesar.length === 0) {
        container.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-secondary); font-size: 15px;">No hay tareas para esta vista.</div>';
        return;
    }

    // Inyección de HTML acoplada a las clases CSS
    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-content">
                <div class="task-title">${task.name || task.text || 'Tarea sin título'}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    ${task.area ? `<span class="task-tag">${task.area}</span>` : ''} 
                    ${(task.date || task.dueDate || task.fecha) ? `<span style="font-size: 12px; color: var(--text-secondary);">📅 ${task.date || task.dueDate || task.fecha}</span>` : ''}
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')">
                ${task.completed ? '✓' : ''}
            </button>
        </div>
    `).join('');
};

window.addMobileTask = function() {
    const input = document.getElementById('mobileTaskInput');
    if (!input || !input.value.trim()) return;

    const newTask = {
        id: Date.now(),
        name: input.value.trim(),
        completed: false,
        // Asignación estricta de fecha para asegurar compatibilidad con filtros
        date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        area: window.currentState?.area || 'Inbox'
    };

    const listaGlobal = obtenerTareasGlobales();
    if (listaGlobal && Array.isArray(listaGlobal)) {
        listaGlobal.unshift(newTask);
        input.value = '';
        if (window.saveTasks) window.saveTasks();
        window.renderTasks();
    }
};

window.toggleMobileTask = function(id) {
    const listaGlobal = obtenerTareasGlobales();
    if (listaGlobal && Array.isArray(listaGlobal)) {
        const task = listaGlobal.find(t => t.id.toString() === id.toString());
        if (task) {
            task.completed = !task.completed;
            if (window.saveTasks) window.saveTasks();
            window.renderTasks();
        }
    }
};

window.toggleViewMenu = function() {
    const modal = document.getElementById('viewMenuModal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        window.buildViewMenu();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
};

window.buildViewMenu = function() {
    const container = document.getElementById('modalDynamicContent');
    if (!container) return;

    let html = '<h3 style="color: var(--accent-color); font-size: 14px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Tiempo</h3>';
    const timeViews = [
        { id: 'today', label: 'Hoy y atrasadas' },
        { id: 'tomorrow', label: 'Mañana' },
        { id: 'week', label: 'Esta semana' },
        { id: 'all', label: 'Todas las tareas' }
    ];
    timeViews.forEach(v => {
        html += `<button class="btn-menu-option" onclick="window.selectMobileView('${v.id}')">${v.label}</button>`;
    });

    const tareasParaEscanear = obtenerTareasGlobales();
    const areasUnicas = [...new Set(tareasParaEscanear.map(t => t.area).filter(a => a && a.trim() !== ''))];
    
    if (areasUnicas.length > 0) {
        html += '<h3 style="color: var(--accent-color); font-size: 14px; text-transform: uppercase; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Áreas</h3>';
        areasUnicas.forEach(area => {
            html += `<button class="btn-menu-option" onclick="window.filterByTaxonomy('area', '${area}')">${area}</button>`;
        });
    }
    container.innerHTML = html;
};

window.selectMobileView = function(viewType) {
    window.currentState = window.currentState || {};
    window.currentState.view = viewType;
    delete window.currentState.area;
    window.renderTasks();
    window.toggleViewMenu();
};

window.filterByTaxonomy = function(type, value) {
    window.currentState = window.currentState || {};
    window.currentState.view = 'all'; 
    window.currentState[type] = value; 
    window.renderTasks();
    window.toggleViewMenu();
};

window.toggleSettingsMenu = function() {
    window.toggleTheme();
};

window.toggleTheme = function() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('mobileTheme', isLight ? 'light' : 'dark');
    const metaTheme = document.getElementById('themeColorMeta');
    if (metaTheme) metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#0f172a');
};

// Monitor reactivo de estado
setInterval(() => {
    const tareasActuales = obtenerTareasGlobales();
    if (tareasActuales.length !== ultimoLargoTareas) {
        window.renderTasks();
    }
}, 1000);
