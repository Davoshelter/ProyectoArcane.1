/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - SIDEBAR INJECTOR v5.0 (Simplificado)
   ═══════════════════════════════════════════════════════════════════════════ */

// HTML Template (Contenido estático)
const SIDEBAR_HTML = `
<style>
    #sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    #sidebar.collapsed { width: 5rem !important; }
    #sidebar.collapsed .sidebar-text { opacity: 0; width: 0; overflow: hidden; white-space: nowrap; }
    #sidebar.collapsed .logo-full { display: none; }
    #sidebar.collapsed .logo-icon { display: flex !important; margin-bottom: 1rem; }
    
    /* Centrar contenido del header en colapso */
    #sidebar.collapsed .sidebar-header {
        flex-direction: column !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        justify-content: center !important;
        gap: 0.5rem;
    }

    #sidebar.collapsed #sidebar-collapse-btn { 
        margin: 0 auto !important;
    }
    #sidebar.collapsed #sidebar-collapse-btn svg { transform: rotate(180deg); }
    
    /* Ocultar user info extra en colapso */
    #sidebar.collapsed #user-name, #sidebar.collapsed #user-email { display: none; }
</style>

<aside id="sidebar" class="fixed left-0 top-0 h-screen bg-slate-800 border-r border-slate-700 flex flex-col z-40 w-64 lg:translate-x-0 -translate-x-full">
    <!-- Header -->
    <div class="sidebar-header p-4 border-b border-slate-700 flex items-center justify-between min-h-[72px]">
        <a href="index.html" class="logo-full flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <span class="sidebar-text text-xl font-bold tracking-tight"><span class="text-slate-200">PROMPT</span><span class="text-indigo-400">HUB</span></span>
        </a>
        
        <!-- Logo Icono (Solo visible colapsado) -->
        <a href="index.html" class="logo-icon hidden items-center justify-center mx-auto">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
        </a>

        <button id="sidebar-collapse-btn" class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
        </button>
    </div>
    
    <!-- Nav -->
    <nav class="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden font-mono" id="sidebar-nav">
        <!-- Links se marcarán activos dinámicamente -->
        <a href="dashboard.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="sidebar-text">Home</span>
        </a>
        <a href="my-prompts.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            <span class="sidebar-text">My Unit</span>
        </a>
        <a href="shared.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span class="sidebar-text">Share</span>
        </a>
        <a href="public-notes.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            <span class="sidebar-text">Publicados</span>
        </a>
        <a href="graph-view.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            <span class="sidebar-text">Graph</span>
        </a>
        <a href="favorites.html" class="sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all">
            <svg class="w-5 h-5 min-w-[1.25rem] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.519 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            <span class="sidebar-text">Favorite</span>
        </a>
    </nav>
    
    <!-- User Info -->
    <div class="p-3 border-t border-slate-700">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
            <div id="user-avatar" class="w-10 h-10 min-w-[2.5rem] bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">U</div>
            <div class="sidebar-text flex-1 min-w-0">
                <p id="user-name" class="text-sm font-medium text-slate-200 truncate">Cargando...</p>
                <p id="user-email" class="text-xs text-slate-500 truncate">...</p>
            </div>
            <button id="logout-btn" class="sidebar-text p-2 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0" title="Cerrar sesión">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
        </div>
    </div>
</aside>
<div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden hidden"></div>
`;

// =========================================================================
// FUNCIONES GLOBALES (Directas al punto)
// =========================================================================

function updateSidebarUser(userData) {
    if (!userData) return;
    console.log('👤 Sidebar: Actualizando usuario ->', userData.email);

    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    const email = document.getElementById('user-email');

    if (avatar) {
        if (userData.avatar_url) {
            avatar.innerHTML = `<img src="${userData.avatar_url}" class="w-full h-full object-cover rounded-full">`;
        } else {
            const initials = (userData.username || userData.email || 'U').charAt(0).toUpperCase();
            avatar.textContent = initials;
        }
    }
    if (name) name.textContent = userData.username || 'Usuario';
    if (email) email.textContent = userData.email || 'user@email.com';
}

async function logoutUser() {
    console.log('📡 Logout solicitado...');
    try {
        if (window.initSupabase) {
            const supabase = window.initSupabase();
            if (supabase) await supabase.auth.signOut();
        }
    } catch (e) {
        console.error('Logout error:', e);
    } finally {
        window.location.href = 'index.html';
    }
}

// =========================================================================
// INICIALIZACIÓN
// =========================================================================
(function initSidebar() {
    // 1. Inyectar HTML
    const container = document.getElementById('sidebar-container');
    if (container) container.innerHTML = SIDEBAR_HTML;

    // 2. Setup después de inyección
    setTimeout(() => {
        // Elementos
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const overlay = document.getElementById('sidebar-overlay');
        const logoutBtn = document.getElementById('logout-btn');

        // Estado colapsado
        let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        function toggleUI() {
            if (!sidebar) return;
            const mainContent = document.querySelector('main');
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                if (mainContent) { mainContent.classList.remove('lg:ml-64'); mainContent.classList.add('lg:ml-20'); }
            } else {
                sidebar.classList.remove('collapsed');
                if (mainContent) { mainContent.classList.remove('lg:ml-20'); mainContent.classList.add('lg:ml-64'); }
            }
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        }
        toggleUI();

        // Listeners UI
        if (collapseBtn) collapseBtn.onclick = () => { isCollapsed = !isCollapsed; toggleUI(); };
        if (mobileMenuBtn) mobileMenuBtn.onclick = () => { sidebar.classList.toggle('-translate-x-full'); overlay.classList.toggle('hidden'); };
        if (overlay) overlay.onclick = () => { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); };

        // Listener Logout Directo
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                logoutUser();
            };
        }

        // Marcar link activo
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        const links = document.querySelectorAll('#sidebar-nav a');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.remove('text-slate-400', 'hover:bg-slate-700/50');
                link.classList.add('bg-slate-700/50', 'text-indigo-400');
            }
        });

        // 3. Cargar datos si ya existen o buscarlos
        async function fetchUserForSidebar() {
            if (window.currentUser && window.currentProfile) {
                updateSidebarUser({
                    email: window.currentUser.email,
                    username: window.currentProfile.username,
                    avatar_url: window.currentProfile.avatar_url
                });
                return;
            }

            // Si no hay datos globales, intentar obtenerlos de Supabase
            if (window.initSupabase) {
                const supabase = window.initSupabase();
                if (supabase) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        // Debugging logs
                        console.log('🔍 Supabase Session User:', session.user);
                        console.log('🔍 Profile Data:', profile);
                        if (profileError) console.warn('⚠️ Error fetching profile:', profileError);

                        // Prioridad de Visualización:
                        // 1. Profile DB: Nombre Completo > Username
                        // 2. Auth Metadata: Nombre Completo > Username
                        // 3. Fallback: Email

                        const displayName = profile?.full_name
                            || profile?.username
                            || session.user.user_metadata?.full_name
                            || session.user.user_metadata?.name
                            || session.user.user_metadata?.username
                            || session.user.email.split('@')[0];

                        const avatar_url = profile?.avatar_url
                            || session.user.user_metadata?.avatar_url;

                        updateSidebarUser({
                            email: session.user.email,
                            username: displayName,
                            avatar_url: avatar_url
                        });
                    }
                }
            }
        }

        fetchUserForSidebar();

    }, 0);

    // 4. Escuchar evento global (para actualizaciones tardías)
    window.addEventListener('userReady', (e) => {
        const data = e.detail;
        updateSidebarUser({
            email: data.session?.email,
            username: data.profile?.username,
            avatar_url: data.profile?.avatar_url
        });
    });

})();
