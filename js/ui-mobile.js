// ==========================================
// CONTROL MÓVIL (ARQUITECTURA V18 - ESCOPO GLOBAL DIRECTO)
// ==========================================

window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) {};
window.showNotice = function(mensaje) {};
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {};

// Extracción directa: sin el prefijo 'window.'
function obtenerTareasGlobales() {
    if (typeof tasks !== 'undefined') return tasks;
    if (typeof allTasks !== 'undefined') return allTasks;
    return [];
}

let ultimoLargoTareas = -1;

window.updateUI = function() { 
    if (!window.currentState) window.currentState = {};
    if (!window.currentState.view) window.currentState.view = 'all'; 
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
        if (vista === 'today' || vista === 'tomorrow' || vista === 'week') {
            tareasAProcesar = todasLasTareas.filter(t => !t.completed);
        }
    }
    
    if (!tareasAProcesar || tareasAProcesar.length === 0) {
        container.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-secondary); font-size: 15px;">No hay tareas para esta vista.</div>';
        return;
    }

    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background-color: var(--bg-secondary); border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color);">
            <div style="flex: 1; min-width: 0; padding-right: 12px;">
                <div style="font-weight: 500; margin-bottom: 6px; font-size: 16px; ${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.name || task.text || 'Tarea sin título'}</div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                    ${task.area ? `<span class="tag" style="background-color: var(--border-color); padding: 2px 8px; border-radius: 4px; font-weight: 500;">${task.area}</span>` : ''} 
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${task.completed ? 'var(--accent-color)' : 'var(--text-secondary)'}; background: ${task.completed ? 'var(--accent-color)' : 'none'}; color: #0f172a; font-weight: bold; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
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

    let html = '<h3 class="menu-section-title" style="color: var(--accent-color); font-size: 14px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Tiempo</h3>';
    const timeViews = [
        { id: 'today', label: 'Hoy y atrasadas' },
        { id: 'tomorrow', label: 'Mañana' },
        { id: 'week', label: 'Esta semana' },
        { id: 'all', label: 'Todas las tareas' }
    ];
    timeViews.forEach(v => {
        html += `<button class="btn-menu-option" onclick="window.selectMobileView('${v.id}')" style="background-color: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; font-size: 16px; text-align: left; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; margin-bottom: 8px;">${v.label}</button>`;
    });

    const tareasParaEscanear = obtenerTareasGlobales();
    const areasUnicas = [...new Set(tareasParaEscanear.map(t => t.area).filter(a => a && a.trim() !== ''))];
    
    if (areasUnicas.length > 0) {
        html += '<h3 class="menu-section-title" style="color: var(--accent-color); font-size: 14px; text-transform: uppercase; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">Áreas</h3>';
        areasUnicas.forEach(area => {
            html += `<button class="btn-menu-option" onclick="window.filterByTaxonomy('area', '${area}')" style="background-color: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; font-size: 16px; text-align: left; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; margin-bottom: 8px;">${area}</button>`;
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

setInterval(() => {
    const tareasActuales = obtenerTareasGlobales();
    if (tareasActuales.length !== ultimoLargoTareas) {
        window.renderTasks();
    }
}, 1000);
