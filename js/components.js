/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - COMPONENT LOADER
   Sistema para cargar componentes HTML reutilizables
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Carga un componente HTML en un contenedor
 * @param {string} containerId - ID del elemento contenedor
 * @param {string} componentPath - Ruta al archivo del componente
 * @returns {Promise<void>}
 */
async function loadComponent(containerId, componentPath) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}: ${response.status}`);
        }

        const html = await response.text();
        container.innerHTML = html;

        // Reinicializar eventos del componente cargado
        initComponentEvents(containerId);

    } catch (error) {
        console.error(`Error loading component:`, error);
    }
}

/**
 * Ejecuta scripts dentro de un contenedor cargado dinámicamente
 */
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

/**
 * Inicializa eventos específicos de cada componente
 * @param {string} componentId - ID del componente cargado
 */
function initComponentEvents(componentId) {
    if (componentId === 'navbar-container') {
        // Lógica de Autenticación Dinámica
        (async function updateNavbarAuth() {
            // Esperar a que Supabase esté listo si es necesario
            let supabase = window.supabaseClient;
            if (!supabase && window.initSupabase) {
                supabase = window.initSupabase();
            }

            if (!supabase) {
                console.warn('Navbar: Supabase not ready, retrying...');
                setTimeout(updateNavbarAuth, 500);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            const navLogin = document.getElementById('nav-login');
            const navRegister = document.getElementById('nav-register');
            const navDashboard = document.getElementById('nav-dashboard');
            const navCta = document.getElementById('nav-cta');
            const navLogout = document.getElementById('nav-logout');
            const mobileGuest = document.getElementById('mobile-guest-links');
            const mobileAuth = document.getElementById('mobile-auth-links');

            const handleLogout = async () => {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            };

            if (session) {
                // Usuario Logueado
                if (navLogin) navLogin.classList.add('hidden');
                if (navRegister) navRegister.classList.add('hidden');
                if (navDashboard) navDashboard.classList.remove('hidden');
                if (navCta) navCta.classList.add('hidden');
                if (navLogout) {
                    navLogout.classList.remove('hidden');
                    navLogout.onclick = handleLogout;
                }
                if (mobileGuest) mobileGuest.classList.add('hidden');
                if (mobileAuth) {
                    mobileAuth.classList.remove('hidden');
                    const mLogout = document.getElementById('mobile-logout-btn');
                    if (mLogout) mLogout.onclick = handleLogout;
                }
            } else {
                // Invitado
                if (navLogin) navLogin.classList.remove('hidden');
                if (navRegister) navRegister.classList.remove('hidden');
                if (navDashboard) navDashboard.classList.add('hidden');
                if (navCta) navCta.classList.remove('hidden');
                if (navLogout) navLogout.classList.add('hidden');
                if (mobileGuest) mobileGuest.classList.remove('hidden');
                if (mobileAuth) mobileAuth.classList.add('hidden');
            }
        })();

        // Mobile menu toggle
        setTimeout(function () {
            const menuBtn = document.querySelector('#mobile-menu-btn');
            const mobileMenu = document.querySelector('#mobile-menu');

            console.log('Navbar - Button:', menuBtn, 'Menu:', mobileMenu);

            if (menuBtn && mobileMenu) {
                menuBtn.onclick = function (e) {
                    e.stopPropagation();
                    mobileMenu.classList.toggle('hidden');
                    console.log('Menu toggled, hidden:', mobileMenu.classList.contains('hidden'));

                    // Cambiar icono hamburguesa <-> X
                    const svg = menuBtn.querySelector('svg');
                    if (svg) {
                        if (mobileMenu.classList.contains('hidden')) {
                            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
                        } else {
                            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
                        }
                    }
                };
            } else {
                console.error('Mobile menu elements not found!');
            }
        }, 100);

        // Marcar link activo
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.remove('text-slate-400');
                link.classList.add('text-slate-200', 'font-medium');
            }
        });
    }

    if (componentId === 'sidebar-container') {
        // Marcar link activo en sidebar
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.remove('text-slate-400');
                link.classList.add('bg-slate-700/50', 'text-indigo-400');
            }
        });
    }
}

/**
 * Carga todos los componentes comunes de la página
 */
async function loadAllComponents() {
    const components = [
        { id: 'navbar-container', path: 'components/navbar.html' },
        { id: 'footer-container', path: 'components/footer.html' },
        { id: 'sidebar-container', path: 'components/sidebar.html' }
    ];

    // Cargar componentes secuencialmente para asegurar orden
    for (const comp of components) {
        if (document.getElementById(comp.id)) {
            await loadComponent(comp.id, comp.path);
        }
    }
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadAllComponents);
