// ==========================================
// CONTROL MÓVIL (V28 - SINTAXIS BLINDADA)
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

    // Renderizado dinámico de Cabecera independiente
    const headerContainer = document.getElementById('mobile-header-dynamic');
    if (headerContainer) {
        const titulosVistas = { 'today': 'Hoy y atrasadas', 'tomorrow': 'Mañana', 'week': 'Esta semana', 'all': 'Todas las tareas' };
        const vistaActual = window.currentState?.view || 'today';
        const tituloMostrado = titulosVistas[vistaActual] || vistaActual;
        const fechaTexto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
        
        headerContainer.innerHTML = `
            <div style="padding: 24px 16px 16px 16px; background: var(--bg-main);">
                <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0; color: var(--text-main);">${tituloMostrado}</h1>
                <p style="font-size: 10px; font-weight: 700; color: #4ade80; margin: 0; letter-spacing: 1px;">${fechaTexto}</p>
            </div>
        `;
    }

    let todasLasTareas = obtenerTareasGlobales();
    
    // FILTRO GLOBAL DE SEGURIDAD: Esto descarta basura y completadas de una vez
    // Ahora, cualquier filtro posterior operará sobre tareas "limpias"
    let todasLasTareasActivas = todasLasTareas.filter(t => !t.isDeleted && !t.completed && t.status !== 'completed');

    let tareasAProcesar = todasLasTareasActivas;
    ultimoLargoTareas = todasLasTareasActivas.length;

    if (window.currentState && window.currentState.area) {
        // Filtrar solo por área sobre el conjunto ya limpio
        tareasAProcesar = todasLasTareasActivas.filter(t => t.area === window.currentState.area);
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

            tareasAProcesar = todasLasTareasActivas.filter(t => {
                const fecha = t.date || t.dueDate || t.fecha || t.fechaVencimiento;
                if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') return false;

                if (vista === 'today') return fecha <= hoyStr;
                if (vista === 'tomorrow') return fecha === mananaStr;
                if (vista === 'week') return fecha >= hoyStr && fecha <= semanaStr;
                return true;
            });
        }
    }
    
    container.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-secondary);">No hay tareas para esta vista.</div>';
        return;
    }

    // 1. Construcción dinámica de la cabecera
    const titulosVistas = {
        'today': 'Hoy y atrasadas',
        'tomorrow': 'Mañana',
        'week': 'Esta semana',
        'all': 'Todas las tareas'
    };
    const vistaActual = window.currentState?.view || 'today';
    const tituloMostrado = titulosVistas[vistaActual] || vistaActual;
    
    // Genera la fecha actual en formato: "Martes, 9 de junio"
    const fechaOpciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const fechaTexto = new Date().toLocaleDateString('es-AR', fechaOpciones).toUpperCase();

    let htmlSalida = `
        <div class="mobile-header-view">
            <h1 class="view-title">${tituloMostrado}</h1>
            <p class="view-subtitle">${fechaTexto}</p>
        </div>
        <div class="mobile-task-list-container">
    `;

    // 2. Renderizado de la lista plana
    htmlSalida += tareasAProcesar.map(task => {
        const esCompletada = task.completed ? 'completed' : '';
        const titulo = task.name || task.text || 'Tarea sin título';
        const areaTexto = task.area ? task.area : 'Inbox';
        
        // Asume que si tenés un contexto, lo guardás en alguna propiedad. Si no, usa el área.
        const contexto = task.context ? `<span class="meta-dot"> • </span><span class="meta-context">${task.context}</span>` : '';
        const subtext = `<span class="meta-area">${areaTexto}</span>${contexto}`; 
        
        const fechaVal = task.date || task.dueDate || task.fecha;
        // Se alinea con el naranja de la PC
        const fechaHtml = fechaVal ? `<span class="meta-date">🗓 ${fechaVal}</span>` : '';
        const checked = task.completed ? '✓' : '';
        
        return `
        <div class="task-row ${esCompletada}">
            <button class="btn-check-square" onclick="window.toggleMobileTask('${task.id}')">
                ${checked}
            </button>
            <div class="task-content">
                <div class="task-title">${titulo}</div>
                <div class="task-subtext">${subtext}</div>
            </div>
            <div class="task-meta-right">
                ${fechaHtml}
            </div>
        </div>
        `;
    }).join('');

    htmlSalida += `</div>`;
    container.innerHTML = htmlSalida;
        
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
    if (!modal) {
        console.error("Diagnóstico: El contenedor 'viewMenuModal' no existe en el HTML.");
        return;
    }
    
    if (modal.classList.contains('hidden')) {
        window.buildViewMenu();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
};

window.buildViewMenu = function() {
    const container = document.getElementById('modalDynamicContent');
    if (!container) {
        console.error("Diagnóstico: El contenedor 'modalDynamicContent' no existe en el HTML.");
        return;
    }

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
    // Filtra áreas, evitando nulos y vacíos
    const areasUnicas = [...new Set(tareasParaEscanear.map(t => t.area).filter(a => a && a.trim() !== ''))];
    
    if (areasUnicas.length > 0) {
        html += '<h3 class="menu-section-title" style="margin-top:20px;">Áreas y Contextos</h3>';
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
