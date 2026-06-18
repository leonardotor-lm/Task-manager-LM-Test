/**
 * MÓDULO DE RED Y PERSISTENCIA (cloud.js)
 * Dependencias implícitas globales: dbUrl, SECURITY_TOKEN, tasks, customAreas, customContexts
 * Responsabilidad: Gestión de peticiones HTTP hacia Google Apps Script y persistencia local (localStorage).
 */

function getSecureDbUrl() {
    if (!dbUrl) return "";
    
    const separator = dbUrl.includes('?') ? '&' : '?';
    
    return dbUrl + separator + 'token=' + SECURITY_TOKEN;
}

async function saveData() {
    localStorage.setItem('leo_agenda_v11', JSON.stringify(tasks));
    localStorage.setItem('leo_custom_areas', JSON.stringify(customAreas));
    localStorage.setItem('leo_custom_contexts', JSON.stringify(customContexts));
    
    if (!dbUrl) return;
    showSyncStatus('saving');
    try {
        const response = await fetch(getSecureDbUrl(), { 
            method: 'POST', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(tasks),
            redirect: 'follow'
        });
        if (!response.ok) throw new Error('Respuesta HTTP no exitosa: ' + response.status);
        const textData = await response.text();
        if (textData.trim().startsWith('<')) throw new Error('El servidor devolvió HTML (Posible error de permisos)');
        showSyncStatus('synced');
    } catch (e) { 
        console.error("Error al guardar:", e); 
        showSyncStatus('offline'); 
        showNotice("Fallo al guardar: " + e.message.substring(0, 40));
    }
}

async function loadDataFromCloud() {
    // 1. Uso estricto del ámbito global para evitar pérdida de referencia
    const currentUrl = window.dbUrl; 
    if (!currentUrl || currentUrl.trim() === "") {
        console.warn(">> Sincronización abortada: No hay URL de base de datos configurada en memoria.");
        return false;
    }

    console.log(">> Iniciando secuencia de sincronización con la nube...");
    if (typeof showSyncStatus === 'function') showSyncStatus('loading');
    
    try {
        // 2. Validación de la función de URL segura
        const targetUrl = (typeof getSecureDbUrl === 'function') ? getSecureDbUrl() : currentUrl;
        
        // 3. CACHE-BUSTER: Mecanismo vital para eludir la caché agresiva de Firefox
        const separator = targetUrl.includes('?') ? '&' : '?';
        const fetchUrl = `${targetUrl}${separator}nocache=${Date.now()}`;

        console.log(">> Interrogando al servidor:", fetchUrl);

        // 4. Petición con aceptación forzada de JSON
        const res = await fetch(fetchUrl, { 
            method: 'GET', 
            redirect: 'follow',
            headers: { 'Accept': 'application/json' }
        });
        
        console.log(">> Respuesta del servidor recibida. Status HTTP:", res.status);
        
        if (!res.ok) throw new Error("Fallo HTTP en la conexión: " + res.status);
        
        const textData = await res.text();
        console.log(">> Fragmento de datos en crudo (primeros 50 caracteres):", textData.substring(0, 50));
        
        if (textData.trim().startsWith('<')) {
            throw new Error("Anomalía: El servidor devolvió un documento HTML. Apps Script exige revalidación de permisos.");
        }

        const data = JSON.parse(textData);
        
        // 5. Verificación estructural y asignación forzada
        if (Array.isArray(data)) { 
            // Inyección explícita a la variable global 'tasks'
            if (typeof window !== 'undefined') window.tasks = data; 
            else tasks = data;
            
            // Persistencia blindada
            try {
                localStorage.setItem('leo_agenda_v11', JSON.stringify(data)); 
            } catch (storageErr) {
                console.warn(">> Advertencia: Fallo al persistir en disco local, operando en memoria RAM.", storageErr);
            }
            
            if (typeof showSyncStatus === 'function') showSyncStatus('synced'); 
            if (typeof showNotice === 'function') showNotice("Sincronizado correctamente.");
            
            console.log(">> Sincronización completada. Total de registros inyectados:", data.length);
            return true;
        } else {
            console.warn(">> Fallo de Parseo Estructural: El servidor no devolvió una matriz (Array).", data);
            throw new Error("La estructura de datos proveniente de la nube es inválida o corrupta.");
        }
    } catch (e) { 
        console.error("!! Colapso durante loadDataFromCloud:", e); 
        if (typeof showSyncStatus === 'function') showSyncStatus('offline'); 
        if (typeof showNotice === 'function') showNotice("Modo Offline: " + e.message.substring(0, 50)); 
        return false;
    }
}

// Aseguramos exposición global absoluta para que el orquestador UI pueda invocarla
window.loadDataFromCloud = loadDataFromCloud;
