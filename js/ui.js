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
