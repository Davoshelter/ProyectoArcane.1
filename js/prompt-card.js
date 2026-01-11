/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - PROMPT CARD RENDERER
   Componentes UI para renderizar tarjetas de prompts dinámicamente
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // =========================================================================
    // CONFIGURACIÓN DE COLORES POR TIPO DE IA
    // =========================================================================
    const AI_COLORS = {
        'chatgpt': { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', hover: 'hover:border-emerald-500 hover:shadow-emerald-500/20' },
        'claude': { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-400', hover: 'hover:border-violet-500 hover:shadow-violet-500/20' },
        'gemini': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', hover: 'hover:border-blue-500 hover:shadow-blue-500/20' },
        'midjourney': { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400', hover: 'hover:border-indigo-500 hover:shadow-indigo-500/20' },
        'dalle': { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-400', hover: 'hover:border-teal-500 hover:shadow-teal-500/20' },
        'stable-diffusion': { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', hover: 'hover:border-orange-500 hover:shadow-orange-500/20' },
        'deepseek': { bg: 'bg-blue-700', border: 'border-blue-700', text: 'text-blue-400', hover: 'hover:border-blue-700 hover:shadow-blue-700/20' },
        'grok': { bg: 'bg-slate-600', border: 'border-slate-600', text: 'text-slate-400', hover: 'hover:border-slate-600 hover:shadow-slate-600/20' },
        'copilot': { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-400', hover: 'hover:border-sky-500 hover:shadow-sky-500/20' },
        'default': { bg: 'bg-slate-600', border: 'border-slate-600', text: 'text-slate-400', hover: 'hover:border-slate-600 hover:shadow-slate-600/20' }
    };

    // =========================================================================
    // ICONOS SVG POR TIPO DE IA (Fallbacks)
    // =========================================================================
    const AI_ICONS = {
        'chatgpt': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/></svg>',
        'claude': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
        'gemini': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        'midjourney': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>',
        'dalle': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
        'stable-diffusion': '<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        'default': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>'
    };

    // =========================================================================
    // OBTENER COLORES DEL TIPO DE IA
    // =========================================================================
    function getAIColors(aiType) {
        const slug = (aiType?.slug || 'default').toLowerCase();
        return AI_COLORS[slug] || AI_COLORS['default'];
    }

    // =========================================================================
    // OBTENER ICONO DEL TIPO DE IA
    // =========================================================================
    function getAIIcon(aiType) {
        if (aiType?.icon_svg) {
            let svg = aiType.icon_svg;
            if (!svg.includes('w-8')) {
                svg = svg.replace('<svg', '<svg class="w-8 h-8 text-white"');
            }
            return svg;
        }
        const slug = (aiType?.slug || 'default').toLowerCase();
        return AI_ICONS[slug] || AI_ICONS['default'];
    }

    // =========================================================================
    // RENDERIZAR TARJETA DE PROMPT (Estilo Community)
    // =========================================================================
    function renderPromptCard(prompt, options = {}) {
        const {
            showFavorite = false,
            showPublicBadge = false,
            showViews = true,
            showAuthor = true,
            clickable = true,
            linkToEdit = false
        } = options;

        const colors = getAIColors(prompt.ai_types);
        const icon = getAIIcon(prompt.ai_types);
        const aiName = prompt.ai_types?.name || 'IA';
        const categoryName = prompt.categories?.name || 'General';
        const categoryColor = prompt.categories?.color || '#6366f1';
        const author = prompt.profiles?.username || 'Anónimo';
        const views = prompt.view_count || 0;
        const description = prompt.description || prompt.content?.substring(0, 100) || '';
        const href = linkToEdit ? `edit-note.html?id=${prompt.id}` : '#';
        const tag = clickable ? 'a' : 'div';
        const hrefAttr = clickable ? `href="${href}"` : '';

        return `
        <${tag} ${hrefAttr} 
            class="prompt-card group block rounded-xl border border-slate-700 bg-slate-800 overflow-hidden ${colors.hover} hover:shadow-lg transition-all duration-300 h-[260px] cursor-pointer"
            data-prompt-id="${prompt.id}"
            data-category="${prompt.categories?.slug || 'general'}">
            <div class="h-[88px] ${colors.bg} flex items-center justify-center relative">
                <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    ${icon}
                </div>
                <span class="absolute top-2 right-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">${aiName}</span>
                ${showFavorite ? `
                <div class="absolute top-2 left-2 z-10">
                    <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                </div>` : ''}
                ${showPublicBadge ? `
                <span class="absolute top-2 left-2 px-2 py-0.5 bg-teal-500 rounded-full text-[10px] text-white font-medium flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Público
                </span>` : ''}
            </div>
            <div class="p-4 font-mono h-[172px] flex flex-col">
                <h3 class="text-base font-bold text-slate-100 mb-1 truncate">${escapeHtml(prompt.title || 'Sin título')}</h3>
                <p class="${colors.text} text-sm mb-2">${escapeHtml(categoryName)}</p>
                <p class="text-slate-500 text-xs line-clamp-2 mb-3">${escapeHtml(description.substring(0, 100))}...</p>
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-700">
                    ${showAuthor ? `<span class="text-slate-500 text-xs">Por @${escapeHtml(author)}</span>` : ''}
                    ${showViews ? `
                    <span class="text-slate-500 text-xs flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                        </svg>
                        ${views}
                    </span>` : ''}
                </div>
            </div>
        </${tag}>`;
    }

    // =========================================================================
    // RENDERIZAR TARJETA POPULAR (Estilo Index - Folder Card)
    // =========================================================================
    function renderPopularCard(prompt) {
        const colors = getAIColors(prompt.ai_types);
        const icon = getAIIcon(prompt.ai_types);
        const aiName = prompt.ai_types?.name || 'IA';
        const categoryName = prompt.categories?.name || 'General';
        const author = prompt.profiles?.username || 'Anónimo';
        const views = prompt.view_count || 0;
        const description = prompt.description || prompt.content?.substring(0, 100) || '';

        // Calcular rating simulado basado en views
        const rating = Math.min(5, 4 + (views / 1000)).toFixed(1);

        return `
        <div class="folder-card group cursor-pointer" data-prompt-id="${prompt.id}">
            <div class="flex">
                <div class="${colors.bg} rounded-t-lg px-4 py-2 text-sm font-semibold text-white flex items-center gap-2">
                    ${icon.replace('w-8 h-8', 'w-4 h-4')}
                    ${aiName}
                </div>
            </div>
            <div class="bg-slate-800 border border-slate-700 border-t-0 rounded-b-xl rounded-tr-xl p-6 ${colors.hover.replace('hover:', 'group-hover:')} transition-colors">
                <div class="flex items-start justify-between mb-4">
                    <span class="px-3 py-1 bg-opacity-20 ${colors.text} text-xs font-medium rounded-full" style="background-color: ${prompt.categories?.color || '#6366f1'}20">${escapeHtml(categoryName)}</span>
                    <div class="flex items-center gap-1 text-amber-400">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="text-sm font-medium">${rating}</span>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-slate-100 mb-2">${escapeHtml(prompt.title || 'Sin título')}</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-4">${escapeHtml(description.substring(0, 100))}...</p>
                <div class="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span class="text-slate-500 text-xs">Por @${escapeHtml(author)}</span>
                    <span class="text-slate-500 text-xs">${formatNumber(views)} usos</span>
                </div>
            </div>
        </div>`;
    }

    // =========================================================================
    // RENDERIZAR GRID DE PROMPTS
    // =========================================================================
    function renderPromptGrid(prompts, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!prompts || prompts.length === 0) {
            container.innerHTML = renderEmptyState(options.emptyMessage || 'No hay prompts disponibles');
            return;
        }

        const html = prompts.map(p => renderPromptCard(p, options)).join('');
        container.innerHTML = html;
    }

    // =========================================================================
    // RENDERIZAR FILTROS DE CATEGORÍA
    // =========================================================================
    function renderCategoryFilters(categories, containerId, activeSlug = 'all') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Botón "Todos" siempre presente
        let html = `
            <button class="filter-btn ${activeSlug === 'all' ? 'active bg-indigo-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'} px-5 py-2.5 rounded-full text-sm font-medium transition-all" data-category="all">
                Todos
            </button>`;

        // Agregar categorías dinámicas
        categories.forEach(cat => {
            const isActive = activeSlug === cat.slug;
            const emoji = getCategoryEmoji(cat.name);
            html += `
                <button class="filter-btn ${isActive ? 'active bg-indigo-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'} px-5 py-2.5 rounded-full text-sm font-medium transition-all" data-category="${cat.slug}">
                    ${emoji} ${escapeHtml(cat.name)}
                </button>`;
        });

        container.innerHTML = html;
    }

    // =========================================================================
    // ESTADO VACÍO
    // =========================================================================
    function renderEmptyState(message) {
        return `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <p class="text-slate-400 text-lg font-medium">${message}</p>
            <p class="text-slate-500 text-sm mt-2">Los prompts aparecerán aquí cuando se creen</p>
        </div>`;
    }

    // =========================================================================
    // ESTADO DE CARGA
    // =========================================================================
    function renderLoadingState(count = 6) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
            <div class="animate-pulse rounded-xl border border-slate-700 bg-slate-800 overflow-hidden h-[260px]">
                <div class="h-[88px] bg-slate-700"></div>
                <div class="p-4">
                    <div class="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                    <div class="h-3 bg-slate-700 rounded w-1/2 mb-3"></div>
                    <div class="h-3 bg-slate-700 rounded w-full mb-2"></div>
                    <div class="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
            </div>`;
        }
        return html;
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    function getCategoryEmoji(categoryName) {
        const emojis = {
            'programación': '💻',
            'programacion': '💻',
            'arte digital': '🎨',
            'arte': '🎨',
            'escritura': '✍️',
            'fotografía': '📷',
            'fotografia': '📷',
            'análisis': '📊',
            'analisis': '📊',
            'marketing': '📣',
            'diseño': '🎯',
            'diseno': '🎯'
        };
        return emojis[categoryName?.toLowerCase()] || '📌';
    }

    // =========================================================================
    // EXPONER API GLOBAL
    // =========================================================================
    window.PromptCard = {
        render: renderPromptCard,
        renderPopular: renderPopularCard,
        renderGrid: renderPromptGrid,
        renderFilters: renderCategoryFilters,
        renderEmpty: renderEmptyState,
        renderLoading: renderLoadingState,
        getAIColors,
        getAIIcon
    };

    console.log('✅ PromptCard loaded');
})();
