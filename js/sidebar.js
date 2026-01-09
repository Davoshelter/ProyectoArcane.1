/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - SIDEBAR INJECTOR v2.1
   Inyecta el sidebar en todas las páginas automáticamente
   Corregido: Colapso suave mostrando solo iconos
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Detectar página actual para marcar link activo
    var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Mapeo de páginas para el link activo
    var pageMap = {
        'dashboard.html': 'home',
        'my-prompts.html': 'my-unit',
        'shared.html': 'share',
        'public-notes.html': 'publish',
        'graph-view.html': 'graph',
        'favorites.html': 'favorite',
        'edit-note.html': 'home'
    };

    var activePage = pageMap[currentPage] || 'home';

    // Función helper para clases activas
    function getLinkClass(pageName) {
        if (activePage === pageName) {
            return 'sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-700/50 text-indigo-400 transition-all';
        }
        return 'sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all';
    }

    // HTML del Sidebar con estructura mejorada para colapso
    var sidebarHTML = `
    <style>
        /* Estados del sidebar */
        #sidebar {
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #sidebar.collapsed {
            width: 5rem !important;
        }
        #sidebar.collapsed .sidebar-text {
            opacity: 0;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
        }
        #sidebar.collapsed .sidebar-hide {
            display: none;
        }
        #sidebar.collapsed .logo-full {
            display: none;
        }
        #sidebar.collapsed .logo-icon {
            display: flex !important;
        }
        #sidebar:not(.collapsed) .logo-icon {
            display: none !important;
        }
        #sidebar.collapsed #sidebar-collapse-btn {
            transform: rotate(180deg);
        }
        #sidebar.collapsed .user-section {
            justify-content: center;
            padding: 0.75rem;
        }
        #sidebar.collapsed .user-info {
            display: none;
        }
        .sidebar-text {
            transition: opacity 0.2s ease, width 0.2s ease;
        }
    </style>
    
    <aside id="sidebar" class="fixed left-0 top-0 h-screen bg-slate-800 border-r border-slate-700 flex flex-col z-40 w-64 lg:translate-x-0 -translate-x-full">
        
        <!-- Header con Logo -->
        <div class="p-4 border-b border-slate-700 flex items-center justify-between min-h-[72px]">
            <!-- Logo Completo (visible cuando expandido) -->
            <a href="index.html" class="logo-full flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                </div>
                <span class="sidebar-text text-xl font-bold tracking-tight">
                    <span class="text-slate-200">PROMPT</span><span class="text-indigo-400">HUB</span>
                </span>
            </a>
            
            <!-- Logo Solo Icono (visible cuando colapsado) -->
            <a href="index.html" class="logo-icon hidden items-center justify-center mx-auto">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                </div>
            </a>
            
            <!-- Botón Colapsar (solo visible en desktop expandido) -->
            <button id="sidebar-collapse-btn" class="sidebar-hide p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all flex-shrink-0" title="Contraer menú">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                </svg>
            </button>
        </div>
        
        <!-- Navegación -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden font-mono">
            <a href="dashboard.html" class="${getLinkClass('home')}" title="Home">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                <span class="sidebar-text">Home</span>
            </a>
            <a href="my-prompts.html" class="${getLinkClass('my-unit')}" title="My Unit">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                <span class="sidebar-text">My Unit</span>
            </a>
            <a href="shared.html" class="${getLinkClass('share')}" title="Share">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span class="sidebar-text">Share</span>
            </a>
            <a href="public-notes.html" class="${getLinkClass('publish')}" title="Mis Publicados">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <span class="sidebar-text">Publicados</span>
            </a>
            <a href="graph-view.html" class="${getLinkClass('graph')}" title="Graph">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                <span class="sidebar-text">Graph</span>
            </a>
            <a href="favorites.html" class="${getLinkClass('favorite')}" title="Favorite">
                <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                <span class="sidebar-text">Favorite</span>
            </a>
        </nav>
        
        <!-- Sección de Usuario -->
        <div class="p-3 border-t border-slate-700">
            <div class="user-section flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
                <div class="w-10 h-10 min-w-[2.5rem] bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" id="user-avatar">U</div>
                <div class="user-info flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-200 truncate" id="user-name">Usuario</p>
                    <p class="text-xs text-slate-500 truncate" id="user-email">user@email.com</p>
                </div>
                <button class="user-info p-2 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0" title="Cerrar sesión" id="logout-btn">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                </button>
            </div>
            
            <!-- Botón expandir (solo visible cuando colapsado) -->
            <button id="sidebar-expand-btn" class="hidden w-full mt-2 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all" title="Expandir menú">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </aside>
    
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden hidden"></div>
    `;

    // Inyectar sidebar
    var container = document.getElementById('sidebar-container');
    if (container) {
        container.innerHTML = sidebarHTML;
    }

    // Configurar eventos después de inyectar
    setTimeout(function () {
        var sidebar = document.getElementById('sidebar');
        var collapseBtn = document.getElementById('sidebar-collapse-btn');
        var expandBtn = document.getElementById('sidebar-expand-btn');
        var mainContent = document.querySelector('main');
        var overlay = document.getElementById('sidebar-overlay');
        var mobileMenuBtn = document.getElementById('mobile-menu-btn');

        var isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

        // Aplicar estado guardado inmediatamente
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            expandBtn.classList.remove('hidden');
            if (mainContent) {
                mainContent.classList.remove('lg:ml-64');
                mainContent.classList.add('lg:ml-20');
            }
        }

        function toggleSidebarCollapse() {
            isCollapsed = !isCollapsed;
            localStorage.setItem('sidebarCollapsed', isCollapsed);

            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                expandBtn.classList.remove('hidden');
                if (mainContent) {
                    mainContent.classList.remove('lg:ml-64');
                    mainContent.classList.add('lg:ml-20');
                }
            } else {
                sidebar.classList.remove('collapsed');
                expandBtn.classList.add('hidden');
                if (mainContent) {
                    mainContent.classList.remove('lg:ml-20');
                    mainContent.classList.add('lg:ml-64');
                }
            }

            // Disparar evento para que otras partes de la app puedan reaccionar
            window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed: isCollapsed } }));
        }

        function toggleSidebarMobile() {
            if (!sidebar || !overlay) return;

            var isHidden = sidebar.classList.contains('-translate-x-full');

            if (isHidden) {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                sidebar.classList.remove('translate-x-0');
                overlay.classList.add('hidden');
            }
        }

        // Event Listeners
        if (collapseBtn) {
            collapseBtn.addEventListener('click', toggleSidebarCollapse);
        }
        if (expandBtn) {
            expandBtn.addEventListener('click', toggleSidebarCollapse);
        }
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleSidebarMobile);
        }
        if (overlay) {
            overlay.addEventListener('click', toggleSidebarMobile);
        }

        // Exponer funciones globalmente
        window.PromptHub = window.PromptHub || {};
        window.PromptHub.Sidebar = {
            toggle: toggleSidebarMobile,
            collapse: toggleSidebarCollapse,
            isCollapsed: function () { return isCollapsed; }
        };

        // API preparada para Supabase
        window.PromptHub.User = {
            setUserData: function (userData) {
                var avatar = document.getElementById('user-avatar');
                var name = document.getElementById('user-name');
                var email = document.getElementById('user-email');

                if (userData) {
                    if (avatar && userData.initials) avatar.textContent = userData.initials;
                    if (name && userData.name) name.textContent = userData.name;
                    if (email && userData.email) email.textContent = userData.email;
                }
            },
            logout: function () {
                console.log('Logout - Pendiente integración Supabase');
            }
        };

        // Listener para botón de logout
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                window.PromptHub.User.logout();
            });
        }

    }, 0);

})();
