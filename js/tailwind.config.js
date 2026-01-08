/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - TAILWIND CONFIGURATION
   Theme: Cyber AI (Dark Mode)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Esta configuración se aplica al objeto tailwind.config en el HTML
 * Copia este objeto y pégalo en el script de configuración de Tailwind
 */

const promptHubTheme = {
    theme: {
        extend: {
            // ─────────────────────────────────────────────────────────────
            // CUSTOM FONTS
            // ─────────────────────────────────────────────────────────────
            fontFamily: {
                'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },

            // ─────────────────────────────────────────────────────────────
            // CUSTOM COLORS (Extensión del theme por defecto)
            // ─────────────────────────────────────────────────────────────
            colors: {
                // Brand colors
                'brand': {
                    primary: '#6366f1',   // indigo-500
                    secondary: '#2dd4bf', // teal-400
                    accent: '#8b5cf6',    // violet-500
                },
                // Semantic colors
                'cyber': {
                    dark: '#0f172a',      // slate-900 - Fondo principal
                    panel: '#1e293b',     // slate-800 - Contenedores
                    border: '#334155',    // slate-700 - Bordes
                    muted: '#94a3b8',     // slate-400 - Texto secundario
                },
            },

            // ─────────────────────────────────────────────────────────────
            // CUSTOM ANIMATIONS
            // ─────────────────────────────────────────────────────────────
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
                },
            },

            // ─────────────────────────────────────────────────────────────
            // CUSTOM SPACING
            // ─────────────────────────────────────────────────────────────
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            // ─────────────────────────────────────────────────────────────
            // CUSTOM BOX SHADOWS
            // ─────────────────────────────────────────────────────────────
            boxShadow: {
                'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-teal': '0 0 20px rgba(45, 212, 191, 0.3)',
                'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3)',
                'card': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
            },

            // ─────────────────────────────────────────────────────────────
            // CUSTOM BACKDROP BLUR
            // ─────────────────────────────────────────────────────────────
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
};

// Exportar para uso en consola/debug
if (typeof window !== 'undefined') {
    window.promptHubTheme = promptHubTheme;
}
