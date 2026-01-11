/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - GRAPH PAGE CONTROLLER
   Carga datos dinámicos para el grafo D3.js
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    let currentUserId = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        console.log('📊 Graph Page: Inicializando...');

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

        // Esperar a que D3 esté listo
        if (typeof d3 === 'undefined') {
            console.warn('⏳ Esperando D3...');
            setTimeout(init, 200);
            return;
        }

        await loadAndRenderGraph();
    }

    async function loadAndRenderGraph() {
        try {
            const graphData = await window.DataService.getGraphData(currentUserId);

            if (!graphData.nodes || graphData.nodes.length === 0) {
                showEmptyState();
                return;
            }

            renderGraph(graphData.nodes, graphData.links);
            console.log(`✅ Graph: ${graphData.nodes.length} nodos, ${graphData.links.length} enlaces cargados`);

        } catch (error) {
            console.error('❌ Error loading graph data:', error);
            showErrorState();
        }
    }

    function showEmptyState() {
        const container = document.getElementById('graph-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center p-8">
                <div class="w-24 h-24 bg-violet-500/20 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-200 mb-2">Tu grafo está vacío</h3>
                <p class="text-slate-400 max-w-md mb-6">Crea prompts y conexiones entre ellos para visualizar tu "segundo cerebro" de conocimiento IA</p>
                <a href="my-prompts.html" class="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-colors">
                    Crear tu primer Prompt
                </a>
            </div>`;
    }

    function showErrorState() {
        const container = document.getElementById('graph-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center p-8">
                <p class="text-red-400">Error al cargar el grafo</p>
            </div>`;
    }

    function renderGraph(nodes, links) {
        // Limpiar grafo existente
        const svg = d3.select('#graph');
        svg.selectAll('*').remove();

        const container = document.getElementById('graph-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        svg.attr('width', width).attr('height', height);

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        const g = svg.append('g');

        // Convertir IDs a referencias para D3
        const nodeById = new Map(nodes.map(n => [n.id, n]));
        const processedLinks = links.map(l => ({
            source: nodeById.get(l.source) || l.source,
            target: nodeById.get(l.target) || l.target
        })).filter(l => l.source && l.target);

        // Force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(processedLinks).id(d => d.id).distance(100).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => (d.size || 22) + 10));

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(processedLinks)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', '#475569')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.6);

        // Nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', 'node')
            .style('cursor', 'grab')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Node circles
        node.append('circle')
            .attr('r', d => d.size || 22)
            .attr('fill', d => d.color || '#6366f1')
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.5))');

        // Node labels
        node.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => (d.size || 22) + 15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-family', 'JetBrains Mono, monospace')
            .attr('pointer-events', 'none')
            .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

        // Hover effects
        node.on('mouseover', function (event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('stroke', d.color)
                .attr('stroke-width', 4)
                .style('filter', `drop-shadow(0 0 15px ${d.color})`);

            link.transition().duration(200)
                .attr('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? d.color : '#475569')
                .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 3 : 2);

            // Update info panel
            const connections = processedLinks.filter(l => l.source.id === d.id || l.target.id === d.id).length;
            const titleEl = document.getElementById('info-title');
            const categoryEl = document.getElementById('info-category');
            const connectionsEl = document.getElementById('info-connections');
            const panel = document.getElementById('info-panel');

            if (titleEl) titleEl.textContent = d.name;
            if (categoryEl) categoryEl.textContent = d.category;
            if (connectionsEl) connectionsEl.textContent = `Conexiones: ${connections}`;
            if (panel) panel.classList.remove('hidden');
        })
            .on('mouseout', function (event, d) {
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 3)
                    .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.5))');

                link.transition().duration(200)
                    .attr('stroke', '#475569')
                    .attr('stroke-width', 2);

                const panel = document.getElementById('info-panel');
                if (panel) panel.classList.add('hidden');
            })
            .on('dblclick', function (event, d) {
                event.preventDefault();
                event.stopPropagation();

                d3.select(this).select('circle')
                    .transition()
                    .duration(100)
                    .attr('r', (d.size || 22) * 1.3)
                    .style('filter', `drop-shadow(0 0 25px ${d.color})`)
                    .transition()
                    .duration(100)
                    .attr('r', d.size || 22);

                setTimeout(() => {
                    window.location.href = `edit-note.html?id=${d.id}`;
                }, 250);
            });

        // Simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Zoom controls
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomReset = document.getElementById('zoom-reset');

        if (zoomIn) zoomIn.addEventListener('click', () => svg.transition().call(zoom.scaleBy, 1.3));
        if (zoomOut) zoomOut.addEventListener('click', () => svg.transition().call(zoom.scaleBy, 0.7));
        if (zoomReset) zoomReset.addEventListener('click', () => svg.transition().call(zoom.transform, d3.zoomIdentity));

        // Resize handler
        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            svg.attr('width', newWidth).attr('height', newHeight);
            simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
            simulation.alpha(0.3).restart();
        });

        // Actualizar leyenda dinámicamente
        updateLegend(nodes);
    }

    function updateLegend(nodes) {
        const legendContainer = document.querySelector('.space-y-2');
        if (!legendContainer) return;

        // Obtener categorías únicas
        const categories = [...new Set(nodes.map(n => n.category))];
        const categoryColors = {};
        nodes.forEach(n => {
            if (!categoryColors[n.category]) {
                categoryColors[n.category] = n.color;
            }
        });

        let legendHtml = '';
        categories.forEach(cat => {
            legendHtml += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background-color: ${categoryColors[cat]}"></span><span class="text-slate-300">${cat}</span></div>`;
        });

        if (legendHtml) {
            legendContainer.innerHTML = legendHtml;
        }
    }

    console.log('✅ Graph Page Controller loaded');
})();
