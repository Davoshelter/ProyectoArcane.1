/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - EDITOR v1.0
   Editor de prompts con comandos /code, formato de texto y más
   Preparado para integración con Supabase
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // VARIABLES GLOBALES
    // ═══════════════════════════════════════════════════════════════════════

    var promptContent = document.getElementById('prompt-content');
    var promptTitle = document.getElementById('prompt-title');
    var promptNotes = document.getElementById('prompt-notes');
    var copyCodeBtn = document.getElementById('copy-code-btn');
    var codeLanguage = document.getElementById('code-language');
    var insertCodeBlockBtn = document.getElementById('insert-code-block');
    var editorContainer = document.getElementById('editor-container');

    // Datos del prompt actual (será reemplazado por datos de Supabase)
    var currentPrompt = {
        id: getPromptIdFromURL() || 'new',
        title: '',
        content: '',
        notes: '',
        category: 'Programación',
        ai_type: 'chatgpt',
        tags: ['debugging', 'python'],
        is_favorite: false,
        is_public: false,
        created_at: null,
        updated_at: null
    };

    // ═══════════════════════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════

    function getPromptIdFromURL() {
        var params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in ' +
            (type === 'success' ? 'bg-emerald-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COPIAR CÓDIGO
    // ═══════════════════════════════════════════════════════════════════════

    if (copyCodeBtn && promptContent) {
        copyCodeBtn.addEventListener('click', function () {
            var text = promptContent.value;
            navigator.clipboard.writeText(text).then(function () {
                var originalText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copiado';
                setTimeout(function () {
                    copyCodeBtn.innerHTML = originalText;
                }, 2000);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMANDO /code
    // ═══════════════════════════════════════════════════════════════════════

    if (promptContent) {
        promptContent.addEventListener('input', function (e) {
            var text = this.value;
            var cursorPos = this.selectionStart;

            // Detectar /code al inicio de una línea
            var lines = text.substring(0, cursorPos).split('\n');
            var currentLine = lines[lines.length - 1];

            if (currentLine.trim() === '/code') {
                // Reemplazar /code con un bloque de código
                var beforeCode = text.substring(0, cursorPos - 5);
                var afterCode = text.substring(cursorPos);

                var codeTemplate = '\n```javascript\n// Tu código aquí\n```\n';

                this.value = beforeCode + codeTemplate + afterCode;

                // Posicionar cursor dentro del bloque
                var newPos = beforeCode.length + 16; // Después de ```javascript\n
                this.setSelectionRange(newPos, newPos);

                showToast('Bloque de código insertado', 'info');
            }
        });
    }

    // Botón para insertar bloque de código
    if (insertCodeBlockBtn && promptContent) {
        insertCodeBlockBtn.addEventListener('click', function () {
            var cursorPos = promptContent.selectionStart;
            var text = promptContent.value;

            var codeTemplate = '\n```javascript\n// Tu código aquí\n```\n';

            promptContent.value = text.substring(0, cursorPos) + codeTemplate + text.substring(cursorPos);

            var newPos = cursorPos + 16;
            promptContent.setSelectionRange(newPos, newPos);
            promptContent.focus();

            showToast('Bloque de código insertado', 'info');
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BOTONES DE FORMATO
    // ═══════════════════════════════════════════════════════════════════════

    var formatBtns = document.querySelectorAll('.format-btn');
    formatBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var format = this.getAttribute('data-format');
            if (!promptContent) return;

            var start = promptContent.selectionStart;
            var end = promptContent.selectionEnd;
            var text = promptContent.value;
            var selectedText = text.substring(start, end) || 'texto';

            var formattedText = '';
            var cursorOffset = 0;

            switch (format) {
                case 'h1':
                    formattedText = '\n# ' + selectedText + '\n';
                    cursorOffset = 3;
                    break;
                case 'h2':
                    formattedText = '\n## ' + selectedText + '\n';
                    cursorOffset = 4;
                    break;
                case 'h3':
                    formattedText = '\n### ' + selectedText + '\n';
                    cursorOffset = 5;
                    break;
                case 'bold':
                    formattedText = '**' + selectedText + '**';
                    cursorOffset = 2;
                    break;
                case 'italic':
                    formattedText = '*' + selectedText + '*';
                    cursorOffset = 1;
                    break;
                case 'code':
                    formattedText = '`' + selectedText + '`';
                    cursorOffset = 1;
                    break;
                case 'list':
                    formattedText = '\n- ' + selectedText;
                    cursorOffset = 3;
                    break;
                default:
                    formattedText = selectedText;
            }

            promptContent.value = text.substring(0, start) + formattedText + text.substring(end);

            var newPos = start + cursorOffset + selectedText.length;
            promptContent.setSelectionRange(newPos, newPos);
            promptContent.focus();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // GUARDAR PROMPT
    // ═══════════════════════════════════════════════════════════════════════

    var saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            // Recopilar datos
            currentPrompt.title = promptTitle ? promptTitle.value : '';
            currentPrompt.content = promptContent ? promptContent.value : '';
            currentPrompt.notes = promptNotes ? promptNotes.value : '';
            currentPrompt.updated_at = new Date().toISOString();

            if (!currentPrompt.created_at) {
                currentPrompt.created_at = currentPrompt.updated_at;
            }

            // Guardar versión en historial
            if (window.PromptHub && window.PromptHub.VersionHistory) {
                window.PromptHub.VersionHistory.save(currentPrompt);
            }

            // Guardar en localStorage (temporal, luego Supabase)
            savePromptToStorage(currentPrompt);

            showToast('Prompt guardado correctamente', 'success');

            // Actualizar timestamp en UI
            var lastEdit = document.getElementById('prompt-last-edit');
            if (lastEdit) {
                lastEdit.textContent = 'Guardado ahora';
            }
        });
    }

    function savePromptToStorage(prompt) {
        // Guardar prompt individual
        localStorage.setItem('prompt_' + prompt.id, JSON.stringify(prompt));

        // Actualizar lista de prompts recientes
        var recentPrompts = JSON.parse(localStorage.getItem('recent_prompts') || '[]');

        // Remover si ya existe
        recentPrompts = recentPrompts.filter(function (p) { return p.id !== prompt.id; });

        // Añadir al principio
        recentPrompts.unshift({
            id: prompt.id,
            title: prompt.title,
            category: prompt.category,
            ai_type: prompt.ai_type,
            updated_at: prompt.updated_at
        });

        // Mantener solo los últimos 20
        recentPrompts = recentPrompts.slice(0, 20);

        localStorage.setItem('recent_prompts', JSON.stringify(recentPrompts));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FAVORITO
    // ═══════════════════════════════════════════════════════════════════════

    var favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function () {
            currentPrompt.is_favorite = !currentPrompt.is_favorite;

            var svg = this.querySelector('svg');
            if (currentPrompt.is_favorite) {
                this.classList.remove('text-slate-400');
                this.classList.add('text-amber-400');
                svg.setAttribute('fill', 'currentColor');
                showToast('Añadido a favoritos', 'success');
            } else {
                this.classList.remove('text-amber-400');
                this.classList.add('text-slate-400');
                svg.setAttribute('fill', 'none');
                showToast('Removido de favoritos', 'info');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AI SIDEBAR
    // ═══════════════════════════════════════════════════════════════════════

    var aiSidebar = document.getElementById('ai-sidebar');
    var aiToggleBtn = document.getElementById('ai-toggle-btn');
    var closeAiSidebar = document.getElementById('close-ai-sidebar');
    var aiInput = document.getElementById('ai-input');
    var aiSendBtn = document.getElementById('ai-send');
    var aiChat = document.getElementById('ai-chat');

    var isAiSidebarOpen = false;

    function toggleAiSidebar() {
        isAiSidebarOpen = !isAiSidebarOpen;

        if (aiSidebar) {
            if (isAiSidebarOpen) {
                aiSidebar.style.width = '20rem'; // w-80
            } else {
                aiSidebar.style.width = '0';
            }
        }
    }

    if (aiToggleBtn) {
        aiToggleBtn.addEventListener('click', toggleAiSidebar);
    }

    if (closeAiSidebar) {
        closeAiSidebar.addEventListener('click', toggleAiSidebar);
    }

    // Enviar mensaje al AI (placeholder - se conectará a API en el futuro)
    function sendAiMessage() {
        if (!aiInput || !aiChat) return;

        var message = aiInput.value.trim();
        if (!message) return;

        // Añadir mensaje del usuario
        var userMessage = document.createElement('div');
        userMessage.className = 'flex gap-3 justify-end';
        userMessage.innerHTML = '<div class="bg-indigo-500/20 text-indigo-200 rounded-xl rounded-tr-none p-3 max-w-[85%]"><p class="text-sm">' + escapeHtml(message) + '</p></div>';
        aiChat.appendChild(userMessage);

        // Limpiar input
        aiInput.value = '';

        // Scroll al fondo
        aiChat.scrollTop = aiChat.scrollHeight;

        // Respuesta simulada (será reemplazada por llamada a API)
        setTimeout(function () {
            var aiResponse = document.createElement('div');
            aiResponse.className = 'flex gap-3';
            aiResponse.innerHTML = '<div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div class="bg-slate-700/50 rounded-xl rounded-tl-none p-3 max-w-[85%]"><p class="text-sm text-slate-300">Esta funcionalidad estará disponible pronto. Por ahora, puedo ayudarte con la estructura de tu prompt.</p></div>';
            aiChat.appendChild(aiResponse);
            aiChat.scrollTop = aiChat.scrollHeight;
        }, 1000);
    }

    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', sendAiMessage);
    }

    if (aiInput) {
        aiInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendAiMessage();
            }
        });
    }

    // Acciones rápidas de AI
    var aiActions = document.querySelectorAll('.ai-action');
    aiActions.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var action = this.textContent.trim();
            if (aiInput) {
                aiInput.value = action + ' mi prompt';
                sendAiMessage();
            }
        });
    });

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODALES
    // ═══════════════════════════════════════════════════════════════════════

    // Historial Modal
    var historyBtn = document.getElementById('history-btn');
    var historyModal = document.getElementById('history-modal');
    var closeHistoryModal = document.getElementById('close-history-modal');

    if (historyBtn && historyModal) {
        historyBtn.addEventListener('click', function () {
            historyModal.classList.remove('hidden');
            historyModal.classList.add('flex');

            // Cargar historial
            if (window.PromptHub && window.PromptHub.VersionHistory) {
                window.PromptHub.VersionHistory.render(currentPrompt.id);
            }
        });
    }

    if (closeHistoryModal && historyModal) {
        closeHistoryModal.addEventListener('click', function () {
            historyModal.classList.add('hidden');
            historyModal.classList.remove('flex');
        });

        historyModal.addEventListener('click', function (e) {
            if (e.target === historyModal) {
                historyModal.classList.add('hidden');
                historyModal.classList.remove('flex');
            }
        });
    }

    // Share Modal
    var shareBtn = document.getElementById('share-btn');
    var shareModal = document.getElementById('share-modal');
    var closeShareModal = document.getElementById('close-share-modal');
    var shareSubmit = document.getElementById('share-submit');

    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', function () {
            shareModal.classList.remove('hidden');
            shareModal.classList.add('flex');
        });
    }

    if (closeShareModal && shareModal) {
        closeShareModal.addEventListener('click', function () {
            shareModal.classList.add('hidden');
            shareModal.classList.remove('flex');
        });

        shareModal.addEventListener('click', function (e) {
            if (e.target === shareModal) {
                shareModal.classList.add('hidden');
                shareModal.classList.remove('flex');
            }
        });
    }

    if (shareSubmit) {
        shareSubmit.addEventListener('click', function () {
            var email = document.getElementById('share-email');
            var permission = document.getElementById('share-permission');

            if (email && email.value) {
                showToast('Prompt compartido con ' + email.value, 'success');
                shareModal.classList.add('hidden');
                shareModal.classList.remove('flex');
                email.value = '';
            } else {
                showToast('Ingresa un email válido', 'error');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TAGS
    // ═══════════════════════════════════════════════════════════════════════

    var tagsContainer = document.getElementById('tags-container');
    var addTagBtn = document.getElementById('add-tag-btn');

    if (tagsContainer) {
        tagsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-tag')) {
                var tagItem = e.target.closest('.tag-item');
                if (tagItem) {
                    tagItem.remove();
                }
            }
        });
    }

    if (addTagBtn) {
        addTagBtn.addEventListener('click', function () {
            var tagName = prompt('Nombre del tag:');
            if (tagName && tagName.trim()) {
                var newTag = document.createElement('span');
                newTag.className = 'tag-item px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-2';
                newTag.innerHTML = '#' + tagName.trim() + '<button class="text-slate-500 hover:text-red-400 remove-tag">×</button>';
                tagsContainer.insertBefore(newTag, addTagBtn);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPONER API GLOBAL
    // ═══════════════════════════════════════════════════════════════════════

    window.PromptHub = window.PromptHub || {};
    window.PromptHub.Editor = {
        getCurrentPrompt: function () { return currentPrompt; },
        setPromptData: function (data) {
            // Para cargar datos desde Supabase
            if (data) {
                currentPrompt = Object.assign(currentPrompt, data);
                if (promptTitle) promptTitle.value = data.title || '';
                if (promptContent) promptContent.value = data.content || '';
                if (promptNotes) promptNotes.value = data.notes || '';
            }
        },
        save: function () {
            if (saveBtn) saveBtn.click();
        }
    };

})();
