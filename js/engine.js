/ MÓDULO DE MOTOR (engine.js) */

// LÓGICA DE RECURRENCIA
function parseDateLocal(dateStr) { if (!dateStr) return new Date(); const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d, 0, 0, 0, 0); }
function formatDateLocal(dateObj) { const y = dateObj.getFullYear(); const m = String(dateObj.getMonth() + 1).padStart(2, '0'); const d = String(dateObj.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function isBusinessDay(date) { const day = date.getDay(); return day !== 0 && day !== 6; }
function calculateNthBusinessDay(year, month, n) { let count = 0; let date = new Date(year, month, 1, 0, 0, 0, 0); let lastBd = null; while (date.getMonth() === month) { if (isBusinessDay(date)) { count++; lastBd = new Date(date); if (count === n) return date; } date.setDate(date.getDate() + 1); } return lastBd; }
function addMonthsSafely(baseDate, monthsToAdd, targetDay) { const result = new Date(baseDate); const expectedMonth = (baseDate.getMonth() + monthsToAdd) % 12; const expectedYear = baseDate.getFullYear() + Math.floor((baseDate.getMonth() + monthsToAdd) / 12); result.setDate(1); result.setFullYear(expectedYear); result.setMonth(expectedMonth); const daysInTargetMonth = new Date(expectedYear, expectedMonth + 1, 0, 0, 0, 0, 0).getDate(); const dayToSet = targetDay !== undefined ? targetDay : baseDate.getDate(); result.setDate(Math.min(dayToSet, daysInTargetMonth)); return result; }
function getStartOfWeek(date) { const result = new Date(date); const day = result.getDay(); const diff = result.getDate() - day + (day === 0 ? -6 : 1); result.setDate(diff); return result; }
function getDaysDifference(d1, d2) { const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()); const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()); return Math.round((t2 - t1) / 86400000); }

function calculateNextOccurrence(task, completionDateStr = null) {
    const rule = task.recurrenceRule; if (!rule || rule.frequency === 'none') return '';
    const scheduledDate = parseDateLocal(task.date); const completionDate = completionDateStr ? parseDateLocal(completionDateStr) : new Date();
    const baseDate = rule.baseOnCompletion ? completionDate : scheduledDate; const interval = Math.max(1, rule.interval || 1);
    if (rule.frequency === 'after_completion') { const next = new Date(completionDate); next.setDate(next.getDate() + interval); return formatDateLocal(next); }
    switch (rule.frequency) {
        case 'daily': { const next = new Date(baseDate); next.setDate(next.getDate() + interval); return formatDateLocal(next); }
        case 'weekly': {
            const daysOfWeek = rule.daysOfWeek; if (!daysOfWeek || daysOfWeek.length === 0) { const next = new Date(baseDate); next.setDate(next.getDate() + (interval * 7)); return formatDateLocal(next); }
            const anchorDate = task.startDate ? parseDateLocal(task.startDate) : scheduledDate; const anchorWeekStart = getStartOfWeek(anchorDate);
            const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
            let candidate = new Date(baseDate); let found = false; let safetyCounter = 0;
            while (!found && safetyCounter < 1000) {
                safetyCounter++; candidate.setDate(candidate.getDate() + 1); const candidateDay = candidate.getDay();
                if (sortedDays.includes(candidateDay)) { const candidateWeekStart = getStartOfWeek(candidate); const weekDiff = Math.floor(getDaysDifference(anchorWeekStart, candidateWeekStart) / 7); if (weekDiff % interval === 0) found = true; }
            } return formatDateLocal(candidate);
        }
        case 'monthly': {
            if (rule.nthBusinessDay !== undefined) { const targetMonthDate = addMonthsSafely(baseDate, interval, 1); return formatDateLocal(calculateNthBusinessDay(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), rule.nthBusinessDay)); }
            const targetDay = rule.dayOfMonth !== undefined ? rule.dayOfMonth : baseDate.getDate(); return formatDateLocal(addMonthsSafely(baseDate, interval, targetDay));
        }
        case 'yearly': {
            const next = new Date(baseDate); const targetMonth = rule.monthOfYear !== undefined ? (rule.monthOfYear - 1) : baseDate.getMonth(); const targetDay = rule.dayOfMonth !== undefined ? rule.dayOfMonth : baseDate.getDate();
            next.setFullYear(next.getFullYear() + interval); next.setDate(1); next.setMonth(targetMonth); const maxDays = new Date(next.getFullYear(), targetMonth + 1, 0, 0, 0, 0, 0).getDate(); next.setDate(Math.min(targetDay, maxDays)); return formatDateLocal(next);
        }
        case 'custom': { const targetDay = rule.dayOfMonth !== undefined ? rule.dayOfMonth : baseDate.getDate(); return formatDateLocal(addMonthsSafely(baseDate, interval, targetDay)); }
        default: return '';
    }
}

// TREE AND LIST RENDER LOGIC
function containsFocusNode(node, targetId) { if (node.id === targetId) return true; if (!node.subtasks) return false; return node.subtasks.some(s => containsFocusNode(s, targetId)); }
function sortTasks(taskList) { if (currentSort.by === 'none') return taskList; const priorityWeight = { urgente: 4, alta: 3, media: 2, baja: 1 }; return taskList.sort((a, b) => { let valA, valB; if (currentSort.by === 'priority') { valA = priorityWeight[a.priority] || 0; valB = priorityWeight[b.priority] || 0; } else if (currentSort.by === 'date') { valA = a.date || '9999-12-31'; valB = b.date || '9999-12-31'; } else if (currentSort.by === 'name') { valA = (a.name || '').toLowerCase(); valB = (b.name || '').toLowerCase(); } else if (currentSort.by === 'context') { valA = (a.context || '\uFFFF').toLowerCase(); valB = (b.context || '\uFFFF').toLowerCase(); } let comparison = 0; if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; return currentSort.order === 'desc' ? -comparison : comparison; }); }

function pruneTree(nodeList, inFocusedSubtree = false) {
    if (!Array.isArray(nodeList)) return [];
    const todayStr = formatDateLocal(new Date());
    const tomorrowObj = new Date(); tomorrowObj.setDate(tomorrowObj.getDate() + 1); const tomorrowStr = formatDateLocal(tomorrowObj);
    
    // CORRECCIÓN: Proyección de ventana móvil de 7 días exactos en lugar de límite de domingo
    const nextWeekObj = new Date(); nextWeekObj.setDate(nextWeekObj.getDate() + 7); const nextWeekStr = formatDateLocal(nextWeekObj);
    
    const fortnightObj = new Date(); fortnightObj.setDate(fortnightObj.getDate() + 15); const fortnightStr = formatDateLocal(fortnightObj);
    
    let filtered = nodeList.map(node => {
        if (node.isDeleted) return null; 
        let matches = true;
        if (currentFilters.search !== '') { const sTerm = currentFilters.search.toLowerCase(); const textMatch = node.name.toLowerCase().includes(sTerm) || (node.area || '').toLowerCase().includes(sTerm) || (node.context || '').toLowerCase().includes(sTerm); if (!textMatch) matches = false; }
        if (currentFilters.status === 'pending' && node.status === 'completed') matches = false; 
        if (currentFilters.status === 'in_progress' && node.status !== 'in_progress') matches = false; 
        if (currentFilters.status === 'completed' && node.status !== 'completed') matches = false; 
        if (currentFilters.priority !== 'all' && node.priority !== currentFilters.priority) matches = false; 
        if (currentFilters.context !== 'all' && node.context !== currentFilters.context) matches = false;
        
        if (currentState.view === 'today') { if (!node.date || node.date > todayStr) matches = false; }
        else if (currentState.view === 'tomorrow') { if (!node.date || node.date !== tomorrowStr) matches = false; }
        // Se aplica el nuevo horizonte temporal en la evaluación de la vista semanal
        else if (currentState.view === 'week') { if (!node.date || node.date > nextWeekStr) matches = false; }
        else if (currentState.view === 'fortnight') { if (!node.date || node.date > fortnightStr) matches = false; }
        else if (currentState.view === 'area') { if (node.area !== currentState.selectedArea) matches = false; }
        else if (currentState.view === 'focus') { if (!inFocusedSubtree && !containsFocusNode(node, currentState.focusTargetId)) matches = false; }
        
        const isNowFocused = inFocusedSubtree || (currentState.view === 'focus' && node.id === currentState.focusTargetId);
        const prunedSubtasks = pruneTree(node.subtasks || [], isNowFocused);
        if (matches || prunedSubtasks.length > 0) return { ...node, subtasks: prunedSubtasks, _explicitMatch: matches }; 
        return null;
    }).filter(Boolean);
    
    return sortTasks(filtered);
}

// FLATTEN MATCHES
function flattenMatches(prunedNodes, path = []) {
    let flat = []; if (!Array.isArray(prunedNodes)) return flat;
    prunedNodes.forEach(node => {
        const currentPath = [...path, { id: node.id, name: node.name }];
        if (node._explicitMatch) flat.push({ ...node, _parentPath: path, subtasks: [] });
        if (node.subtasks && node.subtasks.length > 0) flat = flat.concat(flattenMatches(node.subtasks, currentPath));
    }); return flat;
}
function getAreaTaskCount(areaName) {
    let count = 0;
    if (typeof tasks === 'undefined' || !Array.isArray(tasks)) return count;
    
    function walk(nodes) {
        nodes.forEach(t => {
            if (!t.isDeleted && t.status !== 'completed' && t.area === areaName) {
                count++;
            }
            if (t.subtasks && Array.isArray(t.subtasks)) {
                walk(t.subtasks);
            }
        });
    }
    
    walk(tasks);
    return count;
}
window.getAreaTaskCount = getAreaTaskCount;
