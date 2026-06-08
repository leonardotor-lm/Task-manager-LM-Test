// 1. STUBS: Neutralización de dependencias de escritorio
window.initSpeechRecognition = function() {};
window.updateDateDisplay = function() {};
window.showSyncStatus = function(status) { console.log("Sincronización:", status); };
window.showNotice = function(mensaje) { console.log("Notificación:", mensaje); };
window.refreshAllDropdowns = function() {};
window.renderCalendar = function() {};

// 2. MOTOR DE INTERFAZ MÓVIL
window.updateUI = function() { 
    if (!window.currentState) window.currentState = {};
    if (!window.currentState.view) window.currentState.view = 'today';
    window.renderTasks(); 
};

window.renderTasks = function() {
    const container = document.getElementById('mobileTaskList');
    if (!container) return;

    // Obtenemos tareas procesadas por el motor de engine.js
    const tasks = window.getFilteredTasks ? window.getFilteredTasks() : [];
    
    if (tasks.length === 0) {
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No hay tareas para esta vista.</div>`;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div style="flex: 1;">
                <div style="font-weight: 500; margin-bottom: 4px;">${task.text}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${task.area ? `<span class="tag">${task.area}</span>` : ''} 
                    ${task.date || ''}
                </div>
            </div>
            <button class="btn-check" onclick="window.toggleMobileTask('${task.id}')">
                ${task.completed ? '✓' : ''}
            </button>
        </div>
    `).join('');
};

// 3. ACCIONES DE TAREAS
window.addMobileTask = function() {
    const input = document.getElementById('mobileTaskInput');
    if (!input || !input.value.trim()) return;

    const newTask = {
        id: Date.now().toString(),
        text: input.value.trim(),
        completed: false,
        date: new Date().toISOString().split('T')[0],
        area: window.currentState.area || ''
    };

    if (window.allTasks) {
        window.allTasks.push(newTask);
        input.value = '';
        if (window.saveTasks) window.saveTasks();
        window.renderTasks();
    }
};

window.toggleMobileTask = function(id) {
    const task = window.allTasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (window.saveTasks) window.saveTasks();
        window.renderTasks();
    }
};

// 4. CONTROL DE TEMAS Y BARRA NATIVA
window.toggleTheme = function() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('mobileTheme', isLight ? 'light' : 'dark');
    const metaTheme = document.getElementById('themeColorMeta');
    if (metaTheme) metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#0f172a');
};

// 5. NAVEGACIÓN DINÁMICA (VISTAS Y ÁREAS)
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

    // Extraer áreas de las tareas cargadas
    const areas = [...new Set((window.allTasks || []).map(t => t.area).filter(a => a && a.trim() !== ''))];
    
    if (areas.length > 0) {
        html += `<h3 class="menu-section-title">Áreas</h3>`;
        areas.forEach(area => {
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
