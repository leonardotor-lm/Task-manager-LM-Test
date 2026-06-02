/** MÓDULO DE INTERFAZ (ui.js) */

function getAddTaskFormData() {
    const parentIdRaw = document.getElementById('parentInput').value;
    return {
        name: document.getElementById('taskInput').value.trim(),
        area: document.getElementById('areaInput').value,
        context: document.getElementById('contextInput').value,
        priority: document.getElementById('priorityInput').value,
        dateInput: document.getElementById('dateInput').value,
        timeInput: document.getElementById('timeInput').value,
        notes: document.getElementById('notesInput').value.trim(),
        reminder: document.getElementById('reminderToggle').checked,
        rule: typeof buildRuleFromUI === 'function' ? buildRuleFromUI('add') : null,
        parentId: parentIdRaw === 'root' ? 'root' : Number(parentIdRaw)
    };
}
window.getAddTaskFormData = getAddTaskFormData;
function getEditTaskFormData() {
    const newParentIdRaw = document.getElementById('editParentInput').value;
    return {
        name: document.getElementById('editNameInput').value.trim(),
        status: document.getElementById('editStatusInput').value,
        area: document.getElementById('editAreaInput').value,
        context: document.getElementById('editContextInput').value,
        priority: document.getElementById('editPriorityInput').value,
        dateInput: document.getElementById('editDateInput').value,
        timeInput: document.getElementById('editTimeInput').value,
        notes: document.getElementById('editNotesInput').value.trim(),
        reminder: document.getElementById('editReminderToggle').checked,
        rule: typeof buildRuleFromUI === 'function' ? buildRuleFromUI('edit') : null,
        newParentId: newParentIdRaw === 'root' ? 'root' : Number(newParentIdRaw)
    };
}
window.getEditTaskFormData = getEditTaskFormData;
function getBulkMoveFormData() {
    return {
        newArea: document.getElementById('bulkAreaInput').value,
        newContext: document.getElementById('bulkContextInput').value
    };
}
window.getBulkMoveFormData = getBulkMoveFormData;
function getPostponeCustomDateValue() {
    const input = document.getElementById('postponeCustomDate');
    return input ? input.value : '';
}
window.getPostponeCustomDateValue = getPostponeCustomDateValue;

function renderSidebarAreas() { 
    const allAreas = typeof getAllAreasOrdered === 'function' ? getAllAreasOrdered() : []; 
    const container = document.getElementById('sidebar-areas-list');
    if (!container) return;

    container.innerHTML = allAreas.map(area => {
        // Delegamos el cálculo estrictamente al motor
        const count = typeof getAreaTaskCount === 'function' ? getAreaTaskCount(area) : 0;

        return `<button onclick="navigate('area', '${area}')" data-area="${area}" class="sidebar-area-item w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-navy-300 transition-all border-r-2 border-transparent hover:bg-navy-700 hover:text-navy-50 focus:outline-none">
            <div class="flex items-center space-x-3 overflow-hidden">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 ${area === 'Inbox' ? 'bg-brand-500' : 'bg-navy-500'}"></span>
                <span class="truncate">${area}</span>
            </div>
            <span class="text-[10px] font-bold text-navy-400 bg-navy-800 px-1.5 py-0.5 rounded-md ml-2">${count}</span>
        </button>`;
    }).join(''); 
}
window.renderSidebarAreas = renderSidebarAreas;
function populateSelect(selectId, options, addEmpty = false, emptyText = 'Ninguno') {
    const select = document.getElementById(selectId);
    if (!select) return;
    let html = '';
    if (addEmpty) html += `<option value="">${emptyText}</option>`;
    options.forEach(opt => {
        const val = typeof opt === 'object' ? opt.name : opt;
        const text = typeof opt === 'object' ? opt.name : opt;
        html += `<option value="${val}">${text}</option>`;
    });
    select.innerHTML = html;
}
window.populateSelect = populateSelect;

function refreshAllDropdowns() {
    populateSelect('areaInput', customAreas);
    populateSelect('editAreaInput', customAreas);
    populateSelect('bulkAreaInput', customAreas, true, 'Mantener original');
    populateSelect('contextInput', customContexts, true, 'Sin contexto');
    populateSelect('editContextInput', customContexts, true, 'Sin contexto');
    populateSelect('bulkContextInput', customContexts, true, 'Mantener original');
    updateAddParentDropdown();
}
window.refreshAllDropdowns = refreshAllDropdowns;

function refreshEditDropdowns(taskId) {
    populateSelect('editAreaInput', customAreas);
    populateSelect('editContextInput', customContexts, true, 'Sin contexto');
    updateEditParentDropdown(taskId);
}
window.refreshEditDropdowns = refreshEditDropdowns;

function updateAddParentDropdown() {
    const parentInput = document.getElementById('parentInput');
    if (!parentInput) return;
    
    // Se invoca a las funciones del motor
    const flat = typeof flattenMatches === 'function' ? flattenMatches(pruneTree(tasks)) : [];
    
    let html = '<option value="root">Ninguna (Tarea principal)</option>';
    flat.forEach(t => {
        if (!t.isDeleted) {
            const prefix = t._parentPath ? t._parentPath.map(() => '-').join('') : '';
            html += `<option value="${t.id}">${prefix} ${t.name}</option>`;
        }
    });
    parentInput.innerHTML = html;
}
window.updateAddParentDropdown = updateAddParentDropdown;

function updateEditParentDropdown(taskId) {
    const parentInput = document.getElementById('editParentInput');
    if (!parentInput) return;
    
    const flat = typeof flattenMatches === 'function' ? flattenMatches(pruneTree(tasks)) : [];
    
    let html = '<option value="root">Ninguna (Tarea principal)</option>';
    flat.forEach(t => {
        // Regla visual: una tarea no puede ser padre de sí misma ni de sus descendientes
        const valid = !t.isDeleted && t.id !== taskId && (typeof isDescendant === 'function' ? !isDescendant(taskId, t.id) : true);
        if (valid) {
            const prefix = t._parentPath ? t._parentPath.map(() => '-').join('') : '';
            html += `<option value="${t.id}">${prefix} ${t.name}</option>`;
        }
    });
    parentInput.innerHTML = html;
}
window.updateEditParentDropdown = updateEditParentDropdown;

function showNotice(msg) { const box = document.getElementById('notification-box'); const notice = document.createElement('div'); notice.className = "bg-brand-500 text-navy-900 px-6 py-4 rounded-md text-xs font-bold animate-in select-none pointer-events-auto border border-brand-600"; notice.innerText = msg; box.appendChild(notice); setTimeout(() => { notice.style.opacity = '0'; notice.style.transition = 'opacity 0.3s'; setTimeout(() => notice.remove(), 300); }, 2500); }

function showSyncStatus(status) { const dot = document.getElementById('sync-status-dot'); const text = document.getElementById('sync-status-text'); if (!dot || !text) return; dot.className = "w-1.5 h-1.5 rounded-full transition-all"; switch(status) { case 'saving': dot.classList.add('bg-blue-500', 'animate-pulse'); text.innerText = "Guardando..."; text.className = "text-blue-400"; break; case 'synced': dot.classList.add('bg-emerald-500'); text.innerText = "Sincronizado"; text.className = "text-emerald-400"; break; case 'loading': dot.classList.add('bg-brand-500', 'animate-pulse'); text.innerText = "Cargando..."; text.className = "text-brand-400"; break; case 'offline': dot.classList.add('bg-yellow-500'); text.innerText = "Modo Offline"; text.className = "text-yellow-400"; break; case 'error': dot.classList.add('bg-red-500'); text.innerText = "Fallo de Red"; text.className = "text-red-400"; break; default: dot.classList.add('bg-navy-500'); text.innerText = "Nube Desconectada"; text.className = "text-navy-400"; break; } }

function showConfirm(title, message, onConfirm, isDanger = false) { document.getElementById('confirmModalTitle').innerText = title; document.getElementById('confirmModalMessage').innerText = message; confirmCallback = onConfirm; const btnConfirm = document.getElementById('confirmModalBtnAction'); if (isDanger) btnConfirm.className = "w-1/2 bg-danger-500 text-navy-50 py-3 rounded-md text-sm font-semibold hover:bg-danger-600 focus:outline-none"; else btnConfirm.className = "w-1/2 bg-brand-500 text-navy-900 py-3 rounded-md text-sm font-semibold hover:bg-brand-400 transition-colors focus:outline-none"; document.getElementById('confirmModal').classList.remove('hidden'); }

function closeConfirmModal(accepted) { document.getElementById('confirmModal').classList.add('hidden'); if (accepted && confirmCallback) confirmCallback(); confirmCallback = null; }

window.showNotice = showNotice;
window.showSyncStatus = showSyncStatus;
window.showConfirm = showConfirm;
window.closeConfirmModal = closeConfirmModal;
function openAddTaskModal() { 
    document.getElementById('taskInput').value = ''; 
    
    // 1. ASIGNACIÓN DINÁMICA DE FECHA (Corregida para zona horaria local)
    const dateInput = document.getElementById('dateInput');
    if (currentState && currentState.view === 'today') {
        const today = new Date();
        dateInput.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    } else if (currentState && currentState.view === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');
    } else {
        dateInput.value = ''; 
    }

    document.getElementById('timeInput').value = ''; 
    document.getElementById('notesInput').value = ''; 
    document.getElementById('priorityInput').value = 'baja';
    
    // 2. ASIGNACIÓN DINÁMICA DE ÁREA
    const fallbackArea = customAreas.includes('Inbox') ? 'Inbox' : (customAreas[0] || '');
    document.getElementById('areaInput').value = (currentState && currentState.selectedArea) ? currentState.selectedArea : fallbackArea; 
    
    document.getElementById('contextInput').value = ''; 
    
    currentAttachments = []; 
    renderAttachments('add'); 
    updateAddParentDropdown();
    document.getElementById('addHasRecurrence').checked = false; 
    addSelectedDays = [1]; 
    toggleDay('add', 1); 
    toggleRecurrenceUI('add');
    
    // 1. Mostrar el modal (removiendo el display: none)
    document.getElementById('addTaskModal').classList.remove('hidden'); 
    
    // 2. CORRECCIÓN ARQUITECTÓNICA: Reseteo de estado con el DOM visible.
    const reminderToggle = document.getElementById('reminderToggle');
    if (reminderToggle) {
        reminderToggle.checked = false;
    }

    setTimeout(() => document.getElementById('taskInput').focus(), 100); 
}

function closeAddTaskModal() { 
    document.getElementById('addTaskModal').classList.add('hidden'); 
    
    // Limpieza de seguridad post-cierre (previene fugas de estado si el renderizado falla)
    const reminderToggle = document.getElementById('reminderToggle');
    if (reminderToggle) {
        reminderToggle.checked = false;
    }
}

function openEditModal(id) { 
    editState = { id, parentId: getParentId(id) }; let target = null;
    function traverse(nodes) { for(let n of nodes) { if(n.id === id) { target = n; return true; } if(n.subtasks && traverse(n.subtasks)) return true; } } traverse(tasks); if (!target) return;
    document.getElementById('editNameInput').value = target.name; refreshEditDropdowns(); document.getElementById('editStatusInput').value = target.status || 'pending';
    document.getElementById('editAreaInput').value = target.area || 'Inbox'; document.getElementById('editContextInput').value = target.context || ''; document.getElementById('editPriorityInput').value = target.priority || 'baja'; 
    document.getElementById('editDateInput').value = target.date || ''; document.getElementById('editTimeInput').value = target.time || ''; document.getElementById('editReminderToggle').checked = target.reminder || false; document.getElementById('editNotesInput').value = target.notes || '';
    currentAttachments = target.attachments ? [...target.attachments] : []; renderAttachments('edit'); updateEditParentDropdown();
    if (target.recurrenceRule) {
        const r = target.recurrenceRule; document.getElementById('editHasRecurrence').checked = true; document.getElementById('editFrequency').value = r.frequency; document.getElementById('editInterval').value = r.interval; document.getElementById('editBaseOnCompletion').checked = !!r.baseOnCompletion;
        if (r.frequency === 'weekly') { editSelectedDays = r.daysOfWeek || [1]; for(let i=0;i<7;i++){ if(editSelectedDays.includes(i)){ toggleDay('edit', i); toggleDay('edit', i); } else { const btn = document.getElementById(`edit-day-${i}`); btn.classList.remove('bg-brand-500', 'text-navy-900', 'border-brand-500', 'scale-110'); btn.classList.add('bg-navy-800'); } } }
        if (r.frequency === 'monthly') { if (r.nthBusinessDay !== undefined) { document.querySelector('input[name="editMonthlyMode"][value="business"]').checked = true; document.getElementById('editNthBusinessDay').value = r.nthBusinessDay; } else { document.querySelector('input[name="editMonthlyMode"][value="fixed"]').checked = true; document.getElementById('editDayOfMonth').value = r.dayOfMonth || 1; } }
        if (r.frequency === 'yearly') { document.getElementById('editYearDay').value = r.dayOfMonth || 1; document.getElementById('editYearMonth').value = r.monthOfYear || 1; }
        if (r.frequency === 'custom') { document.getElementById('editCustomDay').value = r.dayOfMonth || 1; }
    } else { document.getElementById('editHasRecurrence').checked = false; }
    toggleRecurrenceUI('edit'); document.getElementById('editModal').classList.remove('hidden'); 
}

function closeEditModal() { 
    document.getElementById('editModal').classList.add('hidden'); 
}

function openBulkMoveModal() { 
    if (selectedTaskIds.size === 0) return;
    populateSelect('bulkAreaInput', getAllAreasOrdered());
    const allContexts = [...new Set([...customContexts.map(c => c.name), ...getUniqueValues(tasks, 'context')])].filter(c => c && c.trim() !== '').sort();
    populateSelect('bulkContextInput', allContexts, "Mantener contexto actual", "");
    document.getElementById('bulkMoveModal').classList.remove('hidden'); 
}

function closeBulkMoveModal() { 
    document.getElementById('bulkMoveModal').classList.add('hidden'); 
}

function openPostponeModal(id, e) { if (e) e.stopPropagation(); postponeState = { id }; document.getElementById('postponeModal').classList.remove('hidden'); }
function closePostponeModal() { document.getElementById('postponeModal').classList.add('hidden'); }
function toggleSidebar(force) { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('mobile-overlay'); const isOpen = !sidebar.classList.contains('-translate-x-full'); if (force === false || isOpen) { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); } else { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); } }

window.openAddTaskModal = openAddTaskModal;
window.closeAddTaskModal = closeAddTaskModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openBulkMoveModal = openBulkMoveModal;
window.closeBulkMoveModal = closeBulkMoveModal;
window.openPostponeModal = openPostponeModal;
window.closePostponeModal = closePostponeModal;
window.toggleSidebar = toggleSidebar;

function updateDateDisplay() { document.getElementById('current-date-display').innerText = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); }
function toggleConfigMenu() { const content = document.getElementById('configMenuContent'); const chevron = document.getElementById('configMenuChevron'); if (content.classList.contains('hidden')) { content.classList.remove('hidden'); chevron.classList.add('rotate-180'); } else { content.classList.add('hidden'); chevron.classList.remove('rotate-180'); } }
function getContextStyles(contextName) { const found = customContexts.find(c => c.name === contextName); const color = found ? found.color : 'gray'; return contextColorMap[color] || contextColorMap['gray']; }
function formatDateAR(dateStr, timeStr) { if (!dateStr) return ''; const parts = dateStr.split('-'); if (parts.length !== 3) return dateStr; const formattedDate = `${parts[2]}/${parts[1]}`; return timeStr ? `${formattedDate}` : formattedDate; }
function formatDateLocal(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

function openSettingsModal() { document.getElementById('settingsDbUrlInput').value = dbUrl; document.getElementById('settingsApiKeyInput').value = customApiKey; document.getElementById('settingsModal').classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal').classList.add('hidden'); }

// FUNCIONES DE INTERFAZ RECURRENCIA (MODALS)
function toggleRecurrenceUI(mode) {
    const checked = document.getElementById(`${mode}HasRecurrence`).checked;
    document.getElementById(`${mode}RecurrenceContainer`).classList.toggle('hidden', !checked);
    refreshRecurrenceUI(mode);
}
function toggleDay(mode, dayVal) {
    const arr = mode === 'add' ? addSelectedDays : editSelectedDays;
    if (arr.includes(dayVal)) { const idx = arr.indexOf(dayVal); arr.splice(idx, 1); } else { arr.push(dayVal); arr.sort((a, b) => a - b); }
    for (let i=0; i<7; i++) {
        const btn = document.getElementById(`${mode}-day-${i}`);
        if (arr.includes(i)) { btn.classList.add('bg-brand-500', 'text-navy-900', 'border-brand-500', 'scale-110'); btn.classList.remove('bg-navy-800'); }
        else { btn.classList.remove('bg-brand-500', 'text-navy-900', 'border-brand-500', 'scale-110'); btn.classList.add('bg-navy-800'); }
    }
    validateAndProjectRecurrence(mode);
}
function refreshRecurrenceUI(mode) {
    const freq = document.getElementById(`${mode}Frequency`).value;
    document.getElementById(`${mode}IntervalLabel`).innerText = freq === 'daily' ? 'días' : freq === 'weekly' ? 'semanas' : freq === 'monthly' ? 'meses' : freq === 'yearly' ? 'años' : freq === 'after_completion' ? 'días post-resolución' : 'meses';
    document.getElementById(`${mode}WeeklyBlock`).classList.toggle('hidden', freq !== 'weekly');
    document.getElementById(`${mode}MonthlyBlock`).classList.toggle('hidden', freq !== 'monthly');
    document.getElementById(`${mode}YearlyBlock`).classList.toggle('hidden', freq !== 'yearly');
    document.getElementById(`${mode}CustomBlock`).classList.toggle('hidden', freq !== 'custom');
    document.getElementById(`${mode}CompletionBaseBlock`).classList.toggle('hidden', freq === 'after_completion');
    if (freq === 'monthly') {
        const isFixed = document.querySelector(`input[name="${mode}MonthlyMode"]:checked`).value === 'fixed';
        document.getElementById(`${mode}MonthlyFixedBlock`).classList.toggle('hidden', !isFixed);
        document.getElementById(`${mode}MonthlyBusinessBlock`).classList.toggle('hidden', isFixed);
    }
    validateAndProjectRecurrence(mode);
}
function buildRuleFromUI(mode) {
    if (!document.getElementById(`${mode}HasRecurrence`).checked) return null;
    const freq = document.getElementById(`${mode}Frequency`).value;
    const interval = parseInt(document.getElementById(`${mode}Interval`).value) || 1;
    const baseOnComp = freq === 'after_completion' ? true : document.getElementById(`${mode}BaseOnCompletion`).checked;
    let rule = { frequency: freq, interval, baseOnCompletion: baseOnComp };
    if (freq === 'weekly') rule.daysOfWeek = mode === 'add' ? [...addSelectedDays] : [...editSelectedDays];
    else if (freq === 'monthly') {
        const isFixed = document.querySelector(`input[name="${mode}MonthlyMode"]:checked`).value === 'fixed';
        if (isFixed) rule.dayOfMonth = parseInt(document.getElementById(`${mode}DayOfMonth`).value) || 1;
        else rule.nthBusinessDay = parseInt(document.getElementById(`${mode}NthBusinessDay`).value) || 5;
    }
    else if (freq === 'yearly') { rule.dayOfMonth = parseInt(document.getElementById(`${mode}YearDay`).value) || 1; rule.monthOfYear = parseInt(document.getElementById(`${mode}YearMonth`).value) || 1; }
    else if (freq === 'custom') { rule.dayOfMonth = parseInt(document.getElementById(`${mode}CustomDay`).value) || 1; }
    return rule;
}
function validateAndProjectRecurrence(mode) {
    const rule = buildRuleFromUI(mode); const projEl = document.getElementById(`${mode}RecurrenceProjection`);
    if (!rule) { projEl.innerText = ''; return; }
    const tDate = document.getElementById(mode === 'add' ? 'dateInput' : 'editDateInput').value;
    if (!tDate) { projEl.innerText = 'Seleccioná una fecha base para simular.'; return; }
    if (rule.frequency === 'weekly' && (!rule.daysOfWeek || rule.daysOfWeek.length === 0)) { projEl.innerText = 'Seleccioná al menos un día.'; return; }
    try { const simTask = { date: tDate, startDate: tDate, recurrenceRule: rule }; const nextDate = calculateNextOccurrence(simTask); projEl.innerText = nextDate ? `Próxima ejecución: ${nextDate}` : 'Configuración inválida.'; } 
    catch (e) { projEl.innerText = 'Error algorítmico.'; }
}
// Exposición Global - Manipulación Visual Pura
window.updateDateDisplay = updateDateDisplay;
window.toggleConfigMenu = toggleConfigMenu;
window.getContextStyles = getContextStyles;
window.formatDateAR = formatDateAR;
window.formatDateLocal = formatDateLocal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;

// Exposición Global - Ecosistema de Recurrencia
window.toggleRecurrenceUI = toggleRecurrenceUI;
window.toggleDay = toggleDay;
window.refreshRecurrenceUI = refreshRecurrenceUI;
window.buildRuleFromUI = buildRuleFromUI;
window.validateAndProjectRecurrence = validateAndProjectRecurrence;

function renderSidebarCounters(counts) {
    if (!counts) return;
    
    const updateBadge = (id, count) => {
        const btn = document.getElementById(id);
        if (!btn) return; 
        
        if (btn.classList.contains('justify-between')) {
            btn.classList.remove('justify-between');
        }

        let badge = btn.querySelector('.nav-badge-counter');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-badge-counter text-[10px] font-bold text-navy-400 bg-navy-800 px-1.5 py-0.5 rounded-md ml-auto';
            btn.appendChild(badge);
        }
        badge.innerText = count;
    };

    updateBadge('nav-today', counts.today);
    updateBadge('nav-tomorrow', counts.tomorrow);
    updateBadge('nav-week', counts.week);
    updateBadge('nav-fortnight', counts.fortnight);
    updateBadge('nav-all', counts.all);
    updateBadge('nav-trash', counts.trash);
}
window.renderSidebarCounters = renderSidebarCounters;

// BUILD TASK ROWS
function buildTaskRows(nodes, path = []) {
    if (!nodes || nodes.length === 0) return '';
    const isTrash = currentState.view === 'trash';
    const indentMap = { 1: 'pl-3 md:pl-5', 2: 'pl-8 md:pl-10', 3: 'pl-12 md:pl-14', 4: 'pl-16 md:pl-18', 5: 'pl-20 md:pl-22' };
    const isFiltering = currentFilters.search !== '' || currentFilters.priority !== 'all' || currentFilters.context !== 'all' || currentFilters.status === 'in_progress' || currentFilters.status === 'completed';
    const todayStr = formatDateLocal(new Date());

    return nodes.map(task => {
        const hasChildren = task.subtasks && task.subtasks.length > 0;
        const isExpanded = isTrash || (currentState.view === 'focus' || isFiltering) ? true : (expandedStates[task.id] || false);
        const logicalDepth = path.length + 1;
        const indentClass = isTrash ? 'pl-3 md:pl-5' : (indentMap[logicalDepth] || 'pl-20 md:pl-22');
        const isCompleted = task.status === 'completed';
        const isOverdue = task.date && task.date < todayStr && !isCompleted;


        // El indicador de "Sin fecha" se muestra en un tono grisáceo neutro (text-navy-400)
    let dateDisplayHTML = `<span class="text-navy-400 text-[11px] font-semibold flex items-center gap-1.5 tracking-wide"><span class="w-2.5 h-[1.5px] bg-navy-400 inline-block"></span> Sin fecha</span>`;
    
    if (task.date) { 
        const dateColorClass = isOverdue ? 'text-danger-500 font-bold' : 'text-brand-500'; 
        
        // 1. Intercepción temporal: cálculo de proximidad
        let relativeDateLabel = formatDateAR(task.date, false); // Fallback por defecto (formato DD/MM)
        
        try {
            // Desensamble estricto para forzar la zona horaria local y evitar desfasajes UTC
            const [year, month, day] = task.date.split('-').map(Number);
            const taskD = new Date(year, month - 1, day);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Se normaliza a la medianoche para una comparación neta
            
            const diffTime = taskD.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            // 2. Asignación léxica según la ventana de 7 días
            if (diffDays === 0) {
                relativeDateLabel = 'hoy';
            } else if (diffDays === 1) {
                relativeDateLabel = 'mañana';
            } else if (diffDays > 1 && diffDays <= 7) {
                const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                relativeDateLabel = dayNames[taskD.getDay()];
            }
        } catch (e) {
            console.warn("Fallo en el cálculo de fecha relativa. Se aplicará formato estándar.", e);
        }

        // 3. Inyección en el DOM preservando la evaluación original de '(Vencida)'
        dateDisplayHTML = `<span class="${dateColorClass} text-[11px] font-semibold flex items-center gap-1.5 tracking-wide"><svg class="w-3.5 h-3.5 mb-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>${relativeDateLabel} ${isOverdue ? '(Vencida)' : ''}</span>`; 
    }
                const recurrenceBadge = task.recurrenceRule ? `<span class="ml-2 flex items-center gap-1 text-brand-500 bg-brand-500/10 border border-brand-500/30 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Repite</span>` : '';

        let subtasksHtml = (isExpanded && !isTrash) ? buildTaskRows(task.subtasks, [...path, {id: task.id, name: task.name}]) : '';
        const subtaskListHTML = isTrash ? '' : `<div class="subtasks-list" data-parent-id="${task.id}" style="${(hasChildren && !isExpanded) ? 'display: none;' : ''}">${subtasksHtml}</div>`;
        
        const bulkCheckboxHTML = (isBulkMode && !isTrash) ? `<div class="shrink-0 mr-2 flex items-center justify-center cursor-pointer py-1 pr-1" onclick="toggleBulkSelect(${task.id}, event)"><input type="checkbox" class="w-[18px] h-[18px] rounded-sm border border-navy-500 text-brand-500 bg-navy-800 focus:ring-0 cursor-pointer pointer-events-none transition-colors" ${selectedTaskIds.has(task.id) ? 'checked' : ''}></div>` : '';
        const isInProgress = task.status === 'in_progress'; const isMuted = !task._explicitMatch && isFiltering && !isTrash;
        
        let contextHtml = ''; if (task.context && task.context.trim() !== '') { const ctxStyles = getContextStyles(task.context); contextHtml = `<span class="mx-1 shrink-0 text-navy-600">&bull;</span><span class="truncate font-semibold tracking-wide ${ctxStyles.text} max-w-[80px] sm:max-w-[120px]">${task.context}</span>`; }
        let dependencyHtml = ''; if (task._parentPath && task._parentPath.length > 0) { const immediateParent = task._parentPath[task._parentPath.length - 1]; dependencyHtml = `<span class="mx-1 shrink-0 text-navy-600">&bull;</span><span class="text-navy-400 truncate max-w-[150px] sm:max-w-[250px]" title="Subtarea de: ${immediateParent.name}">Subtarea de: <span class="text-brand-400 font-semibold cursor-pointer hover:underline" onclick="event.stopPropagation(); focusTaskTree(${immediateParent.id})">${immediateParent.name}</span></span>`; }

        const nameStyle = isCompleted ? 'line-through text-navy-500' : (isOverdue ? 'text-danger-500 font-semibold' : (isInProgress ? 'text-info-500' : (isMuted ? 'text-navy-400 italic opacity-80' : 'text-navy-50')));

        let actionButtonsHtml = '';
        if (isTrash) { actionButtonsHtml = `<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-full pr-3 bg-gradient-to-l from-navy-800/0 via-navy-800 to-transparent pl-6"><button onclick="event.stopPropagation(); restoreTask(${task.id})" title="Restaurar" class="p-1 text-emerald-500 hover:text-emerald-400 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg></button><button onclick="event.stopPropagation(); hardDeleteTask(${task.id})" title="Eliminar definitivamente" class="p-1 text-danger-500 hover:text-danger-400 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div>`; } 
        
        else if (!isBulkMode) {
            let statusActionHtml = ''; if (isInProgress) statusActionHtml = `<button onclick="event.stopPropagation(); setTaskStatus(${task.id}, 'pending')" title="Pausar" class="p-1 text-info-500 hover:text-navy-50 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>`; else if (!isCompleted) statusActionHtml = `<button onclick="event.stopPropagation(); setTaskStatus(${task.id}, 'in_progress')" title="Marcar en progreso" class="p-1 text-navy-400 hover:text-info-500 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>`;
            
            // Se inyecta el botón de Añadir Subtarea justo antes del botón de Posponer
            actionButtonsHtml = `<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-full pr-3 bg-gradient-to-l from-navy-800/0 via-navy-800 to-transparent pl-6">
                ${statusActionHtml}
                <button onclick="quickAddSubtask(${task.id}, event)" title="Añadir subtarea rápida" class="p-1 text-brand-500 hover:text-brand-400 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg></button>
                <button onclick="openPostponeModal(${task.id}, event)" title="Posponer" class="p-1 text-navy-400 hover:text-brand-500 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
                <button onclick="event.stopPropagation(); openEditModal(${task.id})" title="Editar" class="p-1 text-navy-400 hover:text-navy-50 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                <button onclick="event.stopPropagation(); deleteTaskUniversal(${task.id})" title="Eliminar" class="p-1 text-navy-500 hover:text-danger-500 rounded hover:bg-navy-700 transition-all focus:outline-none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
            </div>`.replace(/\n\s+/g, ''); // Se comprime para evitar rupturas de línea en el template literal
        }

        return `
            <div class="task-item" data-id="${task.id}">
                <div class="group flex flex-col py-1.5 pr-4 border-b border-navy-700 hover:bg-navy-700/50 transition-colors ${indentClass}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            ${bulkCheckboxHTML}
                            ${(hasChildren && !isTrash) ? `<button onclick="toggleExpand(${task.id}, event)" class="p-0.5 text-navy-400 hover:text-navy-50 transition-transform ${isExpanded ? 'rotate-90' : ''} focus:outline-none shrink-0"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>` : `<div class="w-4 shrink-0"></div>`}
                            <input type="checkbox" ${isCompleted ? 'checked' : ''} ${isTrash ? 'disabled' : `onchange="toggleTaskUniversal(${task.id})"`} class="task-cb shrink-0 ${(isBulkMode || isTrash) ? 'opacity-40 pointer-events-none' : ''} ${isInProgress ? 'is-in-progress' : ''}">
                            <div class="flex flex-col min-w-0 flex-1">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-[14px] font-medium task-name ${nameStyle} truncate ${isTrash ? 'pointer-events-none' : 'cursor-pointer'} select-none leading-none transition-colors" onclick="${isTrash ? '' : (isBulkMode ? `toggleBulkSelect(${task.id}, event)` : `openEditModal(${task.id})`)}">${task.name}</span>
                                    ${(hasChildren && !isTrash) ? `<span class="bg-navy-700 text-navy-400 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 shadow-inner">+${task.subtasks.length} sub.</span>` : ''}
                                    ${recurrenceBadge}
                                    ${(task.attachments && task.attachments.length > 0) ? `<svg class="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>` : ''}
                                    ${(isTrash && hasChildren) ? `<span class="text-[9px] bg-navy-700 text-navy-400 px-1.5 py-0.5 rounded ml-2">+${task.subtasks.length} sub.</span>` : ''}
                                </div>
                                <div class="flex items-center text-[11px] mt-1 leading-none min-w-0 select-none">
                                    <div class="flex items-center text-navy-400 ${isTrash ? '' : 'cursor-pointer hover:text-navy-300'} transition-colors shrink-0 min-w-0" onclick="${isTrash ? '' : (isBulkMode ? `toggleBulkSelect(${task.id}, event)` : `openEditModal(${task.id})`)}">
                                        <span class="truncate">${task.area}</span>${contextHtml}${dependencyHtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 shrink-0 relative">
                            ${actionButtonsHtml}
                            <div class="w-28 flex flex-col items-start justify-center gap-1.5 shrink-0 pl-2">
                                <svg title="Prioridad: ${task.priority}" class="w-3.5 h-3.5 ${priorityColors[task.priority]}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"/></svg>
                                ${dateDisplayHTML}
                            </div>
                        </div>
                    </div>
                </div>
                ${subtaskListHTML}
            </div>
        `;
    }).join('');
}

window.renderTasks = function() {
    const list = document.getElementById('taskList'); 
    const empty = document.getElementById('emptyState');
    
    // Sincronización estricta con la fuente de verdad global
    const state = window.currentState || { view: 'area', selectedArea: 'Inbox' };
    const filters = window.currentFilters || { search: '', status: 'pending', priority: 'all', context: 'all' };

    let nodesToRender = [];
    
    if (state.view === 'trash') {
        function collectDeleted(nodes) { nodes.forEach(n => { if (n.isDeleted) nodesToRender.push(n); else if (n.subtasks) collectDeleted(n.subtasks); }); }
        if (typeof tasks !== 'undefined') collectDeleted(tasks); 
        nodesToRender.sort((a,b) => (b.deletedAt || 0) - (a.deletedAt || 0));
    } else {
        // Uso del fallback algorítmico en caso de que pruneTree no esté expuesto globalmente
        const pruned = (typeof window.pruneTree === 'function' && typeof tasks !== 'undefined') ? window.pruneTree(tasks) : (typeof pruneTree === 'function' ? pruneTree(tasks) : []);
        
        const isTemporalView = ['today', 'tomorrow', 'week', 'fortnight'].includes(state.view);
        const hasActiveSearch = typeof filters.search === 'string' && filters.search.trim() !== '';
        const hasActivePriority = filters.priority && filters.priority !== 'all';
        const hasActiveContext = filters.context && filters.context !== 'all';
        const hasActiveStatus = filters.status && filters.status !== 'pending' && filters.status !== 'all';
        
        const isFlatView = isTemporalView || hasActiveSearch || hasActivePriority || hasActiveContext || hasActiveStatus;
        
        nodesToRender = isFlatView ? (typeof window.flattenMatches === 'function' ? window.flattenMatches(pruned) : (typeof flattenMatches === 'function' ? flattenMatches(pruned) : [])) : pruned;

        // 1. Ordenamiento temporal (semanal / quincenal)
        if (['week', 'fortnight'].includes(state.view)) {
            nodesToRender.sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return a.date.localeCompare(b.date);
            });
        }
        
        // 2. NUEVA INTERVENCIÓN: Ordenamiento histórico para completadas
        // Ordena las tareas extraídas forzando a las más recientes a subir, eliminando la ilusión de omisión.
        if (filters.status === 'completed') {
            nodesToRender.sort((a, b) => {
                const dateA = a.completedAt || a.date || '1970-01-01';
                const dateB = b.completedAt || b.date || '1970-01-01';
                return dateB.localeCompare(dateA); // Criterio descendente
            });
        }
    }
    
    if (nodesToRender.length === 0) { 
        if (list) list.innerHTML = ''; 
        if (empty) {
            empty.innerText = state.view === 'trash' ? "La papelera está vacía." : "No se encontraron tareas bajo los criterios actuales."; 
            empty.classList.remove('hidden'); 
        }
        return; 
    }
    
    if (empty) empty.classList.add('hidden');
    if (list) {
        const renderFn = typeof window.buildTaskRows === 'function' ? window.buildTaskRows : buildTaskRows;
        list.innerHTML = `<div id="taskList-root" class="flex flex-col min-h-[50px] pb-4">${renderFn(nodesToRender)}</div>`;
    }
};

window.buildTaskRows = buildTaskRows;
window.renderTasks = renderTasks;

