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
