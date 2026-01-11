/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - COMMUNITY PAGE CONTROLLER
   Carga prompts públicos con filtros, búsqueda y paginación
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Estado de la página
    let currentPage = 1;
    let currentCategory = 'all';
    let currentSearch = '';
    let currentOrder = 'recent';
    let totalPrompts = 0;
    let allPrompts = [];

    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('🌐 Community Page: Inicializando...');

        // Esperar a que DataService esté disponible
        if (!window.DataService) {
            console.warn('⏳ Esperando DataService...');
            setTimeout(init, 100);
            return;
        }

        // Cargar datos iniciales
        await Promise.all([
            loadCategories(),
            loadPrompts()
        ]);

        // Configurar eventos
        setupEventListeners();
    }

    // =========================================================================
    // CARGAR CATEGORÍAS
    // =========================================================================
    async function loadCategories() {
        const container = document.getElementById('category-filters');
        if (!container) return;

        try {
            const categories = await window.DataService.getCategories();

            if (window.PromptCard) {
                window.PromptCard.renderFilters(categories, 'category-filters', currentCategory);
            }

            console.log(`✅ Community: ${categories.length} categorías cargadas`);

        } catch (error) {
            console.error('❌ Error loading categories:', error);
        }
    }

    // =========================================================================
    // CARGAR PROMPTS
    // =========================================================================
    async function loadPrompts() {
        const container = document.getElementById('prompts-grid');
        if (!container) return;

        // Mostrar loading
        container.innerHTML = window.PromptCard ? window.PromptCard.renderLoading(6) : 'Cargando...';

        try {
            const orderMap = {
                'recent': { orderBy: 'created_at', ascending: false },
                'popular': { orderBy: 'view_count', ascending: false },
                'az': { orderBy: 'title', ascending: true }
            };

            const orderConfig = orderMap[currentOrder] || orderMap['recent'];

            const result = await window.DataService.getPublicPrompts({
                page: currentPage,
                limit: 12,
                categorySlug: currentCategory,
                search: currentSearch,
                orderBy: orderConfig.orderBy,
                ascending: orderConfig.ascending
            });

            allPrompts = result.data;
            totalPrompts = result.count;

            // Actualizar contador
            const countEl = document.getElementById('results-count');
            if (countEl) countEl.textContent = totalPrompts;

            // Renderizar prompts
            if (!allPrompts || allPrompts.length === 0) {
                container.innerHTML = window.PromptCard
                    ? window.PromptCard.renderEmpty('No se encontraron prompts')
                    : '<p>No hay prompts</p>';
            } else {
                const html = allPrompts.map(p => window.PromptCard.render(p, {
                    showViews: true,
                    showAuthor: true,
                    clickable: true,
                    linkToEdit: false
                })).join('');
                container.innerHTML = html;

                // Agregar eventos de click
                container.querySelectorAll('.prompt-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        const promptId = card.getAttribute('data-prompt-id');
                        const prompt = allPrompts.find(p => p.id === promptId);
                        if (prompt) openViewModal(prompt);
                    });
                });
            }

            // Actualizar paginación
            updatePagination();

            console.log(`✅ Community: ${allPrompts.length}/${totalPrompts} prompts cargados`);

        } catch (error) {
            console.error('❌ Error loading prompts:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-400">Error al cargar prompts</p>
                    <p class="text-slate-500 text-sm mt-1">${error.message}</p>
                </div>`;
        }
    }

    // =========================================================================
    // PAGINACIÓN
    // =========================================================================
    function updatePagination() {
        if (typeof PromptHub !== 'undefined' && PromptHub.Pagination) {
            const pagination = new PromptHub.Pagination({
                itemsPerPage: 12,
                onPageChange: function (page) {
                    currentPage = page;
                    loadPrompts();
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            pagination.init(totalPrompts, 'pagination-container');
        }
    }

    // =========================================================================
    // MODAL DE VISUALIZACIÓN
    // =========================================================================
    function openViewModal(prompt) {
        const modal = document.getElementById('view-modal');
        if (!modal) return;

        // Actualizar contenido del modal
        const titleEl = document.getElementById('modal-title');
        const authorEl = document.getElementById('modal-author');
        const categoryEl = document.getElementById('modal-category');
        const contentEl = document.getElementById('modal-content');
        const iconEl = document.getElementById('modal-icon');

        if (titleEl) titleEl.textContent = prompt.title || 'Sin título';
        if (authorEl) authorEl.textContent = `Por @${prompt.profiles?.username || 'Anónimo'}`;
        if (categoryEl) {
            categoryEl.textContent = prompt.categories?.name || 'General';
            const color = prompt.categories?.color || '#6366f1';
            categoryEl.style.backgroundColor = color + '20';
            categoryEl.style.color = color;
        }
        if (contentEl) contentEl.textContent = prompt.content || 'Sin contenido';

        // Actualizar icono
        if (iconEl && window.PromptCard) {
            const colors = window.PromptCard.getAIColors(prompt.ai_types);
            iconEl.className = `w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`;
            iconEl.innerHTML = window.PromptCard.getAIIcon(prompt.ai_types).replace('w-8 h-8', 'w-5 h-5');
        }

        // Mostrar modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    // =========================================================================
    // EVENTOS
    // =========================================================================
    function setupEventListeners() {
        // Filtros de categoría
        const filterContainer = document.getElementById('category-filters');
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    // Actualizar UI de botones
                    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active', 'bg-indigo-500', 'text-white');
                        btn.classList.add('bg-slate-800', 'border', 'border-slate-700', 'text-slate-300');
                    });
                    e.target.classList.remove('bg-slate-800', 'border', 'border-slate-700', 'text-slate-300');
                    e.target.classList.add('active', 'bg-indigo-500', 'text-white');

                    // Actualizar estado y recargar
                    currentCategory = e.target.getAttribute('data-category');
                    currentPage = 1;
                    loadPrompts();
                }
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentSearch = searchInput.value.trim();
                    currentPage = 1;
                    loadPrompts();
                }, 300);
            });
        }

        // Ordenamiento
        const sortSelect = document.querySelector('select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentOrder = sortSelect.value;
                currentPage = 1;
                loadPrompts();
            });
        }

        // Botón copiar en modal
        const copyBtn = document.getElementById('copy-prompt-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const content = document.getElementById('modal-content')?.textContent;
                if (content) {
                    navigator.clipboard.writeText(content).then(() => {
                        copyBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ¡Copiado!';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copiar Prompt';
                        }, 2000);
                    });
                }
            });
        }
    }

    console.log('✅ Community Page Controller loaded');
})();
