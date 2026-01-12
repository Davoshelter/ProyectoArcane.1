/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR COMPLETE v8.0 (Step-by-Step)
   ═══════════════════════════════════════════════════════════════════════════ */

(async function () {
    'use strict';
    console.log('🤖 Editor v8.0: Iniciando...');

    const ui = {
        title: document.getElementById('prompt-title'),
        content: document.getElementById('prompt-content'),
        notes: document.getElementById('prompt-notes'),
        saveBtn: document.getElementById('save-btn'),
        headerTitle: document.getElementById('prompt-title-display'),
        headerBadge: document.getElementById('prompt-category-badge'),
        lastEdit: document.getElementById('prompt-last-edit'),
        icon: document.getElementById('prompt-icon'),
        iconLarge: document.getElementById('prompt-icon-large'),
        historyBtn: document.getElementById('history-btn'),
        historyModal: document.getElementById('history-modal'),
        closeHistoryModal: document.getElementById('close-history-modal'),
        historyList: document.getElementById('history-list'),
        deleteBtn: document.getElementById('delete-btn'),
        deleteModal: document.getElementById('delete-modal'),
        confirmDelete: document.getElementById('confirm-delete-btn'),
        cancelDelete: document.getElementById('cancel-delete-btn'),
        formatBtns: document.querySelectorAll('.format-btn'),
        aiToggleBtn: document.getElementById('ai-toggle-btn'),
        aiSidebar: document.getElementById('ai-sidebar'),
        closeAiSidebar: document.getElementById('close-ai-sidebar'),
        aiInput: document.getElementById('ai-input'),
        aiSendBtn: document.getElementById('ai-send'),
        aiChat: document.getElementById('ai-chat')
    };

    // Auto-ajuste del título
    if (ui.title) {
        ui.title.oninput = function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        };
    }

    const promptId = new URLSearchParams(window.location.search).get('id');
    const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';
    
    let supabase = null;
    let currentSessionId = null;
    let isFavorite = false;
    let isPublic = false;

    // --- FUNCIONES DE ACTUALIZACIÓN DE UI (Globales al script) ---
    function updateFavoriteUI() {
        if (!ui.favoriteBtn) return;
        if (isFavorite) {
            ui.favoriteBtn.classList.add('text-amber-400');
            ui.favoriteBtn.classList.remove('text-slate-400');
            ui.favoriteBtn.querySelector('svg').setAttribute('fill', 'currentColor');
        } else {
            ui.favoriteBtn.classList.remove('text-amber-400');
            ui.favoriteBtn.classList.add('text-slate-400');
            ui.favoriteBtn.querySelector('svg').setAttribute('fill', 'none');
        }
    }

    function updatePublicUI(active) {
        const publicToggleBtn = document.getElementById('public-toggle-btn');
        const publicToggleDot = document.getElementById('public-toggle-dot');
        if (!publicToggleBtn || !publicToggleDot) return;
        if (active) {
            publicToggleBtn.classList.remove('bg-slate-700');
            publicToggleBtn.classList.add('bg-teal-500');
            publicToggleDot.classList.remove('translate-x-1');
            publicToggleDot.classList.add('translate-x-6');
            publicToggleBtn.setAttribute('aria-checked', 'true');
        } else {
            publicToggleBtn.classList.add('bg-slate-700');
            publicToggleBtn.classList.remove('bg-teal-500');
            publicToggleDot.classList.add('translate-x-1');
            publicToggleDot.classList.remove('translate-x-6');
            publicToggleBtn.setAttribute('aria-checked', 'false');
        }
    }

    // 1. Carga Robusta
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'auth-login.html'; return; }

    // Notificar Sidebar
    if (window.updateSidebarUser) {
         const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         window.updateSidebarUser({ email: session.user.email, username: p?.username, avatar_url: p?.avatar_url });
    }

    // --- CARGA DE DATOS UNIFICADA ---
    async function loadData() {
        if (!promptId) return;
        console.log('🔍 Cargando datos del prompt:', promptId);
        
        try {
            const { data: prompt, error } = await supabase
                .from('prompts')
                .select(`*, categories(name), ai_types(name, icon_svg, slug)`)
                .eq('id', promptId)
                .single();

            if (error) throw error;

            // 1. Campos de Texto
            ui.title.value = prompt.title || '';
            ui.content.value = prompt.content || '';
            ui.notes.value = prompt.description || '';
            
            // 2. Header & Badges
            ui.headerTitle.textContent = prompt.title || 'Sin Título';
            ui.headerBadge.textContent = prompt.categories?.name || 'General';
            
            // 3. Estado Favorito
            isFavorite = prompt.is_favorite;
            updateFavoriteUI();

            // 4. Estado Público (Toggle)
            isPublic = prompt.is_public;
            updatePublicUI(isPublic);

            // 5. Icono de IA
            if(prompt.ai_types) {
                const slug = prompt.ai_types.slug?.toLowerCase();
                const colors = { 'chatgpt': 'bg-emerald-500', 'midjourney': 'bg-indigo-500', 'claude': 'bg-orange-500', 'gemini': 'bg-blue-500', 'dalle': 'bg-teal-500', 'stable-diffusion': 'bg-orange-600', 'deepseek': 'bg-blue-700', 'grok': 'bg-gray-900', 'copilot': 'bg-sky-600' };
                
                // Icono Header
                if (ui.icon) {
                    ui.icon.className = `w-10 h-10 rounded-xl flex items-center justify-center ${colors[slug] || 'bg-slate-700'}`;
                    if (prompt.ai_types.icon_svg) {
                        let svg = prompt.ai_types.icon_svg;
                        if(svg.includes('<svg') && !svg.includes('w-')) svg = svg.replace('<svg', '<svg class="w-6 h-6 text-white"');
                        ui.icon.innerHTML = svg;
                    }
                }

                // Icono Grande (Notion Style)
                if (ui.iconLarge) {
                    ui.iconLarge.className = `w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border border-slate-600 transition-all hover:bg-slate-700 group-hover:scale-105 cursor-default ${colors[slug] || 'bg-slate-700/50'}`;
                    if (prompt.ai_types.icon_svg) {
                        let svg = prompt.ai_types.icon_svg;
                        svg = svg.replace('<svg', '<svg class="w-10 h-10 text-white"');
                        ui.iconLarge.innerHTML = svg;
                    } else {
                        ui.iconLarge.textContent = '📄';
                    }
                }
            }

            // 6. Última edición
            if (ui.lastEdit && prompt.updated_at) {
                ui.lastEdit.textContent = new Date(prompt.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            }

            console.log('✅ Datos cargados. Público:', isPublic, 'Favorito:', isFavorite);

        } catch (e) {
            console.error('❌ Error en loadData:', e);
        }
    }

    if (promptId) loadData();

    // 2. AI CHAT LOGIC
    async function sendMessage() {
        const text = ui.aiInput.value.trim();
        if (!text) return;
        appendMessage('user', text);
        ui.aiInput.value = '';
        
        const loadingId = 'ai-loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'flex gap-3 animate-pulse';
        loadingDiv.innerHTML = `<div class="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">...</div><div class="bg-slate-700/50 rounded-xl p-3 text-xs">Pensando...</div>`;
        ui.aiChat.appendChild(loadingDiv);
        ui.aiChat.scrollTop = ui.aiChat.scrollHeight;

        try {
            const { data, error } = await supabase.functions.invoke('gemini-chat', {
                body: { prompt: text, sessionId: currentSessionId }
            });
            document.getElementById(loadingId)?.remove();
            if (error) throw error;
            if (data.sessionId) currentSessionId = data.sessionId;
            appendMessage('ai', data.response);
        } catch (err) {
            document.getElementById(loadingId)?.remove();
            appendMessage('system', 'Error: ' + err.message);
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = role === 'user' ? 'flex justify-end mb-4' : 'flex justify-start mb-4';
        const innerClass = role === 'user' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700/50 text-slate-200';
        div.innerHTML = `<div class="${innerClass} rounded-xl p-3 max-w-[85%] text-sm">${escapeHtml(text)}</div>`;
        ui.aiChat.appendChild(div);
        ui.aiChat.scrollTop = ui.aiChat.scrollHeight;
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    if (ui.aiSendBtn) ui.aiSendBtn.onclick = sendMessage;
    if (ui.aiInput) ui.aiInput.onkeypress = (e) => { if(e.key==='Enter') sendMessage(); };
    if (ui.aiToggleBtn) ui.aiToggleBtn.onclick = () => ui.aiSidebar.style.width = '20rem';
    if (ui.closeAiSidebar) ui.closeAiSidebar.onclick = () => ui.aiSidebar.style.width = '0';

    // 3. UI, SAVE & HISTORY
    if (ui.saveBtn) {
        ui.saveBtn.onclick = async () => {
            const original = ui.saveBtn.innerHTML;
            ui.saveBtn.disabled = true; ui.saveBtn.textContent = 'Guardando...';
            try {
                const updates = { title: ui.title.value, content: ui.content.value, description: ui.notes.value, updated_at: new Date().toISOString() };
                await supabase.from('prompts').update(updates).eq('id', promptId);
                // Version
                const { data: v } = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', promptId).order('version_number', {ascending:false}).limit(1);
                const nextV = (v && v.length) ? v[0].version_number + 1 : 1;
                await supabase.from('prompt_versions').insert([{ prompt_id: promptId, version_number: nextV, content: ui.content.value }]);
                ui.headerTitle.textContent = updates.title;
                alert('✅ Guardado');
            } catch (e) { alert(e.message); } finally { ui.saveBtn.disabled = false; ui.saveBtn.innerHTML = original; }
        };
    }

    if (ui.historyBtn) {
        ui.historyBtn.onclick = async () => {
            ui.historyModal.classList.remove('hidden'); ui.historyModal.classList.add('flex');
            ui.historyList.innerHTML = 'Cargando...';
            try {
                const { data } = await supabase.from('prompt_versions').select('*').eq('prompt_id', promptId).order('version_number', {ascending:false});
                
                if (!data || data.length === 0) {
                    ui.historyList.innerHTML = '<p class="text-slate-500 text-center py-4">No hay versiones guardadas.</p>';
                    return;
                }

                ui.historyList.innerHTML = ''; // Limpiar
                data.forEach(v => {
                    const el = document.createElement('div');
                    el.className = 'p-3 bg-slate-950/50 rounded-xl mb-2 flex justify-between items-center border border-slate-800';
                    el.innerHTML = `
                        <div>
                            <span class="text-indigo-400 font-mono text-sm">v${v.version_number}</span>
                            <span class="text-slate-500 text-xs ml-2">${new Date(v.created_at).toLocaleString()}</span>
                        </div>
                    `;
                    const restoreBtn = document.createElement('button');
                    restoreBtn.className = 'text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors';
                    restoreBtn.textContent = 'Restaurar';
                    restoreBtn.onclick = () => {
                        ui.content.value = v.content; // Asignación directa segura
                        ui.historyModal.classList.add('hidden');
                        ui.historyModal.classList.remove('flex');
                        alert(`Versión v${v.version_number} restaurada. Haz clic en Guardar para aplicar cambios.`);
                    };
                    el.appendChild(restoreBtn);
                    ui.historyList.appendChild(el);
                });
            } catch (e) {
                console.error(e);
                ui.historyList.innerHTML = '<p class="text-red-400 text-center">Error cargando historial.</p>';
            }
        };
    }
    
    if (ui.closeHistoryModal) {
        ui.closeHistoryModal.onclick = () => {
            ui.historyModal.classList.add('hidden');
            ui.historyModal.classList.remove('flex');
        };
    }

    ui.formatBtns.forEach(btn => {
        btn.onclick = () => {
            const format = btn.getAttribute('data-format');
            const start = ui.content.selectionStart, end = ui.content.selectionEnd;
            const text = ui.content.value, sel = text.substring(start, end) || 'texto';
            let res = sel;
            if (format === 'h1') res = `\n# ${sel}\n`;
            if (format === 'bold') res = `**${sel}**`;
            ui.content.value = text.substring(0, start) + res + text.substring(end);
            ui.content.focus();
        };
    });

    if (ui.deleteBtn) {
        ui.deleteBtn.onclick = () => { ui.deleteModal.classList.remove('hidden'); ui.deleteModal.classList.add('flex'); };
    }
    if (ui.cancelDelete) {
        ui.cancelDelete.onclick = () => { ui.deleteModal.classList.add('hidden'); ui.deleteModal.classList.remove('flex'); };
    }
    if (ui.confirmDelete) {
        ui.confirmDelete.onclick = async () => {
            const btn = ui.confirmDelete;
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Eliminando...';
            try {
                const { error } = await supabase.from('prompts').delete().eq('id', promptId);
                if (error) throw error;
                window.location.href = 'dashboard.html';
            } catch (e) {
                alert('Error al eliminar: ' + e.message);
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }
    // 4. FAVORITE & SHARE (Implemented)
    if (ui.favoriteBtn) {
        ui.favoriteBtn.onclick = async () => {
            isFavorite = !isFavorite;
            updateFavoriteUI();
            try {
                await supabase.from('prompts').update({ is_favorite: isFavorite }).eq('id', promptId);
            } catch (e) {
                console.error('Error updating favorite:', e);
                isFavorite = !isFavorite; // Revert on error
                updateFavoriteUI();
            }
        };
    }

    // 4. SHARE & PUBLIC VISIBILITY LOGIC (Refactored)
    
    // --- Lógica de Publicar (Comunidad) ---
    const publicToggleBtn = document.getElementById('public-toggle-btn');
    const publicToggleDot = document.getElementById('public-toggle-dot');

    if (publicToggleBtn) {
        publicToggleBtn.onclick = async () => {
            isPublic = !isPublic;
            updatePublicUI(isPublic);
            try {
                await supabase.from('prompts').update({ is_public: isPublic }).eq('id', promptId);
                console.log(`Visibilidad actualizada: ${isPublic ? 'Público' : 'Privado'}`);
            } catch (e) {
                console.error('Error updating public status:', e);
                isPublic = !isPublic; // Revert
                updatePublicUI(isPublic);
                alert('Error al actualizar visibilidad.');
            }
        };
    }

    // --- Lógica de Compartir Privado (Username) ---
    const shareModal = document.getElementById('share-modal');
    const closeShare = document.getElementById('close-share-modal');
    const shareSubmit = document.getElementById('share-submit');
    const shareInput = document.getElementById('share-username');
    const sharePermission = document.getElementById('share-permission');

    if (document.getElementById('share-btn')) {
        document.getElementById('share-btn').onclick = () => {
            shareModal.classList.remove('hidden');
            shareModal.classList.add('flex');
            updatePublicUI(isPublic); // Asegurar que el toggle muestre el estado correcto al abrir
        };
    }
    
    if (closeShare) {
        closeShare.onclick = () => {
            shareModal.classList.add('hidden');
            shareModal.classList.remove('flex');
        };
    }

    if (shareSubmit) {
        shareSubmit.onclick = async () => {
            const targetUsername = shareInput.value.trim().replace('@', ''); // Quitar @ si lo ponen
            const permission = sharePermission.value;

            if (!targetUsername) {
                alert('Por favor ingresa un nombre de usuario.');
                return;
            }

            shareSubmit.disabled = true;
            shareSubmit.textContent = 'Buscando...';

            try {
                // 1. Buscar usuario por username
                const { data: userProfile, error: userError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', targetUsername)
                    .single();

                if (userError || !userProfile) {
                    throw new Error('Usuario no encontrado. Verifica el nombre de usuario.');
                }

                // 2. Verificar si ya está compartido
                const { data: existing } = await supabase
                    .from('prompt_shares')
                    .select('id')
                    .eq('prompt_id', promptId)
                    .eq('shared_with', userProfile.id)
                    .single();

                if (existing) {
                    throw new Error(`Este prompt ya está compartido con @${targetUsername}.`);
                }

                // 3. Insertar en prompt_shares
                const { error: shareError } = await supabase
                    .from('prompt_shares')
                    .insert([{
                        prompt_id: promptId,
                        shared_with: userProfile.id,
                        shared_by: session.user.id,
                        permission: permission
                    }]);

                if (shareError) throw shareError;

                alert(`✅ ¡Invitación enviada a @${targetUsername}!`);
                shareInput.value = ''; // Limpiar input

            } catch (e) {
                alert('❌ ' + e.message);
            } finally {
                shareSubmit.disabled = false;
                shareSubmit.textContent = 'Enviar Invitación';
            }
        };
    }
})();