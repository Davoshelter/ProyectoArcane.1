/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR COMPLETE v8.0 (Step-by-Step)
   ═══════════════════════════════════════════════════════════════════════════ */

(async function () {
    'use strict';
    console.log('🤖 Editor v8.0: Iniciando...');

    const ui = {
        title: document.getElementById('prompt-title'),
        // content: document.getElementById('prompt-content'), // Reemplazado por EasyMDE
        notes: document.getElementById('prompt-notes'),
        saveBtn: document.getElementById('save-btn'),
        headerTitle: document.getElementById('prompt-title-display'),
        headerBadges: document.querySelectorAll('.prompt-category-label'),
        lastEditLabels: document.querySelectorAll('.prompt-last-edit-label'),
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
        // formatBtns: document.querySelectorAll('.format-btn'), // Eliminado
        aiToggleBtn: document.getElementById('ai-toggle-btn'),
        aiSidebar: document.getElementById('ai-sidebar'),
        closeAiSidebar: document.getElementById('close-ai-sidebar'),
        aiInput: document.getElementById('ai-input'),
        aiSendBtn: document.getElementById('ai-send'),
        aiChat: document.getElementById('ai-chat'),
        editorContainer: document.getElementById('editor-container')
    };

    // --- LOADING OVERLAY ---
    function toggleLoading(show) {
        const loader = document.getElementById('editor-loader');
        if (!loader) return;

        if (show) {
            loader.style.opacity = '1';
            loader.style.pointerEvents = 'all';
            loader.classList.remove('hidden');
        } else {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(() => loader.classList.add('hidden'), 500); // Ocultar del DOM tras transición
        }
    }

    // Auto-ajuste del título
    if (ui.title) {
        ui.title.oninput = function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        };
    }

    const promptId = new URLSearchParams(window.location.search).get('id');
    const fromSource = new URLSearchParams(window.location.search).get('from');

    // Lógica del botón Atrás (Volver a la fuente original)
    const backBtn = document.getElementById('back-btn');
    if (backBtn && fromSource) {
        if (fromSource === 'favorites') {
            backBtn.href = 'favorites.html';
        } else if (fromSource === 'my-prompts') {
            backBtn.href = 'my-prompts.html';
        } else if (fromSource === 'shared') {
            backBtn.href = 'shared.html';
        } else if (fromSource === 'public') {
            backBtn.href = 'public-notes.html';
        }
    }

    // Ya no necesitamos URLs harcodeadas si usamos supabase-client.js

    let supabase = null;
    let currentSessionId = null;
    let currentUserSession = null; // Variable global para la sesión
    let isFavorite = false;
    let isPublic = false;
    let easyMDE = null;

    // --- EASYMDE INITIALIZATION ---
    if (document.getElementById('prompt-content')) {
        easyMDE = new EasyMDE({
            element: document.getElementById('prompt-content'),
            spellChecker: false,
            autosave: { enabled: false },
            toolbar: ["bold", "italic", "heading", "|", "code", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "|", "guide"],
            status: false,
            placeholder: "Escribe tu prompt aquí...",
            styleSelectedText: false,
            renderingConfig: {
                singleLineBreaks: false,
                codeSyntaxHighlighting: true,
            },
        });
    }

    // --- FUNCIONES DE ACTUALIZACIÓN DE UI (Globales al script) ---
    function updateFavoriteUI() {
        const btn = document.getElementById('favorite-btn');
        if (!btn) return;

        const icon = btn.querySelector('svg');
        const path = icon?.querySelector('path');

        if (isFavorite) {
            // Activo (Amarillo y relleno)
            btn.classList.add('text-amber-400');
            btn.classList.remove('text-slate-400', 'hover:text-amber-400'); // Quitar hover para mantener color fijo
            if (icon) icon.setAttribute('fill', 'currentColor');
        } else {
            // Inactivo (Gris y contorno)
            btn.classList.remove('text-amber-400');
            btn.classList.add('text-slate-400', 'hover:text-amber-400');
            if (icon) icon.setAttribute('fill', 'none');
        }
        console.log('⭐ UI Favorito actualizada:', isFavorite);
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

    // 1. Carga Robusta (Espera hasta que Supabase esté listo)
    async function initEditor() {
        console.log('⏳ Editor: Esperando inicialización de Supabase...');

        const checkSupabase = setInterval(async () => {
            // Intentar obtener cliente
            let client = window.supabaseClient;
            if (!client && window.initSupabase) client = window.initSupabase();

            if (client) {
                clearInterval(checkSupabase);
                supabase = client;
                console.log('✅ Editor: Supabase conectado');

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    console.warn('⚠️ Sin sesión activa. Redirigiendo...');
                    window.location.href = 'auth-login.html';
                    return;
                }

                // Guardar sesión globalmente
                currentUserSession = session;

                // Cargar datos inmediatamente pasando el cliente
                if (promptId) await loadData(supabase);

                // --- ASIGNAR EVENTOS DE FORMA SEGURA ---
                setupEventListeners();

                // Notificar Sidebar
                if (window.updateSidebarUser) {
                    supabase.from('profiles').select('*').eq('id', session.user.id).single()
                        .then(({ data: p }) => {
                            // PRIORIDAD DE VISUALIZACIÓN: Full Name > Username
                            const displayName = p?.full_name
                                || p?.username
                                || session.user.user_metadata?.full_name
                                || session.user.user_metadata?.name
                                || session.user.user_metadata?.username
                                || session.user.email.split('@')[0];

                            window.updateSidebarUser({
                                email: session.user.email,
                                username: displayName,
                                avatar_url: p?.avatar_url || session.user.user_metadata?.avatar_url
                            });
                        });
                }
            }
        }, 100); // Revisar cada 100ms

        // Timeout de seguridad: si en 10s no carga, error
        setTimeout(() => {
            if (!supabase) {
                clearInterval(checkSupabase);
                console.error('❌ Timeout: Supabase no cargó en 10 segundos');
                toggleLoading(false);
                safeShowToast('Error de conexión con el servidor', 'error');
            }
        }, 10000);
    }

    function setupEventListeners() {
        console.log('🎮 Configurando eventos de botones...');

        const btnFavorite = document.getElementById('favorite-btn');
        const btnShare = document.getElementById('share-btn');
        const btnConnect = document.getElementById('connect-btn');
        const btnSave = document.getElementById('save-btn');
        const btnDelete = document.getElementById('delete-btn');
        const btnHistory = document.getElementById('history-btn');
        const btnAI = document.getElementById('ai-toggle-btn');

        if (btnFavorite) {
            console.log('⭐ Botón favorito detectado');
            btnFavorite.onclick = handleFavoriteClick;
        }

        if (btnShare) btnShare.onclick = () => {
            const modal = document.getElementById('share-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                updatePublicUI(isPublic);
                if (typeof loadSharedUsers === 'function') loadSharedUsers();
            }
        };

        if (btnConnect) btnConnect.onclick = () => {
            const modal = document.getElementById('connect-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.getElementById('connect-search')?.focus();
                searchPromptsToConnect('');
            }
        };

        if (btnSave) btnSave.onclick = handleSaveClick;

        if (btnDelete) btnDelete.onclick = () => {
            const modal = document.getElementById('delete-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        };

        if (btnHistory) btnHistory.onclick = handleHistoryClick;

        if (btnAI) btnAI.onclick = () => {
            if (ui.aiSidebar) ui.aiSidebar.style.width = '20rem';
        };
    }

    // Iniciar
    initEditor();

    // --- UTILS ---
    function safeShowToast(msg, type) {
        if (window.showToast) {
            window.showToast(msg, type);
        } else {
            console.log(`[Toast Fallback] ${type}: ${msg}`);
            // Fallback simple visual si showToast no está listo
            const fallback = document.createElement('div');
            fallback.textContent = msg;
            fallback.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:10px;border-radius:5px;z-index:9999;';
            document.body.appendChild(fallback);
            setTimeout(() => fallback.remove(), 3000);
        }
    }

    // --- CARGA DE DATOS UNIFICADA ---
    async function loadData(client) {
        if (!promptId || !client) {
            console.warn('⚠️ loadData: Falta ID o cliente');
            toggleLoading(false);
            return;
        }
        toggleLoading(true);
        console.log('🔍 loadData: Iniciando para ID:', promptId);

        try {
            const { data: prompt, error } = await client
                .from('prompts')
                .select(`*, categories(name), ai_types(name, icon_svg, slug)`)
                .eq('id', promptId)
                .single();

            if (error) throw error;
            console.log('📦 loadData: Datos recibidos', prompt);

            // --- VERIFICACIÓN DE PERMISOS ---
            const currentUserId = currentUserSession.user.id;
            const isOwner = prompt.user_id === currentUserId;
            let canEdit = isOwner;

            if (!isOwner) {
                // Verificar si es compartido y qué permisos tiene
                const { data: shareData } = await client
                    .from('prompt_shares')
                    .select('permission')
                    .eq('prompt_id', promptId)
                    .eq('shared_with', currentUserId)
                    .single();

                if (shareData) {
                    console.log('👀 Modo Compartido. Permiso:', shareData.permission);
                    canEdit = (shareData.permission === 'edit');
                } else {
                    console.warn('⚠️ No es dueño ni tiene share explícito. Asumiendo solo lectura (o público).');
                    canEdit = false;
                }
            }

            // Aplicar modo solo lectura si es necesario
            if (!canEdit) {
                setReadOnlyMode();
            }

            // 1. Campos de Texto
            if (ui.title) {
                ui.title.value = prompt.title || '';
                if (!canEdit) ui.title.disabled = true; // Deshabilitar si solo lectura
                // Ajustar altura automáticamente al cargar
                ui.title.style.height = 'auto';
                ui.title.style.height = (ui.title.scrollHeight) + 'px';
            }

            if (easyMDE) {
                console.log('📝 loadData: Seteando EasyMDE');
                easyMDE.value(prompt.content || '');
                if (!canEdit) {
                    // easyMDE.toggleReadOnly() puede fallar en algunas versiones
                    if (easyMDE.codemirror) {
                        easyMDE.codemirror.setOption('readOnly', true);
                    }
                }

                // Activar Vista Previa por defecto PARA TODOS
                // Así se ve "renderizado" al entrar, pero se puede editar quitando la vista previa (si tienes permisos)
                setTimeout(() => {
                    if (easyMDE.togglePreview && !easyMDE.isPreviewActive()) {
                        easyMDE.togglePreview();
                    }

                    // Si es solo lectura, limpiamos la toolbar.
                    if (!canEdit) {
                        const toolbar = document.querySelector('.editor-toolbar');
                        if (toolbar) {
                            const buttons = toolbar.querySelectorAll('a, button');
                            buttons.forEach(btn => {
                                if (!btn.classList.contains('preview')) {
                                    btn.style.display = 'none';
                                }
                            });
                            const separators = toolbar.querySelectorAll('.separator');
                            separators.forEach(s => s.style.display = 'none');
                        }
                    } else {
                        // Si es editor (Owner), nos aseguramos de que el Side-by-Side NO esté activo (revertir lo anterior)
                        if (easyMDE.toggleSideBySide && easyMDE.isSideBySideActive()) {
                            easyMDE.toggleSideBySide();
                        }
                        // Asegurar altura
                        if (easyMDE.codemirror) {
                            easyMDE.codemirror.setSize(null, "auto");
                        }

                        // IMPLEMENTACIÓN "CLICK TO EDIT":
                        // Si el usuario hace click en la vista previa, pasamos a modo edición automáticamente
                        const previewEl = document.querySelector('.editor-preview');
                        if (previewEl) {
                            previewEl.setAttribute('title', 'Haz click para editar');
                            previewEl.style.cursor = 'text';
                            previewEl.onclick = function () {
                                if (easyMDE.isPreviewActive()) {
                                    easyMDE.togglePreview(); // Volver a modo edición
                                    safeShowToast('✏️ Modo Edición activado', 'info');
                                }
                            };
                        }
                    }
                }, 100);
            } else {
                console.warn('⚠️ loadData: EasyMDE no está listo, usando fallback');
                const contentArea = document.getElementById('prompt-content');
                if (contentArea) {
                    contentArea.value = prompt.content || '';
                    if (!canEdit) contentArea.disabled = true;
                }
            }

            if (ui.notes) {
                ui.notes.value = prompt.description || '';
                if (!canEdit) ui.notes.disabled = true;
            }

            // 2. Header & Badges
            if (ui.headerTitle) {
                ui.headerTitle.textContent = prompt.title || 'Sin Título';
                // Añadir truncamiento visual si es muy largo para no romper el header
                ui.headerTitle.classList.add('truncate', 'max-w-[200px]', 'lg:max-w-[400px]');
            }
            if (ui.headerBadges) ui.headerBadges.forEach(b => b.textContent = prompt.categories?.name || 'General');

            // 3. Estado Favorito
            isFavorite = prompt.is_favorite;
            updateFavoriteUI();

            // 4. Estado Público (Toggle)
            isPublic = prompt.is_public;
            updatePublicUI(isPublic);

            // 5. Icono de IA
            if (prompt.ai_types) {
                const slug = prompt.ai_types.slug?.toLowerCase();
                const colors = { 'chatgpt': 'bg-emerald-500', 'midjourney': 'bg-indigo-500', 'claude': 'bg-orange-500', 'gemini': 'bg-blue-500', 'dalle': 'bg-teal-500', 'stable-diffusion': 'bg-orange-600', 'deepseek': 'bg-blue-700', 'grok': 'bg-gray-900', 'copilot': 'bg-sky-600' };

                if (ui.icon) {
                    ui.icon.className = `w-10 h-10 rounded-xl flex items-center justify-center ${colors[slug] || 'bg-slate-700'}`;
                    if (prompt.ai_types.icon_svg) {
                        let svg = prompt.ai_types.icon_svg;
                        if (svg.includes('<svg') && !svg.includes('w-')) svg = svg.replace('<svg', '<svg class="w-6 h-6 text-white"');
                        ui.icon.innerHTML = svg;
                    }
                }

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
            if (prompt.updated_at && ui.lastEditLabels) {
                const dateStr = new Date(prompt.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                ui.lastEditLabels.forEach(l => l.textContent = dateStr);
            }

            console.log('✅ loadData: Completado con éxito');

            // Cargar conexiones (Segundo Cerebro)
            if (typeof loadConnections === 'function') loadConnections();

        } catch (e) {
            console.error('❌ Error CRÍTICO en loadData:', e);
            safeShowToast('Error al cargar la nota', 'error');
        } finally {
            console.log('🔓 loadData: Liberando loader');
            toggleLoading(false);
        }
    }

    // --- HELPER PARA MODO SOLO LECTURA ---
    function setReadOnlyMode() {
        console.log('🔒 Activando modo SOLO LECTURA');

        // Deshabilitar Botón Guardar
        if (ui.saveBtn) {
            ui.saveBtn.disabled = true;
            ui.saveBtn.textContent = 'Solo Lectura';
            ui.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            ui.saveBtn.onclick = null; // Quitar evento click
        }

        // Ocultar Botón Eliminar
        if (ui.deleteBtn) {
            ui.deleteBtn.classList.add('hidden');
        }

        // Ocultar opciones de compartir/público si no es dueño (opcional, pero recomendado)
        const publicSection = document.getElementById('public-toggle-btn')?.parentElement;
        if (publicSection) publicSection.style.pointerEvents = 'none'; // Deshabilitar toggle

        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) shareBtn.classList.add('hidden'); // Ocultar botón compartir

        safeShowToast('👁️ Modo Vista: No tienes permisos para editar', 'info');
    }

    // loadData ya no se llama automáticamente aquí, se llama desde initEditor


    // --- EVENT HANDLERS ---
    async function handleFavoriteClick() {
        console.log('⭐ Clic en favorito detectado');
        isFavorite = !isFavorite;
        updateFavoriteUI();
        try {
            const { error } = await supabase
                .from('prompts')
                .update({ is_favorite: isFavorite })
                .eq('id', promptId);

            if (error) throw error;
            console.log('✅ Favorito guardado en DB:', isFavorite);
            safeShowToast(isFavorite ? 'Añadido a favoritos' : 'Quitado de favoritos');
        } catch (e) {
            console.error('❌ Error updating favorite:', e);
            isFavorite = !isFavorite;
            updateFavoriteUI();
            safeShowToast('Error al actualizar favorito', 'error');
        }
    }

    async function handleSaveClick() {
        const original = ui.saveBtn.innerHTML;
        ui.saveBtn.disabled = true; ui.saveBtn.textContent = 'Guardando...';
        try {
            const contentVal = easyMDE ? easyMDE.value() : document.getElementById('prompt-content').value;
            const updates = { title: ui.title.value, content: contentVal, description: ui.notes.value, updated_at: new Date().toISOString() };
            await supabase.from('prompts').update(updates).eq('id', promptId);
            // Version
            const { data: v } = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', promptId).order('version_number', { ascending: false }).limit(1);
            const nextV = (v && v.length) ? v[0].version_number + 1 : 1;
            await supabase.from('prompt_versions').insert([{ prompt_id: promptId, version_number: nextV, content: contentVal }]);
            ui.headerTitle.textContent = updates.title;
            safeShowToast('✅ Cambios guardados');
        } catch (e) { safeShowToast(e.message, 'error'); } finally { ui.saveBtn.disabled = false; ui.saveBtn.innerHTML = original; }
    }

    async function handleHistoryClick() {
        ui.historyModal.classList.remove('hidden'); ui.historyModal.classList.add('flex');
        ui.historyList.innerHTML = 'Cargando...';
        try {
            const { data } = await supabase.from('prompt_versions').select('*').eq('prompt_id', promptId).order('version_number', { ascending: false });

            if (!data || data.length === 0) {
                ui.historyList.innerHTML = '<p class="text-slate-500 text-center py-4">No hay versiones guardadas.</p>';
                return;
            }

            ui.historyList.innerHTML = '';
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
                    if (easyMDE) easyMDE.value(v.content);
                    ui.historyModal.classList.add('hidden');
                    ui.historyModal.classList.remove('flex');
                    safeShowToast(`Versión v${v.version_number} restaurada. Dale a Guardar.`);
                };
                el.appendChild(restoreBtn);
                ui.historyList.appendChild(el);
            });
        } catch (e) {
            console.error(e);
            ui.historyList.innerHTML = '<p class="text-red-400 text-center">Error cargando historial.</p>';
        }
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
    if (ui.aiInput) ui.aiInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    if (ui.aiToggleBtn) ui.aiToggleBtn.onclick = () => ui.aiSidebar.style.width = '20rem';
    if (ui.closeAiSidebar) ui.closeAiSidebar.onclick = () => ui.aiSidebar.style.width = '0';

    // 3. UI, SAVE & HISTORY
    if (ui.saveBtn) {
        ui.saveBtn.onclick = async () => {
            const original = ui.saveBtn.innerHTML;
            ui.saveBtn.disabled = true; ui.saveBtn.textContent = 'Guardando...';
            try {
                const contentVal = easyMDE ? easyMDE.value() : document.getElementById('prompt-content').value;
                const updates = { title: ui.title.value, content: contentVal, description: ui.notes.value, updated_at: new Date().toISOString() };
                await supabase.from('prompts').update(updates).eq('id', promptId);
                // Version
                const { data: v } = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', promptId).order('version_number', { ascending: false }).limit(1);
                const nextV = (v && v.length) ? v[0].version_number + 1 : 1;
                await supabase.from('prompt_versions').insert([{ prompt_id: promptId, version_number: nextV, content: contentVal }]);
                ui.headerTitle.textContent = updates.title;
                showToast('✅ Cambios guardados');
            } catch (e) { showToast(e.message, 'error'); } finally { ui.saveBtn.disabled = false; ui.saveBtn.innerHTML = original; }
        };
    }

    if (ui.historyBtn) {
        ui.historyBtn.onclick = async () => {
            ui.historyModal.classList.remove('hidden'); ui.historyModal.classList.add('flex');
            ui.historyList.innerHTML = 'Cargando...';
            try {
                const { data } = await supabase.from('prompt_versions').select('*').eq('prompt_id', promptId).order('version_number', { ascending: false });

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
                        if (easyMDE) easyMDE.value(v.content);
                        ui.historyModal.classList.add('hidden');
                        ui.historyModal.classList.remove('flex');
                        showToast(`Versión v${v.version_number} restaurada. Dale a Guardar.`);
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
                showToast('Error al eliminar: ' + e.message, 'error');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }
    // 4. FAVORITE & SHARE (Implemented)
    if (ui.favoriteBtn) {
        ui.favoriteBtn.onclick = async () => {
            isFavorite = !isFavorite;
            updateFavoriteUI(); // Actualizar visualmente de inmediato
            try {
                const { error } = await supabase
                    .from('prompts')
                    .update({ is_favorite: isFavorite })
                    .eq('id', promptId);

                if (error) throw error;
                console.log('✅ Favorito guardado en DB:', isFavorite);
                safeShowToast(isFavorite ? 'Añadido a favoritos' : 'Quitado de favoritos');
            } catch (e) {
                console.error('❌ Error updating favorite:', e);
                isFavorite = !isFavorite; // Revertir visualmente si falla
                updateFavoriteUI();
                safeShowToast('Error al actualizar favorito', 'error');
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
                showToast(isPublic ? 'Nota publicada en la comunidad' : 'Nota ahora es privada');
            } catch (e) {
                console.error('Error updating public status:', e);
                isPublic = !isPublic; // Revert
                updatePublicUI(isPublic);
                showToast('Error al actualizar visibilidad', 'error');
            }
        };
    }

    // --- Lógica de Compartir Privado (Username) ---
    const shareModal = document.getElementById('share-modal');
    const closeShare = document.getElementById('close-share-modal');
    const shareSubmit = document.getElementById('share-submit');
    const shareInput = document.getElementById('share-username');
    const sharePermission = document.getElementById('share-permission');
    const sharedUsersContainer = document.getElementById('shared-users-container');
    const sharedUsersList = document.getElementById('shared-users-list');

    async function loadSharedUsers() {
        if (!promptId || !supabase) return;

        console.log('🔄 Cargando usuarios compartidos...');
        try {
            const { data: shares, error } = await supabase
                .from('prompt_shares')
                .select('id, permission, profiles:shared_with(username, avatar_url)')
                .eq('prompt_id', promptId);

            if (error) {
                console.error('❌ Error RLS/DB al cargar compartidos:', error);
                throw error;
            }

            console.log('👥 Usuarios compartidos encontrados:', shares);

            if (shares && shares.length > 0) {
                sharedUsersContainer.classList.remove('hidden');
                sharedUsersList.innerHTML = shares.map(share => `
                    <div class="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs text-indigo-300 font-bold">
                                ${share.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm text-slate-300">@${share.profiles?.username}</span>
                                <span class="text-[10px] text-slate-500">${share.permission === 'edit' ? 'Puede editar' : 'Solo ver'}</span>
                            </div>
                        </div>
                        <button onclick="revokeAccess('${share.id}')" class="text-slate-500 hover:text-red-400 p-1 transition-colors" title="Revocar acceso">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                `).join('');
            } else {
                sharedUsersContainer.classList.add('hidden');
                sharedUsersList.innerHTML = '';
            }
        } catch (e) {
            console.error('Error loading shared users:', e);
        }
    }

    // Exponer revokeAccess globalmente para que funcione el onclick
    let shareIdToRevoke = null;
    window.revokeAccess = (shareId) => {
        shareIdToRevoke = shareId;
        const modal = document.getElementById('revoke-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    // Botones del modal de revocar
    const confirmRevokeBtn = document.getElementById('confirm-revoke-btn');
    const cancelRevokeBtn = document.getElementById('cancel-revoke-btn');
    const revokeModal = document.getElementById('revoke-modal');

    if (confirmRevokeBtn) {
        confirmRevokeBtn.onclick = async () => {
            if (!shareIdToRevoke) return;

            confirmRevokeBtn.disabled = true;
            confirmRevokeBtn.textContent = 'Revocando...';

            try {
                const { error } = await supabase
                    .from('prompt_shares')
                    .delete()
                    .eq('id', shareIdToRevoke);

                if (error) throw error;

                safeShowToast('Acceso revocado');
                if (revokeModal) {
                    revokeModal.classList.add('hidden');
                    revokeModal.classList.remove('flex');
                }
                loadSharedUsers(); // Recargar lista
            } catch (e) {
                safeShowToast('Error al revocar: ' + e.message, 'error');
            } finally {
                confirmRevokeBtn.disabled = false;
                confirmRevokeBtn.textContent = 'Sí, revocar';
                shareIdToRevoke = null;
            }
        };
    }

    if (cancelRevokeBtn) {
        cancelRevokeBtn.onclick = () => {
            if (revokeModal) {
                revokeModal.classList.add('hidden');
                revokeModal.classList.remove('flex');
            }
            shareIdToRevoke = null;
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
                showToast('Ingresa un nombre de usuario', 'info');
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
                    throw new Error('Usuario no encontrado');
                }

                // 2. Verificar si ya está compartido
                const { data: existing } = await supabase
                    .from('prompt_shares')
                    .select('id')
                    .eq('prompt_id', promptId)
                    .eq('shared_with', userProfile.id)
                    .single();

                if (existing) {
                    throw new Error(`Ya compartido con @${targetUsername}`);
                }

                // 3. Insertar en prompt_shares
                const { error: shareError } = await supabase
                    .from('prompt_shares')
                    .insert([{
                        prompt_id: promptId,
                        shared_with: userProfile.id,
                        shared_by: currentUserSession.user.id,
                        permission: permission
                    }]);

                if (shareError) throw shareError;

                safeShowToast(`¡Invitación enviada a @${targetUsername}!`);
                shareInput.value = ''; // Limpiar input
                loadSharedUsers(); // Actualizar lista

            } catch (e) {
                safeShowToast(e.message, 'error');
            } finally {
                shareSubmit.disabled = false;
                shareSubmit.textContent = 'Enviar Invitación';
            }
        };
    }
    // --- CONNECTIONS LOGIC (Segundo Cerebro) ---
    const connectModal = document.getElementById('connect-modal');
    const closeConnectModal = document.getElementById('close-connect-modal');
    const connectSearch = document.getElementById('connect-search');
    const connectResults = document.getElementById('connect-results');
    const connectionsSection = document.getElementById('connections-section');
    const connectionsList = document.getElementById('connections-list');

    if (closeConnectModal) {
        closeConnectModal.onclick = () => {
            connectModal.classList.add('hidden');
            connectModal.classList.remove('flex');
        };
    }

    async function searchPromptsToConnect(term) {
        if (!supabase || !currentUserSession) return;

        try {
            let query = supabase
                .from('prompts')
                .select('id, title, categories(name)')
                .eq('user_id', currentUserSession.user.id)
                .neq('id', promptId) // No conectarse a sí mismo
                .order('title');

            if (term) query = query.ilike('title', `%${term}%`);

            const { data: prompts, error } = await query.limit(10);
            if (error) throw error;

            connectResults.innerHTML = '';
            if (prompts.length === 0) {
                connectResults.innerHTML = '<p class="text-center text-slate-500 py-4 text-sm">No se encontraron notas.</p>';
                return;
            }

            prompts.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left p-3 hover:bg-slate-700/50 rounded-xl transition-colors flex items-center justify-between group';
                btn.innerHTML = `
                    <div>
                        <p class="text-sm font-medium text-slate-200">${p.title || 'Sin título'}</p>
                        <p class="text-xs text-slate-500">${p.categories?.name || 'General'}</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                `;
                btn.onclick = () => createConnection(p.id);
                connectResults.appendChild(btn);
            });
        } catch (e) { console.error(e); }
    }

    async function createConnection(targetId) {
        try {
            const { error } = await supabase
                .from('prompt_connections')
                .insert([{
                    source_id: promptId,
                    target_id: targetId,
                    user_id: currentUserSession.user.id
                }]);

            if (error) {
                if (error.code === '23505') safeShowToast('Ya están conectadas', 'info');
                else throw error;
            }
            else {
                safeShowToast('✅ Nota conectada');
                loadConnections();
                connectModal.classList.add('hidden');
            }
        } catch (e) { safeShowToast('Error: ' + e.message, 'error'); }
    }

    async function loadConnections() {
        if (!promptId || !supabase) return;
        try {
            // Buscamos conexiones donde este prompt sea origen o destino
            const { data: connections, error } = await supabase
                .from('prompt_connections')
                .select(`
                    id,
                    source:source_id(id, title),
                    target:target_id(id, title)
                `)
                .or(`source_id.eq.${promptId},target_id.eq.${promptId}`);

            if (error) throw error;

            if (!connections || connections.length === 0) {
                connectionsSection.classList.add('hidden');
                return;
            }

            connectionsSection.classList.remove('hidden');
            connectionsList.innerHTML = '';

            // Filtrar la nota que no es la actual de cada conexión
            connections.forEach(c => {
                const linkedNote = c.source.id === promptId ? c.target : c.source;
                const tag = document.createElement('a');
                tag.href = `edit-note.html?id=${linkedNote.id}`;
                tag.className = 'px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center gap-2';
                tag.innerHTML = `
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    ${linkedNote.title}
                `;
                connectionsList.appendChild(tag);
            });
        } catch (e) { console.error('Error cargando conexiones:', e); }
    }

    // Buscador en tiempo real
    if (connectSearch) {
        let searchTimeout;
        connectSearch.oninput = (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchPromptsToConnect(e.target.value), 300);
        };
    }

})();