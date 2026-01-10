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

    const promptId = new URLSearchParams(window.location.search).get('id');
    const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';
    
    let supabase = null;
    let currentSessionId = null;

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

    if (promptId) loadData();

    async function loadData() {
        try {
            const { data: prompt, error } = await supabase.from('prompts').select(`*, categories(name), ai_types(name, icon_svg, slug)`).eq('id', promptId).single();
            if (error) throw error;
            ui.title.value = prompt.title || '';
            ui.content.value = prompt.content || '';
            ui.notes.value = prompt.description || '';
            ui.headerTitle.textContent = prompt.title || 'Sin Título';
            ui.headerBadge.textContent = prompt.categories?.name || 'General';
            
            if(ui.icon && prompt.ai_types) {
                const slug = prompt.ai_types.slug?.toLowerCase();
                const colors = { 'chatgpt': 'bg-emerald-500', 'midjourney': 'bg-indigo-500', 'claude': 'bg-orange-500', 'gemini': 'bg-blue-500', 'dalle': 'bg-teal-500', 'stable-diffusion': 'bg-orange-600', 'deepseek': 'bg-blue-700', 'grok': 'bg-gray-900', 'copilot': 'bg-sky-600' };
                ui.icon.className = `w-10 h-10 rounded-xl flex items-center justify-center ${colors[slug] || 'bg-slate-700'}`;
                if (prompt.ai_types.icon_svg) {
                    let svg = prompt.ai_types.icon_svg;
                    if(svg.includes('<svg') && !svg.includes('w-')) svg = svg.replace('<svg', '<svg class="w-6 h-6 text-white"');
                    ui.icon.innerHTML = svg;
                }
            }
        } catch (e) { console.error(e); }
    }

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
            const { data } = await supabase.from('prompt_versions').select('*').eq('prompt_id', promptId).order('version_number', {ascending:false});
            ui.historyList.innerHTML = data?.length ? data.map(v => `
                <div class="p-3 bg-slate-950/50 rounded-xl mb-2 flex justify-between items-center">
                    <span class="text-xs text-indigo-400">v${v.version_number}</span>
                    <button onclick="document.getElementById('prompt-content').value='${v.content.replace(/'/g,"\\'").replace(/\n/g,"\\n")}';alert('Restaurado. Guarda para aplicar.');" class="text-[10px] bg-slate-800 px-2 py-1 rounded">Restaurar</button>
                </div>
            `).join('') : 'Sin historial';
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

    if (ui.deleteBtn) ui.deleteBtn.onclick = () => { ui.deleteModal.classList.remove('hidden'); ui.deleteModal.classList.add('flex'); };
    if (ui.cancelDelete) ui.cancelDelete.onclick = () => ui.deleteModal.classList.add('hidden');
    if (ui.confirmDelete) ui.confirmDelete.onclick = async () => {
        await supabase.from('prompts').delete().eq('id', promptId);
        window.location.href = 'dashboard.html';
    };
})();