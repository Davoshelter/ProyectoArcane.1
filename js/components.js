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
