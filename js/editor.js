/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR v2.0 (Supabase Integrated)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // 1. Elementos UI
    const promptContent = document.getElementById('prompt-content');
    const promptTitle = document.getElementById('prompt-title');
    const promptNotes = document.getElementById('prompt-notes');
    const saveBtn = document.getElementById('save-btn');
    const titleDisplay = document.getElementById('prompt-title-display');
    const categoryBadge = document.getElementById('prompt-category-badge');
    const lastEditDisplay = document.getElementById('prompt-last-edit');
    const promptIconContainer = document.getElementById('prompt-icon');

    // Estado Global
    const currentPromptId = new URLSearchParams(window.location.search).get('id');

    // 2. Inicialización
    async function init() {
        console.log('🚀 Editor: Sincronizando con Supabase...');
        
        // Esperar a Supabase
        const supabase = window.initSupabase ? window.initSupabase() : null;
        if (!supabase) {
            console.error('Supabase no inicializado');
            return;
        }

        // Verificar Sesión
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'auth-login.html';
            return;
        }

        if (!currentPromptId) {
            alert('No se encontró el ID del prompt');
            window.location.href = 'dashboard.html';
            return;
        }

        loadPromptData(supabase);
    }

    // 3. Cargar Datos
    async function loadPromptData(supabase) {
        try {
            const { data: prompt, error } = await supabase
                .from('prompts')
                .select(`
                    *,
                    categories (name),
                    ai_types (name, icon_svg, slug)
                `)
                .eq('id', currentPromptId)
                .single();

            if (error) throw error;

            // Rellenar campos
            if (promptTitle) promptTitle.value = prompt.title || '';
            if (promptContent) promptContent.value = prompt.content || '';
            if (promptNotes) promptNotes.value = prompt.description || '';
            
            // Header Info
            if (titleDisplay) titleDisplay.textContent = prompt.title || 'Sin Título';
            if (categoryBadge) categoryBadge.textContent = prompt.categories?.name || 'General';
            if (lastEditDisplay) {
                const date = new Date(prompt.updated_at);
                lastEditDisplay.textContent = `Guardado ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            }

            // Aplicar estilo visual (Icono y Color)
            if (promptIconContainer && prompt.ai_types) {
                const colors = { 
                    'chatgpt': 'bg-emerald-500', 
                    'midjourney': 'bg-indigo-500', 
                    'claude': 'bg-orange-500', 
                    'gemini': 'bg-blue-500', 
                    'dalle': 'bg-teal-500',
                    'stable-diffusion': 'bg-orange-600',
                    'deepseek': 'bg-blue-700',
                    'grok': 'bg-gray-900',
                    'copilot': 'bg-sky-600'
                };
                const slug = prompt.ai_types.slug?.toLowerCase() || 'default';
                
                // Aplicar color de fondo
                if (colors[slug]) {
                    promptIconContainer.className = `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${colors[slug]}`;
                } else {
                    promptIconContainer.className = `w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-700`;
                }

                // Inyectar SVG (respetando colores originales)
                if (prompt.ai_types.icon_svg) {
                    let iconSvg = prompt.ai_types.icon_svg;
                    // Solo ajustar tamaño si es necesario, no tocar colores
                    if (iconSvg.includes('<svg') && !iconSvg.includes('w-')) {
                        iconSvg = iconSvg.replace('<svg', '<svg class="w-6 h-6"'); // Tamaño un poco más chico para el header
                    }
                    // Si no tiene color definido, poner blanco por defecto para que se vea
                    if (!iconSvg.includes('fill=') && !iconSvg.includes('text-')) {
                         iconSvg = iconSvg.replace('<svg', '<svg class="w-6 h-6 text-white" fill="currentColor"');
                    }
                    promptIconContainer.innerHTML = iconSvg;
                }
            }

        } catch (e) {
            console.error('Error cargando prompt:', e);
            alert('Error al cargar datos: ' + e.message);
            window.location.href = 'dashboard.html';
        }
    }

    // 4. Guardar
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const supabase = window.initSupabase();
            const originalHTML = saveBtn.innerHTML;
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="animate-pulse">Guardando...</span>';

            try {
                const { error } = await supabase
                    .from('prompts')
                    .update({
                        title: promptTitle.value,
                        content: promptContent.value,
                        description: promptNotes.value,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentPromptId);

                if (error) throw error;

                // Feedback UI
                if (titleDisplay) titleDisplay.textContent = promptTitle.value;
                if (lastEditDisplay) lastEditDisplay.textContent = 'Guardado ahora';
                
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce';
                toast.textContent = '✅ Guardado';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);

            } catch (e) {
                alert('Error al guardar: ' + e.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalHTML;
            }
        });
    }

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();