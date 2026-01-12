/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - MAIN JAVASCRIPT
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Inicialización principal de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Prompt Hub initialized');

    // Inicializar componentes
    initMobileMenu();
    initSmoothScroll();
    initAnimationsOnScroll();
});

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE MENU TOGGLE
   ───────────────────────────────────────────────────────────────────────────── */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Toggle icon animation
            const icon = menuBtn.querySelector('svg');
            icon.classList.toggle('rotate-90');
        });
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SMOOTH SCROLL FOR ANCHOR LINKS
   ───────────────────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Ignorar enlaces vacíos o que no sean selectores válidos simples
            if (!targetId || targetId === '#' || !targetId.match(/^#[a-zA-Z][\w-]*$/)) {
                return;
            }

            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATIONS ON SCROLL (Intersection Observer)
   ───────────────────────────────────────────────────────────────────────────── */
function initAnimationsOnScroll() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos con la clase .animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL UTILITIES (Para usar en otras pantallas)
   ───────────────────────────────────────────────────────────────────────────── */
const Modal = {
    /**
     * Abre un modal por su ID
     * @param {string} modalId - ID del elemento modal
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Cierra un modal por su ID
     * @param {string} modalId - ID del elemento modal
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    },

    /**
     * Inicializa eventos de cierre para modales
     */
    init() {
        // Cerrar al hacer click fuera del contenido
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modal.id);
                }
            });
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
                    this.close(modal.id);
                });
            }
        });

        // Botones de cerrar
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal-close');
                this.close(modalId);
            });
        });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SIDEBAR UTILITIES (Para Dashboard)
   ───────────────────────────────────────────────────────────────────────────── */
const Sidebar = {
    /**
     * Toggle sidebar en móvil
     */
    toggle() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.toggle('open');
            sidebar.classList.toggle('-translate-x-full');
        }

        if (overlay) {
            overlay.classList.toggle('hidden');
        }
    },

    /**
     * Marca el link activo basado en la URL actual
     */
    setActiveLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.sidebar-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   CLIPBOARD UTILITY (Para copiar código/prompts)
   ───────────────────────────────────────────────────────────────────────────── */
const Clipboard = {
    /**
     * Copia texto al portapapeles
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>}
     */
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('¡Copiado al portapapeles!');
            return true;
        } catch (err) {
            console.error('Error al copiar:', err);
            return false;
        }
    },

    /**
     * Muestra un toast de confirmación
     * @param {string} message - Mensaje a mostrar
     */
    showToast(message, type = 'success') {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-20 opacity-0';
            document.body.appendChild(toast);
        }

        const colors = {
            'success': 'bg-emerald-500 text-white',
            'error': 'bg-red-500 text-white',
            'info': 'bg-indigo-500 text-white'
        };

        const icons = {
            'success': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
            'error': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            'info': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };

        toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${colors[type] || colors.success}`;
        toast.innerHTML = `${icons[type] || icons.success} <span class="font-medium">${message}</span>`;

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
};

// Alias global para simplicidad
window.showToast = (msg, type) => Clipboard.showToast(msg, type);

/* ─────────────────────────────────────────────────────────────────────────────
   THEME UTILITIES (Por si se quiere toggle dark/light en el futuro)
   ───────────────────────────────────────────────────────────────────────────── */
const Theme = {
    /**
     * Obtiene el tema actual
     * @returns {string} 'dark' o 'light'
     */
    get() {
        return localStorage.getItem('theme') || 'dark';
    },

    /**
     * Establece el tema
     * @param {string} theme - 'dark' o 'light'
     */
    set(theme) {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    },

    /**
     * Toggle entre temas
     */
    toggle() {
        const current = this.get();
        this.set(current === 'dark' ? 'light' : 'dark');
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT FOR GLOBAL USE
   ───────────────────────────────────────────────────────────────────────────── */
window.PromptHub = {
    Modal,
    Sidebar,
    Clipboard,
    Theme
};
