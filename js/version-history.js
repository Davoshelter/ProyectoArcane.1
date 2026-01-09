/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - VERSION HISTORY v1.0
   Sistema de historial de versiones tipo commits
   Preparado para integración con Supabase
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE KEY PREFIX
    // ═══════════════════════════════════════════════════════════════════════

    var HISTORY_PREFIX = 'prompt_history_';
    var MAX_VERSIONS = 50; // Máximo de versiones por prompt

    // ═══════════════════════════════════════════════════════════════════════
    // FUNCIONES PRINCIPALES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Guarda una nueva versión del prompt
     */
    function saveVersion(promptData) {
        if (!promptData || !promptData.id) return null;

        var historyKey = HISTORY_PREFIX + promptData.id;
        var history = JSON.parse(localStorage.getItem(historyKey) || '[]');

        // Crear nueva versión
        var version = {
            id: 'v_' + Date.now(),
            timestamp: new Date().toISOString(),
            title: promptData.title || 'Sin título',
            content: promptData.content || '',
            notes: promptData.notes || '',
            message: generateCommitMessage(history.length)
        };

        // Añadir al inicio
        history.unshift(version);

        // Limitar cantidad de versiones
        if (history.length > MAX_VERSIONS) {
            history = history.slice(0, MAX_VERSIONS);
        }

        // Guardar
        localStorage.setItem(historyKey, JSON.stringify(history));

        return version;
    }

    /**
     * Genera un mensaje de commit automático
     */
    function generateCommitMessage(versionNumber) {
        var messages = [
            'Cambios guardados',
            'Actualización del prompt',
            'Mejoras aplicadas',
            'Edición guardada'
        ];
        return messages[versionNumber % messages.length] + ' #' + (versionNumber + 1);
    }

    /**
     * Obtiene el historial de un prompt
     */
    function getHistory(promptId) {
        if (!promptId) return [];
        var historyKey = HISTORY_PREFIX + promptId;
        return JSON.parse(localStorage.getItem(historyKey) || '[]');
    }

    /**
     * Obtiene una versión específica
     */
    function getVersion(promptId, versionId) {
        var history = getHistory(promptId);
        return history.find(function (v) { return v.id === versionId; });
    }

    /**
     * Revierte a una versión anterior
     */
    function revertToVersion(promptId, versionId) {
        var version = getVersion(promptId, versionId);
        if (!version) return null;

        // Aplicar datos de la versión al editor
        if (window.PromptHub && window.PromptHub.Editor) {
            window.PromptHub.Editor.setPromptData({
                title: version.title,
                content: version.content,
                notes: version.notes
            });
        }

        return version;
    }

    /**
     * Elimina todo el historial de un prompt
     */
    function clearHistory(promptId) {
        if (!promptId) return;
        var historyKey = HISTORY_PREFIX + promptId;
        localStorage.removeItem(historyKey);
    }

    /**
     * Formatea la fecha para mostrar
     */
    function formatDate(isoString) {
        var date = new Date(isoString);
        var now = new Date();
        var diff = now - date;

        // Menos de 1 minuto
        if (diff < 60000) {
            return 'Hace un momento';
        }
        // Menos de 1 hora
        if (diff < 3600000) {
            var mins = Math.floor(diff / 60000);
            return 'Hace ' + mins + ' minuto' + (mins > 1 ? 's' : '');
        }
        // Menos de 1 día
        if (diff < 86400000) {
            var hours = Math.floor(diff / 3600000);
            return 'Hace ' + hours + ' hora' + (hours > 1 ? 's' : '');
        }
        // Menos de 7 días
        if (diff < 604800000) {
            var days = Math.floor(diff / 86400000);
            return 'Hace ' + days + ' día' + (days > 1 ? 's' : '');
        }
        // Más de 7 días
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Renderiza el historial en el modal
     */
    function renderHistory(promptId) {
        var historyList = document.getElementById('history-list');
        if (!historyList) return;

        var history = getHistory(promptId);

        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-slate-500 text-center py-8">No hay versiones guardadas aún.<br>Cada vez que guardes, se creará una versión.</p>';
            return;
        }

        var html = '';
        history.forEach(function (version, index) {
            var isLatest = index === 0;
            html += '<div class="version-item p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">';
            html += '  <div class="flex items-start justify-between gap-4">';
            html += '    <div class="flex-1">';
            html += '      <div class="flex items-center gap-2 mb-1">';
            html += '        <span class="font-mono text-sm text-indigo-400">' + version.id.substring(2, 10) + '</span>';
            if (isLatest) {
                html += '        <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">Actual</span>';
            }
            html += '      </div>';
            html += '      <p class="text-slate-300 text-sm mb-1">' + escapeHtml(version.message) + '</p>';
            html += '      <p class="text-slate-500 text-xs">' + formatDate(version.timestamp) + '</p>';
            html += '    </div>';
            if (!isLatest) {
                html += '    <button class="revert-btn px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 rounded-lg transition-colors" data-version-id="' + version.id + '">';
                html += '      Revertir';
                html += '    </button>';
            }
            html += '  </div>';
            html += '  <div class="mt-3 p-3 bg-slate-950 rounded-lg max-h-24 overflow-hidden">';
            html += '    <p class="font-mono text-xs text-slate-500 truncate">' + escapeHtml(version.content.substring(0, 200)) + (version.content.length > 200 ? '...' : '') + '</p>';
            html += '  </div>';
            html += '</div>';
        });

        historyList.innerHTML = html;

        // Event listeners para revertir
        var revertBtns = historyList.querySelectorAll('.revert-btn');
        revertBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var versionId = this.getAttribute('data-version-id');
                if (confirm('¿Estás seguro de revertir a esta versión? Los cambios no guardados se perderán.')) {
                    var version = revertToVersion(promptId, versionId);
                    if (version) {
                        showToast('Revertido a versión ' + versionId.substring(2, 10), 'success');
                        // Cerrar modal
                        var modal = document.getElementById('history-modal');
                        if (modal) {
                            modal.classList.add('hidden');
                            modal.classList.remove('flex');
                        }
                    }
                }
            });
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg z-50 ' +
            (type === 'success' ? 'bg-emerald-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPONER API GLOBAL
    // ═══════════════════════════════════════════════════════════════════════

    window.PromptHub = window.PromptHub || {};
    window.PromptHub.VersionHistory = {
        save: saveVersion,
        getHistory: getHistory,
        getVersion: getVersion,
        revert: revertToVersion,
        clear: clearHistory,
        render: renderHistory,

        // Para futura integración con Supabase
        // Estos métodos serán sobrescritos
        syncToServer: function (promptId) {
            console.log('Sync to Supabase - Pendiente implementación');
            return Promise.resolve();
        },
        loadFromServer: function (promptId) {
            console.log('Load from Supabase - Pendiente implementación');
            return Promise.resolve([]);
        }
    };

})();
