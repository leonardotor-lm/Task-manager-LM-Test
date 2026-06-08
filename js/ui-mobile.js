// ==========================================
// CONTROL DE INTERFAZ MÓVIL (ARQUITECTURA V9)
// ==========================================

// Buscador defensivo de la base de datos global de tareas
function obtenerTareasGlobales() {
    return window.allTasks || window.tasks || [];
}

window.updateUI = function() { 
    if (!window.currentState) window.currentState = {};
    if (!window.currentState.view) window.currentState.view = 'today';
    window.renderTasks(); 
};

window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    let tareas A Procesar = [];

    // Si existe el motor de filtrado de engine.js, lo usamos como base
    if (window.getFilteredTasks) {
        tareasAProcesar = window.getFilteredTasks();
    } else {
        tareasAProcesar = obtenerTareasGlobales();
    }
    
    // Si el usuario seleccionó un Área específica en el modal móvil,
    // forzamos el filtrado taxonómico de forma manual y directa
    if (window.currentState && window.currentState.area) {
        tareasAProcesar = obtenerTareasGlobales().filter(t => t.area === window.currentState.area);
    }
    
    if (!tareasAProcesar || tareasAProcesar.length === 0) {
        container.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-secondary); font-size: 15px;">No hay tareas para esta vista.</div>`;
        return;
    }

    container.innerHTML = tareasAProcesar.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background-color: var(--bg-secondary); border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color);">
            <div style="flex: 1; min-width: 0; padding-right: 12px;">
                <div style="font-weight: 500; margin-bottom: 6px; font-size: 16px; ${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.text}</div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                    ${task.area ? `<span class="tag" style="background-color: var(--border-color); padding: 2px 8px; border-radius: 4px; font-weight: 500;">${task.area}</span>` : ''} 
                    ${task.date ? `<span>📅 ${task.date}</span>` : ''}
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${task.completed ? 'var(--accent-color)' : 'var(--text-secondary)'}; background: ${task.completed ? 'var(--accent-color)' : 'none'}; color: #0f172a; font-weight: bold; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                ${task.completed ? '✓' : ''}
            </button>
        </div>
    `).join('');
};

// ACCIONES SOBRE TAREAS
window.addMobileTask = function() {
    const input = document.getElementById('mobileTaskInput');
    if (!input || !input.value.trim()) return;

    const newTask = {
        id: Date.now().toString(),
        text: input.value.trim(),
        completed: false,
        date: new Date().toISOString().split('T')[0],
        area: window.currentState?.area || ''
    };

    const listaGlobal = window.allTasks || window.tasks;
    if (listaGlobal) {
        listaGlobal.push(newTask);
        input.value = '';
        if (window.saveTasks) window.saveTasks();
        window.renderTasks();
    }
};

window.toggleMobileTask = function(id) {
    const listaGlobal = window.allTasks || window.tasks;
    if (listaGlobal) {
        const task = listaGlobal.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (window.saveTasks) window.saveTasks();
            window.renderTasks();
        }
    }
};

// INTERFAZ DINÁMICA DEL MODAL DE VISTAS Y ÁREAS
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

    // 1. Inyección de Vistas Temporales
    let html = `<h3 class="menu-section-title">Tiempo</h3>`;
    const timeViews = [
        { id: 'today', label: 'Hoy y atrasadas' },
        { id: 'tomorrow', label: 'Mañana' },
        { id: 'week', label: 'Esta semana' },
        { id: 'all', label: 'Todas las tareas' }
    ];
    timeViews.forEach(v => {
        html += `<button class="btn-menu-option" onclick="window.selectMobileView('${v.id}')">${v.label}</button>`;
    });

    // 2. Extracción Dinámica de Áreas (Personal, Casa, Docencia, etc.)
    const tareasParaEscanear = obtenerTareasGlobales();
    const areasUnicas = [...new Set(tareasParaEscanear.map(t => t.area).filter(a => a && a.trim() !== ''))];
    
    if (areasUnicas.length > 0) {
        html += `<h3 class="menu-section-title">Áreas Disponibles</h3>`;
        areasUnicas.forEach(area => {
            html += `<button class="btn-menu-option" onclick="window.filterByTaxonomy('area', '${area}')">${area}</button>`;
        });
    }
    container.innerHTML = html;
};

window.selectMobileView = function(viewType) {
    window.currentState = window.currentState || {};
    window.currentState.view = viewType;
    delete window.currentState.area; // Desactiva el filtro de área al volver al tiempo
    window.renderTasks();
    window.toggleViewMenu();
};

window.filterByTaxonomy = function(type, value) {
    window.currentState = window.currentState || {};
    window.currentState.view = 'all'; // Forzamos vista completa para que no recorte por fecha
    window.currentState[type] = value; // Setea el área activa (ej: currentState.area = 'Docencia')
    window.renderTasks();
    window.toggleViewMenu();
};

// ACCIÓN DE AJUSTES (VÍA TRANSITORIA)
window.toggleSettingsMenu = function() {
    // Para resolver el botón muerto de forma inmediata y elegante,
    // vinculamos este comando al interruptor alternador de temas.
    window.toggleTheme();
};

window.toggleTheme = function() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('mobileTheme', isLight ? 'light' : 'dark');
    const metaTheme = document.getElementById('themeColorMeta');
    if (metaTheme) metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#0f172a');
};
