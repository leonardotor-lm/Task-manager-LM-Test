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
window.closeConfirm = closeConfirm;


