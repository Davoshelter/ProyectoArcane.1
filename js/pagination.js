/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - PAGINATION v1.0
   Componente de paginación reutilizable
   Preparado para integración con Supabase
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN POR DEFECTO
    // ═══════════════════════════════════════════════════════════════════════

    var DEFAULT_CONFIG = {
        itemsPerPage: 12,
        maxVisiblePages: 5,
        containerClass: 'pagination-container',
        buttonClass: 'pagination-btn',
        activeClass: 'pagination-active'
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CLASE PAGINATION
    // ═══════════════════════════════════════════════════════════════════════

    function Pagination(options) {
        this.config = Object.assign({}, DEFAULT_CONFIG, options || {});
        this.currentPage = 1;
        this.totalItems = 0;
        this.totalPages = 0;
        this.onPageChange = options && options.onPageChange ? options.onPageChange : null;
    }

    /**
     * Inicializa la paginación con el total de items
     */
    Pagination.prototype.init = function (totalItems, containerId) {
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / this.config.itemsPerPage);
        this.containerId = containerId;
        this.currentPage = 1;
        this.render();
    };

    /**
     * Cambia a una página específica
     */
    Pagination.prototype.goToPage = function (page) {
        if (page < 1 || page > this.totalPages) return;

        this.currentPage = page;
        this.render();

        if (this.onPageChange) {
            this.onPageChange(page, this.getPageInfo());
        }
    };

    /**
     * Obtiene información de la página actual
     */
    Pagination.prototype.getPageInfo = function () {
        var start = (this.currentPage - 1) * this.config.itemsPerPage;
        var end = Math.min(start + this.config.itemsPerPage, this.totalItems);

        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.config.itemsPerPage,
            startIndex: start,
            endIndex: end,
            hasNext: this.currentPage < this.totalPages,
            hasPrev: this.currentPage > 1
        };
    };

    /**
     * Renderiza la paginación
     */
    Pagination.prototype.render = function () {
        var container = document.getElementById(this.containerId);
        if (!container) return;

        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        var self = this;
        var info = this.getPageInfo();
        var pages = this.getVisiblePages();

        var html = '<div class="flex items-center justify-center gap-2">';

        // Botón Anterior
        html += '<button class="pagination-btn px-4 py-2 bg-slate-800 border border-slate-700 text-slate-' +
            (info.hasPrev ? '300 hover:bg-slate-700 hover:border-slate-600' : '600 cursor-not-allowed') +
            ' rounded-xl transition-colors text-sm font-medium" data-page="prev" ' +
            (!info.hasPrev ? 'disabled' : '') + '>';
        html += '« Anterior';
        html += '</button>';

        // Números de página
        pages.forEach(function (page) {
            if (page === '...') {
                html += '<span class="px-2 text-slate-500">...</span>';
            } else {
                var isActive = page === self.currentPage;
                html += '<button class="pagination-btn w-10 h-10 ' +
                    (isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700') +
                    ' rounded-xl transition-colors text-sm font-medium" data-page="' + page + '">';
                html += page;
                html += '</button>';
            }
        });

        // Botón Siguiente
        html += '<button class="pagination-btn px-4 py-2 bg-slate-800 border border-slate-700 text-slate-' +
            (info.hasNext ? '300 hover:bg-slate-700 hover:border-slate-600' : '600 cursor-not-allowed') +
            ' rounded-xl transition-colors text-sm font-medium" data-page="next" ' +
            (!info.hasNext ? 'disabled' : '') + '>';
        html += 'Siguiente »';
        html += '</button>';

        html += '</div>';

        // Info de resultados
        html += '<p class="text-center text-slate-500 text-sm mt-3">';
        html += 'Mostrando ' + (info.startIndex + 1) + '-' + info.endIndex + ' de ' + info.totalItems + ' resultados';
        html += '</p>';

        container.innerHTML = html;

        // Event listeners
        var buttons = container.querySelectorAll('.pagination-btn');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var page = this.getAttribute('data-page');
                if (page === 'prev') {
                    self.goToPage(self.currentPage - 1);
                } else if (page === 'next') {
                    self.goToPage(self.currentPage + 1);
                } else {
                    self.goToPage(parseInt(page));
                }
            });
        });
    };

    /**
     * Obtiene los números de página visibles
     */
    Pagination.prototype.getVisiblePages = function () {
        var pages = [];
        var maxVisible = this.config.maxVisiblePages;
        var current = this.currentPage;
        var total = this.totalPages;

        if (total <= maxVisible) {
            for (var i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Siempre mostrar primera página
            pages.push(1);

            var startPage = Math.max(2, current - 1);
            var endPage = Math.min(total - 1, current + 1);

            // Ajustar rango si estamos cerca del inicio o final
            if (current <= 3) {
                endPage = Math.min(total - 1, maxVisible - 1);
            }
            if (current >= total - 2) {
                startPage = Math.max(2, total - maxVisible + 2);
            }

            // Añadir ellipsis si hay gap
            if (startPage > 2) {
                pages.push('...');
            }

            // Añadir páginas del medio
            for (var i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Añadir ellipsis si hay gap
            if (endPage < total - 1) {
                pages.push('...');
            }

            // Siempre mostrar última página
            pages.push(total);
        }

        return pages;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER PARA PAGINAR ARRAYS
    // ═══════════════════════════════════════════════════════════════════════

    function paginateArray(array, page, itemsPerPage) {
        itemsPerPage = itemsPerPage || DEFAULT_CONFIG.itemsPerPage;
        var start = (page - 1) * itemsPerPage;
        return array.slice(start, start + itemsPerPage);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPONER API GLOBAL
    // ═══════════════════════════════════════════════════════════════════════

    window.PromptHub = window.PromptHub || {};
    window.PromptHub.Pagination = Pagination;
    window.PromptHub.paginateArray = paginateArray;

    // Para futura integración con Supabase
    // Query helper que añade paginación
    window.PromptHub.getPaginatedQuery = function (baseQuery, page, itemsPerPage) {
        itemsPerPage = itemsPerPage || DEFAULT_CONFIG.itemsPerPage;
        var start = (page - 1) * itemsPerPage;

        // Esta función será usada con Supabase:
        // return baseQuery.range(start, start + itemsPerPage - 1);
        return {
            start: start,
            end: start + itemsPerPage - 1,
            limit: itemsPerPage
        };
    };

})();
