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
