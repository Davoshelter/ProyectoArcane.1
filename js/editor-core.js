/* PROMPT HUB - EDITOR CORE */
(async function() {
    console.log('🚀 Editor Core iniciando...');
    
    // UI
    const ui = {
        title: document.getElementById('prompt-title'),
        content: document.getElementById('prompt-content'),
        notes: document.getElementById('prompt-notes'),
        saveBtn: document.getElementById('save-btn'),
        headerTitle: document.getElementById('prompt-title-display'),
        icon: document.getElementById('prompt-icon')
    };

    const id = new URLSearchParams(window.location.search).get('id');
    const URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';

    // Carga
    let supabase = null;
    await new Promise(r => {
        if(window.supabase){ r(); return; }
        let c=0; 
        const i=setInterval(()=>{
            c++;
            if(window.supabase){ clearInterval(i); r(); }
            if(c==20){ 
                let s=document.createElement('script');
                s.src='https://unpkg.com/@supabase/supabase-js@2';
                document.head.appendChild(s); 
            }
            if(c>100){ clearInterval(i); r(); }
        },100);
    });

    if(window.supabase) {
        supabase = window.supabase.createClient(URL, KEY);
        const {data:{session}} = await supabase.auth.getSession();
        if(!session) { window.location.href='auth-login.html'; return; }
        
        // Cargar
        if(id) {
            const {data:p} = await supabase.from('prompts').select('*, ai_types(icon_svg, slug)').eq('id',id).single();
            if(p) {
                ui.title.value = p.title || '';
                ui.content.value = p.content || '';
                ui.notes.value = p.description || '';
                ui.headerTitle.textContent = p.title || 'Sin Título';
                
                // Icono
                if(ui.icon && p.ai_types) {
                    const slug = p.ai_types.slug?.toLowerCase();
                    const colors = {'chatgpt':'bg-emerald-500','midjourney':'bg-indigo-500','claude':'bg-orange-500'}; // ...resto
                    ui.icon.className = `w-10 h-10 rounded-xl flex items-center justify-center ${colors[slug]||'bg-slate-700'}`;
                    if(p.ai_types.icon_svg) ui.icon.innerHTML = p.ai_types.icon_svg.replace('<svg','<svg class="w-6 h-6 text-white"');
                }
            }
        }

        // Guardar
        if(ui.saveBtn) {
            ui.saveBtn.onclick = async () => {
                ui.saveBtn.textContent = 'Guardando...';
                await supabase.from('prompts').update({
                    title: ui.title.value,
                    content: ui.content.value,
                    description: ui.notes.value,
                    updated_at: new Date().toISOString()
                }).eq('id', id);
                
                // Version
                try {
                    const {data:v} = await supabase.from('prompt_versions').select('version_number').eq('prompt_id', id).order('version_number',{ascending:false}).limit(1);
                    const ver = (v&&v.length) ? v[0].version_number+1 : 1;
                    await supabase.from('prompt_versions').insert([{prompt_id:id, version_number:ver, content:ui.content.value}]);
                } catch(e){}

                ui.saveBtn.textContent = 'Guardado';
                setTimeout(() => ui.saveBtn.innerHTML = 'Guardar', 2000);
            };
        }

        // --- LÓGICA UI RESTAURADA ---
        
        // Formato
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.onclick = () => {
                const format = btn.getAttribute('data-format');
                const start = ui.content.selectionStart;
                const end = ui.content.selectionEnd;
                const text = ui.content.value;
                const sel = text.substring(start, end) || 'texto';
                let res = sel, off = 0;

                if (format === 'h1') { res = `\n# ${sel}\n`; off = 3; }
                if (format === 'h2') { res = `\n## ${sel}\n`; off = 4; }
                if (format === 'bold') { res = `**${sel}**`; off = 2; }
                if (format === 'code') { res = `\`${sel}\``; off = 1; }
                
                ui.content.value = text.substring(0, start) + res + text.substring(end);
                ui.content.focus();
            };
        });

        // Historial
        const historyBtn = document.getElementById('history-btn');
        const historyModal = document.getElementById('history-modal');
        const closeHistory = document.getElementById('close-history-modal');

        if (historyBtn) {
            historyBtn.onclick = () => {
                historyModal.classList.remove('hidden');
                historyModal.classList.add('flex');
                if (window.PromptHub?.VersionHistory) window.PromptHub.VersionHistory.render(id);
            };
        }
        if (closeHistory) {
            closeHistory.onclick = () => {
                historyModal.classList.add('hidden');
                historyModal.classList.remove('flex');
            };
        }
    }
})();
