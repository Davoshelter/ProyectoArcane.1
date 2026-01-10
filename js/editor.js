/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR v10.0 (Step-by-Step Build)
   ═══════════════════════════════════════════════════════════════════════════ */

(async function () {
    'use strict';
    console.log('🔧 Editor v10.0: Iniciando base...');

    // 1. Elementos UI
    const ui = {
        title: document.getElementById('prompt-title'),
        content: document.getElementById('prompt-content'),
        notes: document.getElementById('prompt-notes'),
        saveBtn: document.getElementById('save-btn'),
        headerTitle: document.getElementById('prompt-title-display'),
        headerBadge: document.getElementById('prompt-category-badge'),
        lastEdit: document.getElementById('prompt-last-edit'),
        icon: document.getElementById('prompt-icon'),
        formatBtns: document.querySelectorAll('.format-btn'),
        insertCodeBtn: document.getElementById('insert-code-block'),
        copyCodeBtn: document.getElementById('copy-code-btn'),
        historyBtn: document.getElementById('history-btn'),
        historyModal: document.getElementById('history-modal'),
        closeHistoryModal: document.getElementById('close-history-modal'),
        tagsContainer: document.getElementById('tags-container'),
        addTagBtn: document.getElementById('add-tag-btn')
    };

    const promptId = new URLSearchParams(window.location.search).get('id');
    const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';
    
    let supabase = null;

    // 2. Carga Robusta
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
                    console.warn('⚠️ Inyectando respaldo...');
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
                    document.head.appendChild(script);
                }
                if (attempts > 100) { clearInterval(interval); resolve(null); }
            }, 100);
        });
    }

    supabase = await waitForSupabase();

    if (!supabase) { alert('Error crítico: Supabase no cargó.'); return; }

    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'auth-login.html'; return; }

    // Sidebar Update
    if (window.updateSidebarUser) {
         const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         window.updateSidebarUser({ email: session.user.email, username: profile?.username, avatar_url: profile?.avatar_url });
    }

    if (promptId) {
        loadData();
    } else {
        alert('Falta ID'); window.location.href = 'dashboard.html';
    }

    // 3. Cargar Datos
    async function loadData() {
        ui.headerTitle.textContent = 'Cargando...';
        try {
            const { data: prompt, error } = await supabase
                .from('prompts')
                .select(`*, categories(name), ai_types(name, icon_svg, slug)`)
                .eq('id', promptId)
                .single();

            if (error) throw error;

            // UI Update
            if(ui.title) ui.title.value = prompt.title || '';
            if(ui.content) ui.content.value = prompt.content || '';
            if(ui.notes) ui.notes.value = prompt.description || '';
            
            if(ui.headerTitle) ui.headerTitle.textContent = prompt.title || 'Sin Título';
            if(ui.headerBadge) ui.headerBadge.textContent = prompt.categories?.name || 'General';
            
            if(ui.lastEdit) {
                const d = new Date(prompt.updated_at);
                ui.lastEdit.textContent = `Guardado: ${d.toLocaleString()}`;
            }

            // Icono
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

    // 4. Guardar
    if (ui.saveBtn) {
        ui.saveBtn.onclick = async () => {
            const originalHTML = ui.saveBtn.innerHTML;
            ui.saveBtn.disabled = true;
            ui.saveBtn.innerHTML = 'Guardando...';

            try {
                const { error } = await supabase.from('prompts').update({
                    title: ui.title.value,
                    content: ui.content.value,
                    description: ui.notes.value,
                    updated_at: new Date().toISOString()
                }).eq('id', promptId);

                if (error) throw error;

                // Version
                try {
                    const { data: v } = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', promptId).order('version_number', {ascending:false}).limit(1);
                    const nextV = (v && v.length) ? v[0].version_number + 1 : 1;
                    await supabase.from('prompt_versions').insert([{ prompt_id: promptId, version_number: nextV, content: ui.content.value }]);
                } catch(ve) { console.warn('Version error:', ve); }

                ui.headerTitle.textContent = ui.title.value;
                if(ui.lastEdit) ui.lastEdit.textContent = 'Guardado ahora';
                
                const t = document.createElement('div');
                t.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
                t.textContent = '✅ Guardado';
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 2500);

            } catch (e) { alert('Error: ' + e.message); } 
            finally { ui.saveBtn.disabled = false; ui.saveBtn.innerHTML = originalHTML; }
        };
    }

    // 5. UI Logic
    ui.formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.getAttribute('data-format');
            if (!ui.content) return;
            const start = ui.content.selectionStart;
            const end = ui.content.selectionEnd;
            const text = ui.content.value;
            const selectedText = text.substring(start, end) || 'texto';
            let formattedText = selectedText;
            let cursorOffset = 0;
            switch (format) {
                case 'h1': formattedText = `\n# ${selectedText}\n`; cursorOffset = 3; break;
                case 'h2': formattedText = `\n## ${selectedText}\n`; cursorOffset = 4; break;
                case 'bold': formattedText = `**${selectedText}**`; cursorOffset = 2; break;
                case 'italic': formattedText = `*${selectedText}*`; cursorOffset = 1; break;
                case 'code': formattedText = `\`${selectedText}\``; cursorOffset = 1; break;
                case 'list': formattedText = `\n- ${selectedText}`; cursorOffset = 3; break;
            }
            ui.content.value = text.substring(0, start) + formattedText + text.substring(end);
            ui.content.focus();
        });
    });

    if (ui.historyBtn) {
        ui.historyBtn.addEventListener('click', () => {
            ui.historyModal.classList.remove('hidden');
            ui.historyModal.classList.add('flex');
            if (window.PromptHub?.VersionHistory) window.PromptHub.VersionHistory.render(promptId);
        });
    }
    if (ui.closeHistoryModal) {
        ui.closeHistoryModal.addEventListener('click', () => {
            ui.historyModal.classList.add('hidden');
            ui.historyModal.classList.remove('flex');
        });
    }
})();
