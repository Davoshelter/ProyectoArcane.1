/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - VERSION HISTORY v5.1 (Simplificado)
   ═══════════════════════════════════════════════════════════════════════════ */

console.log('🔄 version-history.js: Iniciando carga...');

(function () {
    'use strict';

    // Crear namespace
    if (!window.PromptHub) {
        window.PromptHub = {};
    }

    // Credenciales
    var SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';

    // Estado interno
    var cachedVersions = [];
    var currentPromptId = null;

    function getClient() {
        if (window.supabase && window.supabase.createClient) {
            return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
        if (window.initSupabase) {
            return window.initSupabase();
        }
        return null;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        var date = new Date(dateStr);
        var now = new Date();
        var diffMs = now - date;
        var diffMins = Math.floor(diffMs / (1000 * 60));
        var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return 'Hace ' + diffMins + ' min';
        if (diffHours < 24) return 'Hace ' + diffHours + 'h';
        if (diffDays < 7) return 'Hace ' + diffDays + ' dias';
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    // Renderizar diff simple (sin libreria externa)
    function renderDiff(oldContent, newContent) {
        var oldText = oldContent || '';
        var newText = newContent || '';

        var oldLines = oldText.split('\n');
        var newLines = newText.split('\n');

        var html = '<div class="diff-container font-mono text-xs">';

        // Estadisticas simples
        var added = 0;
        var removed = 0;

        // Comparacion linea por linea simple
        var maxLines = Math.max(oldLines.length, newLines.length);

        for (var i = 0; i < maxLines; i++) {
            var oldLine = oldLines[i] || '';
            var newLine = newLines[i] || '';

            if (oldLine === newLine) {
                // Linea sin cambios
                html += '<div class="flex"><span class="w-6 text-center text-slate-600"> </span><span class="flex-1 text-slate-500 px-2 py-0.5">' + escapeHtml(newLine || ' ') + '</span></div>';
            } else if (i >= oldLines.length) {
                // Linea nueva
                added++;
                html += '<div class="flex"><span class="w-6 text-center text-emerald-500">+</span><span class="flex-1 bg-emerald-500/15 text-emerald-300 px-2 py-0.5">' + escapeHtml(newLine || ' ') + '</span></div>';
            } else if (i >= newLines.length) {
                // Linea eliminada
                removed++;
                html += '<div class="flex"><span class="w-6 text-center text-red-500">-</span><span class="flex-1 bg-red-500/15 text-red-300 px-2 py-0.5 line-through">' + escapeHtml(oldLine || ' ') + '</span></div>';
            } else {
                // Linea modificada (mostrar ambas)
                removed++;
                added++;
                html += '<div class="flex"><span class="w-6 text-center text-red-500">-</span><span class="flex-1 bg-red-500/15 text-red-300 px-2 py-0.5 line-through">' + escapeHtml(oldLine || ' ') + '</span></div>';
                html += '<div class="flex"><span class="w-6 text-center text-emerald-500">+</span><span class="flex-1 bg-emerald-500/15 text-emerald-300 px-2 py-0.5">' + escapeHtml(newLine || ' ') + '</span></div>';
            }
        }

        html += '</div>';

        // Estadisticas
        var statsHtml = '<div class="flex items-center gap-4 mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">';
        statsHtml += '<span class="text-emerald-400 font-medium text-sm">+' + added + ' linea(s)</span>';
        statsHtml += '<span class="text-red-400 font-medium text-sm">-' + removed + ' linea(s)</span>';
        statsHtml += '</div>';

        return statsHtml + html;
    }

    // Mostrar diff de una version
    function showVersionDiff(versionIndex) {
        var diffPanel = document.getElementById('diff-panel');
        if (!diffPanel) return;

        var currentVersion = cachedVersions[versionIndex];
        if (!currentVersion) return;

        var previousVersion = cachedVersions[versionIndex + 1] || null;

        // Marcar version activa
        var items = document.querySelectorAll('.version-item');
        for (var i = 0; i < items.length; i++) {
            if (i === versionIndex) {
                items[i].style.border = '2px solid #6366f1';
                items[i].style.background = 'rgba(99, 102, 241, 0.1)';
            } else {
                items[i].style.border = '1px solid #334155';
                items[i].style.background = '';
            }
        }

        // Header
        var versionLabel = previousVersion
            ? 'v' + previousVersion.version_number + ' → v' + currentVersion.version_number
            : 'v' + currentVersion.version_number + ' (version inicial)';

        var headerHtml = '<div class="mb-4">';
        headerHtml += '<h3 class="text-sm font-semibold text-slate-200 mb-2">Comparando: ' + versionLabel + '</h3>';
        headerHtml += '<span class="text-xs text-slate-500">' + formatDate(currentVersion.created_at) + '</span>';
        headerHtml += '</div>';

        var diffHtml = renderDiff(previousVersion ? previousVersion.content : '', currentVersion.content);

        diffPanel.innerHTML = headerHtml + diffHtml;
    }

    // Renderizar lista de versiones
    function renderHistory(promptId) {
        console.log('📜 renderHistory llamado con promptId:', promptId);

        var historyList = document.getElementById('history-list');
        var diffPanel = document.getElementById('diff-panel');

        if (!historyList) {
            console.error('❌ No se encontro history-list');
            return;
        }

        currentPromptId = promptId;

        historyList.innerHTML = '<div class="text-center py-8 text-slate-500">Cargando versiones...</div>';
        if (diffPanel) {
            diffPanel.innerHTML = '<div class="flex items-center justify-center h-full text-slate-500"><p class="text-sm">Cargando...</p></div>';
        }

        var supabase = getClient();
        if (!supabase) {
            historyList.innerHTML = '<p class="text-red-400 text-center text-sm">Error: Cliente Supabase no disponible.</p>';
            return;
        }

        supabase
            .from('prompt_versions')
            .select('*')
            .eq('prompt_id', promptId)
            .order('version_number', { ascending: false })
            .then(function (response) {
                var versions = response.data;
                var error = response.error;

                if (error) {
                    console.error('Error cargando versiones:', error);
                    historyList.innerHTML = '<p class="text-red-400 text-center py-4 text-sm">Error: ' + error.message + '</p>';
                    return;
                }

                cachedVersions = versions || [];
                console.log('📦 Versiones cargadas:', cachedVersions.length);

                if (cachedVersions.length === 0) {
                    historyList.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm">No hay versiones guardadas.<br>Guarda cambios para crear la primera version.</p>';
                    if (diffPanel) {
                        diffPanel.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-slate-500"><p class="text-sm">Sin versiones para comparar</p></div>';
                    }
                    return;
                }

                // Renderizar lista
                var html = '';
                for (var i = 0; i < cachedVersions.length; i++) {
                    var version = cachedVersions[i];
                    var isLatest = (i === 0);

                    html += '<div class="version-item p-3 bg-slate-900/50 border border-slate-700 rounded-xl cursor-pointer mb-2" onclick="window.PromptHub.VersionHistory.showDiff(' + i + ')">';
                    html += '<div class="flex items-center gap-2 mb-1">';
                    html += '<span class="font-mono text-xs font-bold text-indigo-400">v' + version.version_number + '</span>';
                    if (isLatest) {
                        html += '<span class="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">ACTUAL</span>';
                    }
                    html += '</div>';
                    html += '<p class="text-slate-500 text-xs">' + formatDate(version.created_at) + '</p>';
                    if (!isLatest) {
                        html += '<button onclick="event.stopPropagation(); window.PromptHub.VersionHistory.revert(\'' + version.id + '\')" class="mt-2 w-full px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-xs text-slate-400 hover:text-white rounded border border-slate-700">Restaurar</button>';
                    }
                    html += '</div>';
                }

                historyList.innerHTML = html;

                // Mostrar diff de la primera version
                if (cachedVersions.length > 0) {
                    showVersionDiff(0);
                }
            })
            .catch(function (e) {
                console.error('Error en renderHistory:', e);
                historyList.innerHTML = '<p class="text-red-400 text-center py-4 text-sm">Error: ' + e.message + '</p>';
            });
    }

    // Restaurar version
    function revertToVersion(versionId) {
        if (!confirm('¿Restaurar esta version?')) return;

        var supabase = getClient();
        if (!supabase) return;

        supabase
            .from('prompt_versions')
            .select('*')
            .eq('id', versionId)
            .single()
            .then(function (response) {
                var data = response.data;
                if (data) {
                    // Actualizar editor
                    if (window.easyMDE && typeof window.easyMDE.value === 'function') {
                        window.easyMDE.value(data.content);
                    } else {
                        var el = document.getElementById('prompt-content');
                        if (el) el.value = data.content;
                    }

                    // Cerrar modal
                    var modal = document.getElementById('history-modal');
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }

                    alert('Version v' + data.version_number + ' restaurada. Guarda los cambios.');
                }
            })
            .catch(function (e) {
                console.error('Error al restaurar:', e);
                alert('Error al restaurar: ' + e.message);
            });
    }

    // API Publica
    window.PromptHub.VersionHistory = {
        render: renderHistory,
        revert: revertToVersion,
        showDiff: showVersionDiff
    };

    console.log('✅ VersionHistory v5.1 cargado correctamente');
    console.log('   window.PromptHub.VersionHistory:', window.PromptHub.VersionHistory);

})();