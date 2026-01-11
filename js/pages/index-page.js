/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - INDEX PAGE CONTROLLER
   Carga prompts populares dinámicamente en la página de inicio
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('🏠 Index Page: Inicializando...');

        // Esperar a que DataService esté disponible
        if (!window.DataService) {
            console.warn('⏳ Esperando DataService...');
            setTimeout(init, 100);
            return;
        }

        await loadPopularPrompts();
    }

    async function loadPopularPrompts() {
        const container = document.getElementById('popular-prompts-grid');
        if (!container) {
            console.log('ℹ️ No hay contenedor popular-prompts-grid');
            return;
        }

        // Mostrar loading
        container.innerHTML = window.PromptCard ? window.PromptCard.renderLoading(3) : 'Cargando...';

        try {
            // Obtener prompts populares
            const prompts = await window.DataService.getPopularPrompts(3);

            if (!prompts || prompts.length === 0) {
                // Si no hay prompts, mostrar estado vacío pero mantener diseño
                container.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <p class="text-slate-400">No hay prompts populares aún</p>
                        <p class="text-slate-500 text-sm mt-1">Sé el primero en publicar un prompt</p>
                    </div>`;
                return;
            }

            // Renderizar cards usando PromptCard
            if (window.PromptCard) {
                const html = prompts.map(p => window.PromptCard.renderPopular(p)).join('');
                container.innerHTML = html;

                // Agregar eventos de click para abrir modal
                container.querySelectorAll('.folder-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const promptId = card.getAttribute('data-prompt-id');
                        openPromptModal(prompts.find(p => p.id === promptId));
                    });
                });
            }

            console.log(`✅ Index: ${prompts.length} prompts populares cargados`);

        } catch (error) {
            console.error('❌ Error loading popular prompts:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-400">Error al cargar prompts</p>
                </div>`;
        }
    }

    function openPromptModal(prompt) {
        if (!prompt) return;

        // Buscar modal existente o crear uno simple
        let modal = document.getElementById('prompt-preview-modal');

        if (!modal) {
            // Si no hay modal, ir directamente a community
            window.location.href = 'community.html';
            return;
        }

        // Si existe el modal, actualizarlo y mostrarlo
        const titleEl = modal.querySelector('#modal-title');
        const contentEl = modal.querySelector('#modal-content');

        if (titleEl) titleEl.textContent = prompt.title;
        if (contentEl) contentEl.textContent = prompt.content;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    console.log('✅ Index Page Controller loaded');
})();
