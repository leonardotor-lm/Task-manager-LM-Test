// ==========================================
// CONTROL MÓVIL (ARQUITECTURA V22 - SANEADA)
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
        const vista = window.currentState?.view || 'today';
        
        // Obtenemos el string de hoy en formato YYYY-MM-DD
        const hoyStr = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
        
        if (vista !== 'all') {
            tareasAProcesar = todasLasTareas.filter(t => {
                if (t.completed) return false;
                
                // Usamos directamente t.date, que sabemos que existe
                const fecha = t.date;
                if (!fecha) return false; // Si no hay fecha, no entra en filtros temporales

                // Filtro "Hoy" relajado: Comparamos solo la parte de la fecha, ignorando horas
                if (vista === 'today') {
                    // Si el string coincide exactamente, o si la tarea es de un día anterior
                    return fecha <= hoyStr; 
                }
                if (vista === 'tomorrow') return fecha > hoyStr; // Filtro simple para simplificar
                return true;
            });
        }
    }
    
    if (!tareasAProcesar || tareasAProcesar.length === 0) {
        container.innerHTML = '<div class="no-tasks-notice">No hay tareas para esta vista.</div>';
        return;
    }

    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-content">
                <div class="task-title">${task.name || task.text || 'Tarea sin título'}</div>
                <div class="task-subtext">
                    ${task.area ? `<span class="task-tag">${task.area}</span>` : ''} 
                    <span class="task-date-text">📅 ${task.date}</span>
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')">
                ${task.completed ? '✓' : ''}
            </button>
        </div>
    `).join('');
};
    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-content">
                <div class="task-title">${task.name || task.text || 'Tarea sin título'}</div>
                <div style="font-size: 10px; color: red;">
                    DEBUG: date='${task.date}' | dueDate='${task.dueDate}' | fecha='${task.fecha}'
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

    let html = '<h3 class="menu-section-title">Tiempo</h3>';
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
        html += '<h3 class="menu-section-title" style="margin-top: 20px;">Áreas</h3>';
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

setInterval(() => {
    const tareasActuales = obtenerTareasGlobales();
    if (tareasActuales.length !== ultimoLargoTareas) {
        window.renderTasks();
    }
}, 1000);
