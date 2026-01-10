/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR COMPLETE (All-in-One)
   ═══════════════════════════════════════════════════════════════════════════ */

(async function () {
    'use strict';
    console.log('📦 Editor Complete: Iniciando...');

    // 1. UI References
    const ui = {
        title: document.getElementById('prompt-title'),
        content: document.getElementById('prompt-content'),
        notes: document.getElementById('prompt-notes'),
        saveBtn: document.getElementById('save-btn'),
        headerTitle: document.getElementById('prompt-title-display'),
        headerBadge: document.getElementById('prompt-category-badge'),
        lastEdit: document.getElementById('prompt-last-edit'),
        icon: document.getElementById('prompt-icon'),
        historyBtn: document.getElementById('history-btn'),
        historyModal: document.getElementById('history-modal'),
        closeHistoryModal: document.getElementById('close-history-modal'),
        historyList: document.getElementById('history-list'),
        formatBtns: document.querySelectorAll('.format-btn'),
        deleteBtn: document.getElementById('delete-btn'),
        deleteModal: document.getElementById('delete-modal'),
        confirmDelete: document.getElementById('confirm-delete-btn'),
        cancelDelete: document.getElementById('cancel-delete-btn')
    };

    const promptId = new URLSearchParams(window.location.search).get('id');
    const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';
    
    let supabase = null;

    // 2. Supabase Load
    async function waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabase && window.supabase.createClient) {
                resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
                return;
            }
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.supabase && window.supabase.createClient) {
                    clearInterval(interval);
                    resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
                }
                if (attempts === 20) {
                    const s = document.createElement('script');
                    s.src = 'https://unpkg.com/@supabase/supabase-js@2';
                    document.head.appendChild(s);
                }
                if (attempts > 100) { clearInterval(interval); resolve(null); }
            }, 100);
        });
    }

    supabase = await waitForSupabase();
    if (!supabase) return;

    // 3. Auth & Init
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'auth-login.html'; return; }

    if (promptId) loadData();

    // 4. Load Data
    async function loadData() {
        ui.headerTitle.textContent = 'Cargando...';
        try {
            const { data: prompt, error } = await supabase
                .from('prompts')
                .select(`*, categories(name), ai_types(name, icon_svg, slug)`)
                .eq('id', promptId)
                .single();

            if (error) throw error;

            ui.title.value = prompt.title || '';
            ui.content.value = prompt.content || '';
            ui.notes.value = prompt.description || '';
            ui.headerTitle.textContent = prompt.title || 'Sin Título';
            ui.headerBadge.textContent = prompt.categories?.name || 'General';
            
            if(ui.lastEdit) ui.lastEdit.textContent = `Guardado: ${new Date(prompt.updated_at).toLocaleString()}`;

            // Icon
            if(ui.icon && prompt.ai_types) {
                const slug = prompt.ai_types.slug?.toLowerCase();
                const colors = { 'chatgpt': 'bg-emerald-500', 'midjourney': 'bg-indigo-500', 'claude': 'bg-orange-500', 'gemini': 'bg-blue-500', 'dalle': 'bg-teal-500', 'stable-diffusion': 'bg-orange-600', 'deepseek': 'bg-blue-700', 'grok': 'bg-gray-900', 'copilot': 'bg-sky-600' };
                ui.icon.className = `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${colors[slug] || 'bg-slate-700'}`;
                if (prompt.ai_types.icon_svg) {
                    let svg = prompt.ai_types.icon_svg;
                    if(svg.includes('<svg') && !svg.includes('w-')) svg = svg.replace('<svg', '<svg class="w-6 h-6 text-white"');
                    if(!svg.includes('text-white')) svg = svg.replace('<svg', '<svg class="text-white"');
                    ui.icon.innerHTML = svg;
                }
            }
        } catch (e) { console.error('Load Error:', e); }
    }

    // 5. Save
    if (ui.saveBtn) {
        ui.saveBtn.onclick = async () => {
            const originalHTML = ui.saveBtn.innerHTML;
            ui.saveBtn.disabled = true;
            ui.saveBtn.textContent = 'Guardando...';

            try {
                // Update Prompt
                const { error } = await supabase.from('prompts').update({
                    title: ui.title.value,
                    content: ui.content.value,
                    description: ui.notes.value,
                    updated_at: new Date().toISOString()
                }).eq('id', promptId);

                if (error) throw error;

                // Insert Version (Silent Try)
                try {
                    const { data: v } = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', promptId).order('version_number', {ascending:false}).limit(1);
                    const nextV = (v && v.length) ? v[0].version_number + 1 : 1;
                    await supabase.from('prompt_versions').insert([{ prompt_id: promptId, version_number: nextV, content: ui.content.value }]);
                    console.log('✅ Versión guardada:', nextV);
                } catch(ve) { console.warn('Error guardando versión:', ve); }

                ui.headerTitle.textContent = ui.title.value;
                ui.lastEdit.textContent = 'Guardado ahora';
                
                // Toast
                const t = document.createElement('div');
                t.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
                t.textContent = '✅ Guardado';
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 2500);

            } catch (e) { alert('Error: ' + e.message); } 
            finally { ui.saveBtn.disabled = false; ui.saveBtn.innerHTML = originalHTML; }
        };
    }

    // Delete Logic
    if (ui.deleteBtn) {
        // Abrir Modal
        ui.deleteBtn.onclick = () => {
            ui.deleteModal.classList.remove('hidden');
            ui.deleteModal.classList.add('flex');
        };

        // Cancelar
        if (ui.cancelDelete) {
            ui.cancelDelete.onclick = () => {
                ui.deleteModal.classList.add('hidden');
                ui.deleteModal.classList.remove('flex');
            };
        }

        // Confirmar Borrado
        if (ui.confirmDelete) {
            ui.confirmDelete.onclick = async () => {
                const originalText = ui.confirmDelete.innerHTML;
                ui.confirmDelete.disabled = true;
                ui.confirmDelete.innerHTML = 'Eliminando...';

                try {
                    const { error } = await supabase
                        .from('prompts')
                        .delete()
                        .eq('id', promptId);

                    if (error) throw error;

                    window.location.href = 'dashboard.html';
                } catch (e) {
                    alert('Error al eliminar: ' + e.message);
                    ui.confirmDelete.disabled = false;
                    ui.confirmDelete.innerHTML = originalText;
                }
            };
        }
    }

    // 6. History Logic (INTERNAL)
    async function loadHistory() {
        console.log('📜 Cargando historial...');
        ui.historyList.innerHTML = '<div class="text-center py-8 animate-pulse text-slate-500">Cargando...</div>';
        
        try {
            const { data: versions, error } = await supabase
                .from('prompt_versions')
                .select('*')
                .eq('prompt_id', promptId)
                .order('version_number', { ascending: false });

            if (error) throw error;

            if (!versions || versions.length === 0) {
                ui.historyList.innerHTML = '<p class="text-slate-500 text-center py-8">No hay versiones guardadas aún.</p>';
                return;
            }

            let html = '';
            versions.forEach((v, i) => {
                const isLatest = i === 0;
                const date = new Date(v.created_at).toLocaleString();
                const preview = (v.content || '').substring(0, 80) + '...';
                
                html += `
                <div class="p-4 bg-slate-900/50 border border-slate-700 rounded-xl mb-3">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-mono text-xs text-indigo-400">v${v.version_number}</span>
                                ${isLatest ? '<span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full">Actual</span>' : ''}
                            </div>
                            <p class="text-slate-500 text-[10px]">${date}</p>
                        </div>
                        ${!isLatest ? `<button class="restore-btn px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-xs text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700" data-id="${v.id}">Restaurar</button>` : ''}
                    </div>
                    <div class="mt-2 p-2 bg-slate-950/50 rounded-lg text-[10px] text-slate-600 font-mono truncate">${preview}</div>
                </div>`;
            });
            
            ui.historyList.innerHTML = html;

            // Listeners para restaurar
            ui.historyList.querySelectorAll('.restore-btn').forEach(btn => {
                btn.onclick = async () => {
                    const vid = btn.getAttribute('data-id');
                    const ver = versions.find(v => v.id === vid);
                    
                    // Restauración directa (Sin confirmación nativa molesta)
                    if (ver) {
                        ui.content.value = ver.content;
                        
                        // Feedback Visual Importante
                        if (ui.lastEdit) {
                            ui.lastEdit.innerHTML = `<span class="text-amber-400">⚠️ Restaurado desde v${ver.version_number} - ¡No guardado!</span>`;
                        }
                        
                        ui.historyModal.classList.add('hidden');
                        ui.historyModal.classList.remove('flex');
                        
                        // Toast
                        const t = document.createElement('div');
                        t.className = 'fixed bottom-6 right-6 bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
                        t.textContent = `Visualizando v${ver.version_number}. Guarda para aplicar.`;
                        document.body.appendChild(t);
                        setTimeout(() => t.remove(), 4000);
                    }
                };
            });

        } catch (e) {
            console.error(e);
            ui.historyList.innerHTML = '<p class="text-red-400 text-center">Error cargando historial</p>';
        }
    }

    // UI Listeners
    if (ui.historyBtn) {
        ui.historyBtn.onclick = () => {
            ui.historyModal.classList.remove('hidden');
            ui.historyModal.classList.add('flex');
            loadHistory(); // Llamada directa
        };
    }
    if (ui.closeHistoryModal) {
        ui.closeHistoryModal.onclick = () => {
            ui.historyModal.classList.add('hidden');
            ui.historyModal.classList.remove('flex');
        };
    }

    // Formato simple
    ui.formatBtns.forEach(btn => {
        btn.onclick = () => {
            const format = btn.getAttribute('data-format');
            const start = ui.content.selectionStart;
            const end = ui.content.selectionEnd;
            const text = ui.content.value;
            const sel = text.substring(start, end) || 'texto';
            let res = sel, off = 0;
            if (format === 'h1') { res = `
# ${sel}
`; off = 3; }
            if (format === 'bold') { res = `**${sel}**`; off = 2; }
            ui.content.value = text.substring(0, start) + res + text.substring(end);
            ui.content.focus();
        };
    });

})();
