/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - PUBLIC NOTES PAGE CONTROLLER
   Carga prompts públicos del usuario actual
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    let currentPage = 1;
    let totalPublic = 0;
    let currentUserId = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('🌍 Public Notes Page: Inicializando...');

        if (!window.DataService) {
            setTimeout(init, 100);
            return;
        }

        // Verificar sesión
        const session = await window.DataService.getCurrentSession();
        if (!session) {
            window.location.href = 'auth-login.html';
            return;
        }

        currentUserId = session.user.id;
        await loadPublicPrompts();
    }

    async function loadPublicPrompts() {
        const container = document.getElementById('prompts-grid');
        if (!container) return;

        container.innerHTML = window.PromptCard ? window.PromptCard.renderLoading(4) : 'Cargando...';

        try {
            const result = await window.DataService.getUserPublicPrompts(currentUserId, {
                page: currentPage,
                limit: 12
            });

            totalPublic = result.count;

            // Actualizar contador
            const countEl = document.getElementById('total-count');
            if (countEl) countEl.textContent = totalPublic;

            if (!result.data || result.data.length === 0) {
                // Mostrar card para publicar + mensaje vacío
                container.innerHTML = renderPublishCard();
                return;
            }

            // Renderizar cards + card de publicar
            const promptCards = result.data.map(p => renderPublicPromptCard(p)).join('');
            container.innerHTML = promptCards + renderPublishCard();

            // Paginación
            if (typeof PromptHub !== 'undefined' && PromptHub.Pagination && totalPublic > 12) {
                const pagination = new PromptHub.Pagination({
                    itemsPerPage: 12,
                    onPageChange: (page) => {
                        currentPage = page;
                        loadPublicPrompts();
                    }
                });
                pagination.init(totalPublic, 'pagination-container');
            }

            console.log(`✅ Public Notes: ${result.data.length}/${totalPublic} cargados`);

        } catch (error) {
            console.error('❌ Error loading public prompts:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-400">Error al cargar prompts públicos</p>
                </div>`;
        }
    }

    function renderPublicPromptCard(prompt) {
        const colors = window.PromptCard ? window.PromptCard.getAIColors(prompt.ai_types) : { bg: 'bg-slate-600', text: 'text-slate-400', hover: '' };
        const icon = window.PromptCard ? window.PromptCard.getAIIcon(prompt.ai_types) : '';
        const aiName = prompt.ai_types?.name || 'IA';
        const categoryName = prompt.categories?.name || 'General';
        const views = prompt.view_count || 0;
        const description = prompt.description || prompt.content?.substring(0, 100) || '';

        return `
        <div class="group block rounded-xl border border-slate-700 bg-slate-800 overflow-hidden ${colors.hover} hover:shadow-lg transition-all duration-300 h-[250px]">
            <div class="h-[88px] ${colors.bg} flex items-center justify-center relative">
                <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    ${icon}
                </div>
                <span class="absolute top-2 right-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">${aiName}</span>
                <span class="absolute top-2 left-2 px-2 py-0.5 bg-teal-500 rounded-full text-[10px] text-white font-medium flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Público
                </span>
            </div>
            <div class="p-4 font-mono h-[162px] flex flex-col">
                <h3 class="text-base font-bold text-slate-100 mb-1 truncate">${escapeHtml(prompt.title || 'Sin título')}</h3>
                <p class="${colors.text} text-sm mb-2">${escapeHtml(categoryName)}</p>
                <p class="text-slate-500 text-xs line-clamp-2 mb-3">${escapeHtml(description.substring(0, 100))}...</p>
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-700">
                    <span class="text-slate-500 text-xs flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                        ${views} vistas
                    </span>
                    <a href="edit-note.html?id=${prompt.id}" class="text-indigo-400 text-xs hover:text-indigo-300">Editar →</a>
                </div>
            </div>
        </div>`;
    }

    function renderPublishCard() {
        return `
        <button onclick="window.location.href='my-prompts.html'"
            class="group block rounded-xl border-2 border-dashed border-teal-500/50 bg-teal-500/5 overflow-hidden hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-300 h-[250px]">
            <div class="h-full flex flex-col items-center justify-center p-6">
                <div class="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-500/30 transition-all">
                    <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                </div>
                <span class="text-teal-300 font-semibold">Publicar un Prompt</span>
                <span class="text-teal-400/60 text-sm mt-1 text-center">Selecciona desde My Unit</span>
            </div>
        </button>`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    console.log('✅ Public Notes Page Controller loaded');
})();
