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
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;

// Exposición Global - Ecosistema de Recurrencia
window.toggleRecurrenceUI = toggleRecurrenceUI;
window.toggleDay = toggleDay;
window.refreshRecurrenceUI = refreshRecurrenceUI;
window.buildRuleFromUI = buildRuleFromUI;
window.validateAndProjectRecurrence = validateAndProjectRecurrence;
