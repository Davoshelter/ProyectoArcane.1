/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - VERSION HISTORY v4.0 (Debug Mode)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    window.PromptHub = window.PromptHub || {};

    // Credenciales (Las mismas que editor-core.js para asegurar que funcione)
    const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';

    function getClient() {
        // Intentar obtener cliente global
        if (window.supabase && window.supabase.createClient) {
            return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        // Fallback al helper
        if (window.initSupabase) {
            return window.initSupabase();
        }
        return null;
    }

    /**
     * Renderiza el historial
     */
    async function renderHistory(promptId) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        console.group('🔍 DEPURACIÓN HISTORIAL');
        console.log('1. ID del prompt recibido:', promptId);

        historyList.innerHTML = '<div class="text-center py-8 animate-pulse text-slate-500">Consultando base de datos...</div>';

        const supabase = getClient();
        if (!supabase) {
            console.error('2. Error: No se pudo iniciar el cliente Supabase en version-history.js');
            historyList.innerHTML = '<p class="text-red-400 text-center">Error: Cliente no disponible.</p>';
            console.groupEnd();
            return;
        }
        console.log('2. Cliente Supabase: OK');

        try {
            console.log('3. Ejecutando consulta SELECT * FROM prompt_versions WHERE prompt_id =', promptId);
            
            const response = await supabase
                .from('prompt_versions')
                .select('*')
                .eq('prompt_id', promptId)
                .order('version_number', { ascending: false });

            console.log('4. Respuesta cruda de Supabase:', response);

            const { data: versions, error } = response;

            if (error) {
                console.error('❌ Error devuelto por la BD:', error);
                throw error;
            }

            console.log(`5. Datos recibidos: ${versions?.length || 0} registros`);

            if (!versions || versions.length === 0) {
                console.warn('⚠️ Array de versiones vacío. Posibles causas:');
                console.warn('   a) Realmente no hay versiones.');
                console.warn('   b) El prompt_id no coincide.');
                console.warn('   c) RLS (Row Level Security) está bloqueando la lectura.');
                
                historyList.innerHTML = '<p class="text-slate-500 text-center py-8">No se encontraron versiones.<br><span class="text-xs opacity-50">Revisa la consola para detalles.</span></p>';
                console.groupEnd();
                return;
            }

            // Renderizar
            let html = '';
            versions.forEach((version, index) => {
                const isLatest = index === 0;
                const date = new Date(version.created_at);
                const preview = (version.content || '').substring(0, 100).replace(/</g, '&lt;') + '...';

                html += `
                <div class="version-item p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-all mb-3">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-mono text-xs text-indigo-400">v${version.version_number}</span>
                                ${isLatest ? '<span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full">Actual</span>' : ''}
                            </div>
                            <p class="text-slate-300 text-sm mb-1">${version.change_reason || 'Guardado manual'}</p>
                            <p class="text-slate-500 text-[10px]">${date.toLocaleString()}</p>
                        </div>
                        ${!isLatest ? `
                        <button onclick="window.PromptHub.VersionHistory.revert('${version.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-xs text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700">
                            Restaurar
                        </button>` : ''}
                    </div>
                    <div class="mt-3 p-2 bg-slate-950/50 rounded-lg max-h-16 overflow-hidden">
                        <p class="font-mono text-[10px] text-slate-600 truncate">${preview}</p>
                    </div>
                </div>`;
            });

            historyList.innerHTML = html;
            console.log('6. Renderizado completado.');

        } catch (e) {
            console.error('Excepción en renderHistory:', e);
            historyList.innerHTML = `<p class="text-red-400 text-center py-8">Error: ${e.message}</p>`;
        }
        console.groupEnd();
    }

    /**
     * Revierte a una versión
     */
    async function revertToVersion(versionId) {
        // ... (Lógica de revertir mantenida simple para ahorrar espacio, ya funcionaba la lógica base)
        if (!confirm('¿Restaurar esta versión?')) return;
        const supabase = getClient();
        if (!supabase) return;
        try {
            const { data } = await supabase.from('prompt_versions').select('*').eq('id', versionId).single();
            if (data) {
                const el = document.getElementById('prompt-content');
                if (el) el.value = data.content;
                document.getElementById('history-modal').classList.add('hidden');
                document.getElementById('history-modal').classList.remove('flex');
            }
        } catch(e) { alert(e.message); }
    }

    // Exponer API
    window.PromptHub.VersionHistory = { render: renderHistory, revert: revertToVersion };

})();