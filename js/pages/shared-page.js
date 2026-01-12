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
        const container = document.getElementById('shared-with-me-grid');
        const countEl = document.getElementById('shared-with-me-count');
        if (!container) return;

        try {
            const result = await window.DataService.getSharedWithMe(currentUserId);
            if (countEl) countEl.textContent = `• ${result.count} prompts`;

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
                return;
            }

            container.innerHTML = '';
            result.data.forEach(item => {
                const prompt = item.prompts;
                const author = item.profiles?.username || 'Anónimo';
                const permissionText = item.permission === 'edit' ? 'Puede editar' : 'Solo ver';
                const permissionIcon = item.permission === 'edit' 
                    ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>'
                    : '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>';

                const colors = window.PromptCard ? window.PromptCard.getAIColors(prompt.ai_types) : { bg: 'bg-slate-600', text: 'text-slate-400' };
                const icon = window.PromptCard ? window.PromptCard.getAIIcon(prompt.ai_types) : '';

                const card = document.createElement('div');
                card.className = 'group block rounded-xl border border-slate-700 bg-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 h-[220px] cursor-pointer';
                card.onclick = () => window.location.href = `edit-note.html?id=${prompt.id}`;
                
                card.innerHTML = `
                    <div class="h-[88px] ${colors.bg} flex items-center justify-center relative">
                        <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            ${icon}
                        </div>
                        <span class="absolute bottom-2 left-2 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-[10px] text-white flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            @${author}
                        </span>
                    </div>
                    <div class="p-4 font-mono h-[132px] flex flex-col">
                        <h3 class="text-base font-bold text-slate-100 mb-1 truncate">${prompt.title}</h3>
                        <p class="${colors.text} text-sm mb-2">${prompt.categories?.name || 'General'}</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-slate-500 text-xs">${new Date(item.created_at).toLocaleDateString()}</span>
                            <span class="text-teal-400 text-xs flex items-center gap-1">
                                ${permissionIcon}
                                ${permissionText}
                            </span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            console.log('✅ Shared with me loaded');

        } catch (error) {
            console.error('❌ Error loading shared with me:', error);
        }
    }

    async function loadMyShared() {
        const container = document.getElementById('my-shared-grid');
        const countEl = document.getElementById('my-shared-count');
        if (!container) return;

        try {
            const result = await window.DataService.getMySharedPrompts(currentUserId);
            if (countEl) countEl.textContent = `• ${result.count} prompts`;

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
                return;
            }

            container.innerHTML = '';
            result.data.forEach(item => {
                const prompt = item.prompts;
                const sharedWith = item.profiles?.username || 'Usuario';
                
                const colors = window.PromptCard ? window.PromptCard.getAIColors(prompt.ai_types) : { bg: 'bg-slate-600', text: 'text-slate-400' };
                const icon = window.PromptCard ? window.PromptCard.getAIIcon(prompt.ai_types) : '';

                const card = document.createElement('div');
                card.className = 'group block rounded-xl border border-slate-700 bg-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 h-[220px] cursor-pointer';
                card.onclick = () => window.location.href = `edit-note.html?id=${prompt.id}`;

                card.innerHTML = `
                    <div class="h-[88px] ${colors.bg} flex items-center justify-center relative">
                        <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            ${icon}
                        </div>
                    </div>
                    <div class="p-4 font-mono h-[132px] flex flex-col">
                        <h3 class="text-base font-bold text-slate-100 mb-1 truncate">${prompt.title}</h3>
                        <p class="${colors.text} text-sm mb-2">${prompt.categories?.name || 'General'}</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-teal-400 text-xs flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                                @${sharedWith}
                            </span>
                            <span class="text-slate-500 text-xs">${new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            console.log('✅ My shared loaded');

        } catch (error) {
            console.error('❌ Error loading my shared:', error);
        }
    }

    console.log('✅ Shared Page Controller loaded');
})();
