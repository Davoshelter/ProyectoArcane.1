/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - FAVORITES PAGE CONTROLLER
   Carga prompts favoritos del usuario
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    let currentPage = 1;
    let totalFavorites = 0;
    let currentUserId = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('⭐ Favorites Page: Inicializando...');

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
        await loadFavorites();
    }

    async function loadFavorites() {
        const container = document.getElementById('favorites-grid');
        if (!container) return;

        container.innerHTML = window.PromptCard ? window.PromptCard.renderLoading(4) : 'Cargando...';

        try {
            const result = await window.DataService.getFavoritePrompts(currentUserId, {
                page: currentPage,
                limit: 12
            });

            totalFavorites = result.count;

            // Actualizar contador
            const countEl = document.getElementById('total-count');
            if (countEl) countEl.textContent = totalFavorites;

            if (!result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <div class="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                        </div>
                        <p class="text-slate-400 text-lg font-medium">No tienes favoritos aún</p>
                        <p class="text-slate-500 text-sm mt-2">Marca prompts como favoritos para verlos aquí</p>
                        <a href="my-prompts.html" class="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors">
                            Ir a Mis Prompts
                        </a>
                    </div>`;
                return;
            }

            // Renderizar cards
            const html = result.data.map(p => window.PromptCard.render(p, {
                showFavorite: true,
                showViews: false,
                showAuthor: false,
                clickable: true,
                linkToEdit: true,
                queryParams: 'from=favorites'
            })).join('');
            container.innerHTML = html;

            // Paginación
            if (typeof PromptHub !== 'undefined' && PromptHub.Pagination && totalFavorites > 12) {
                const pagination = new PromptHub.Pagination({
                    itemsPerPage: 12,
                    onPageChange: (page) => {
                        currentPage = page;
                        loadFavorites();
                    }
                });
                pagination.init(totalFavorites, 'pagination-container');
            }

            console.log(`✅ Favorites: ${result.data.length}/${totalFavorites} cargados`);

        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-400">Error al cargar favoritos</p>
                </div>`;
        }
    }

    console.log('✅ Favorites Page Controller loaded');
})();
