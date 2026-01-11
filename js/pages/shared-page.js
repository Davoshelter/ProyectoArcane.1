/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - SHARED PAGE CONTROLLER
   Carga prompts compartidos (placeholder - no hay tabla de sharing)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    let currentUserId = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('🔗 Shared Page: Inicializando...');

        if (!window.DataService) {
            setTimeout(init, 100);
            return;
        }

        // Verificar sesión
        const session = await window.DataService.getCurrentSession();
        if (!session) {
            window.location.href = 'auth-login.html';
            return;
        }

        currentUserId = session.user.id;

        // Como no hay tabla de sharing, mostramos estados vacíos informativos
        await loadSharedWithMe();
        await loadMyShared();
    }

    async function loadSharedWithMe() {
        // Buscar el primer grid de compartidos conmigo
        const containers = document.querySelectorAll('.grid');
        const container = containers[0]; // Primer grid después del header

        if (!container) return;

        try {
            const result = await window.DataService.getSharedWithMe(currentUserId);

            if (!result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <div class="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                            </svg>
                        </div>
                        <p class="text-slate-300 font-medium">No tienes prompts compartidos contigo</p>
                        <p class="text-slate-500 text-sm mt-2">Cuando alguien comparta un prompt contigo, aparecerá aquí</p>
                    </div>`;
            }

            console.log('✅ Shared with me loaded');

        } catch (error) {
            console.error('❌ Error loading shared with me:', error);
        }
    }

    async function loadMyShared() {
        // Buscar el segundo grid de mis compartidos
        const containers = document.querySelectorAll('.grid');
        const container = containers[1]; // Segundo grid

        if (!container) return;

        try {
            const result = await window.DataService.getMySharedPrompts(currentUserId);

            if (!result.data || result.data.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <div class="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        </div>
                        <p class="text-slate-300 font-medium">No has compartido ningún prompt</p>
                        <p class="text-slate-500 text-sm mt-2">Comparte prompts desde el editor con tu equipo</p>
                    </div>`;
            }

            console.log('✅ My shared loaded');

        } catch (error) {
            console.error('❌ Error loading my shared:', error);
        }
    }

    console.log('✅ Shared Page Controller loaded');
})();
