/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT HUB - DATA SERVICE
   Servicio centralizado para consultas a Supabase
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // =========================================================================
    // HELPER: Obtener cliente Supabase
    // =========================================================================
    function getSupabase() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.initSupabase) return window.initSupabase();
        return null;
    }

    // =========================================================================
    // CATEGORÍAS
    // =========================================================================
    async function getCategories() {
        const supabase = getSupabase();
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('❌ Error loading categories:', e);
            return [];
        }
    }

    // =========================================================================
    // TIPOS DE IA
    // =========================================================================
    async function getAITypes() {
        const supabase = getSupabase();
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('ai_types')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('❌ Error loading AI types:', e);
            return [];
        }
    }

    // =========================================================================
    // PROMPTS PÚBLICOS (con paginación y filtros)
    // =========================================================================
    async function getPublicPrompts(options = {}) {
        const supabase = getSupabase();
        if (!supabase) return { data: [], count: 0 };

        const {
            page = 1,
            limit = 12,
            categorySlug = null,
            aiTypeSlug = null,
            search = '',
            orderBy = 'created_at',
            ascending = false
        } = options;

        try {
            let query = supabase
                .from('prompts')
                .select(`
                    *,
                    categories(id, name, slug, color),
                    ai_types(id, name, slug, icon_svg),
                    profiles(username, avatar_url)
                `, { count: 'exact' })
                .eq('is_public', true);

            // Filtro por categoría
            if (categorySlug && categorySlug !== 'all') {
                const { data: cat } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('slug', categorySlug)
                    .single();
                if (cat) query = query.eq('category_id', cat.id);
            }

            // Filtro por tipo de IA
            if (aiTypeSlug) {
                const { data: ai } = await supabase
                    .from('ai_types')
                    .select('id')
                    .eq('slug', aiTypeSlug)
                    .single();
                if (ai) query = query.eq('ai_type_id', ai.id);
            }

            // Búsqueda por texto
            if (search) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`);
            }

            // Ordenamiento
            query = query.order(orderBy, { ascending });

            // Paginación
            const start = (page - 1) * limit;
            query = query.range(start, start + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;
            return { data: data || [], count: count || 0 };
        } catch (e) {
            console.error('❌ Error loading public prompts:', e);
            return { data: [], count: 0 };
        }
    }

    // =========================================================================
    // PROMPTS POPULARES (Top por view_count)
    // =========================================================================
    async function getPopularPrompts(limit = 3) {
        const supabase = getSupabase();
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('prompts')
                .select(`
                    *,
                    categories(id, name, slug, color),
                    ai_types(id, name, slug, icon_svg),
                    profiles(username, avatar_url)
                `)
                .eq('is_public', true)
                .order('view_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('❌ Error loading popular prompts:', e);
            return [];
        }
    }

    // =========================================================================
    // PROMPTS FAVORITOS DEL USUARIO
    // =========================================================================
    async function getFavoritePrompts(userId, options = {}) {
        const supabase = getSupabase();
        if (!supabase || !userId) return { data: [], count: 0 };

        const { page = 1, limit = 12 } = options;

        try {
            let query = supabase
                .from('prompts')
                .select(`
                    *,
                    categories(id, name, slug, color),
                    ai_types(id, name, slug, icon_svg)
                `, { count: 'exact' })
                .eq('user_id', userId)
                .eq('is_favorite', true)
                .order('updated_at', { ascending: false });

            const start = (page - 1) * limit;
            query = query.range(start, start + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;
            return { data: data || [], count: count || 0 };
        } catch (e) {
            console.error('❌ Error loading favorites:', e);
            return { data: [], count: 0 };
        }
    }

    // =========================================================================
    // PROMPTS PÚBLICOS DEL USUARIO ACTUAL
    // =========================================================================
    async function getUserPublicPrompts(userId, options = {}) {
        const supabase = getSupabase();
        if (!supabase || !userId) return { data: [], count: 0 };

        const { page = 1, limit = 12 } = options;

        try {
            let query = supabase
                .from('prompts')
                .select(`
                    *,
                    categories(id, name, slug, color),
                    ai_types(id, name, slug, icon_svg)
                `, { count: 'exact' })
                .eq('user_id', userId)
                .eq('is_public', true)
                .order('updated_at', { ascending: false });

            const start = (page - 1) * limit;
            query = query.range(start, start + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;
            return { data: data || [], count: count || 0 };
        } catch (e) {
            console.error('❌ Error loading user public prompts:', e);
            return { data: [], count: 0 };
        }
    }

    // =========================================================================
    // DATOS PARA EL GRAFO (Nodos y Conexiones)
    // =========================================================================
    async function getGraphData(userId) {
        const supabase = getSupabase();
        if (!supabase || !userId) return { nodes: [], links: [] };

        try {
            // Obtener prompts del usuario como nodos
            const { data: prompts, error: promptsError } = await supabase
                .from('prompts')
                .select(`
                    id,
                    title,
                    categories(name, color)
                `)
                .eq('user_id', userId);

            if (promptsError) throw promptsError;

            // Mapear colores por categoría
            const categoryColors = {
                'programacion': '#10b981',
                'programación': '#10b981',
                'arte digital': '#6366f1',
                'escritura': '#8b5cf6',
                'fotografia': '#f97316',
                'fotografía': '#f97316',
                'analisis': '#3b82f6',
                'análisis': '#3b82f6',
                'marketing': '#ec4899',
                'default': '#6366f1'
            };

            // Crear nodos
            const nodes = (prompts || []).map((p, index) => {
                const catName = p.categories?.name?.toLowerCase() || 'default';
                const color = p.categories?.color || categoryColors[catName] || categoryColors['default'];
                return {
                    id: p.id,
                    name: p.title || 'Sin título',
                    category: p.categories?.name || 'General',
                    color: color,
                    size: 22
                };
            });

            // Obtener conexiones
            const { data: connections, error: connectionsError } = await supabase
                .from('prompt_connections')
                .select('source_id, target_id')
                .eq('user_id', userId);

            if (connectionsError) throw connectionsError;

            // Crear links (solo si ambos nodos existen)
            const nodeIds = new Set(nodes.map(n => n.id));
            const links = (connections || [])
                .filter(c => nodeIds.has(c.source_id) && nodeIds.has(c.target_id))
                .map(c => ({
                    source: c.source_id,
                    target: c.target_id
                }));

            return { nodes, links };
        } catch (e) {
            console.error('❌ Error loading graph data:', e);
            return { nodes: [], links: [] };
        }
    }

    // =========================================================================
    // PROMPTS COMPARTIDOS (Tabla prompt_shares)
    // =========================================================================
    async function getSharedWithMe(userId) {
        const supabase = getSupabase();
        if (!supabase || !userId) return { data: [], count: 0 };

        try {
            const { data, error, count } = await supabase
                .from('prompt_shares')
                .select(`
                    id,
                    permission,
                    created_at,
                    prompts (
                        id, title, content, description, view_count, updated_at,
                        categories (name, color),
                        ai_types (name, slug, icon_svg)
                    ),
                    profiles:shared_by (username, avatar_url)
                `, { count: 'exact' })
                .eq('shared_with', userId);

            if (error) throw error;
            return { data: data || [], count: count || 0 };
        } catch (e) {
            console.error('❌ Error loading shared with me:', e);
            return { data: [], count: 0 };
        }
    }

    async function getMySharedPrompts(userId) {
        const supabase = getSupabase();
        if (!supabase || !userId) return { data: [], count: 0 };

        try {
            const { data, error, count } = await supabase
                .from('prompt_shares')
                .select(`
                    id,
                    permission,
                    shared_with,
                    prompts (
                        id, title, content, description, view_count, updated_at,
                        categories (name, color),
                        ai_types (name, slug, icon_svg)
                    ),
                    profiles:shared_with (username, avatar_url)
                `, { count: 'exact' })
                .eq('shared_by', userId);

            if (error) throw error;
            return { data: data || [], count: count || 0 };
        } catch (e) {
            console.error('❌ Error loading my shared prompts:', e);
            return { data: [], count: 0 };
        }
    }

    // =========================================================================
    // OBTENER SESIÓN ACTUAL
    // =========================================================================
    async function getCurrentSession() {
        const supabase = getSupabase();
        if (!supabase) return null;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        } catch (e) {
            console.error('❌ Error getting session:', e);
            return null;
        }
    }

    // =========================================================================
    // EXPONER API GLOBAL
    // =========================================================================
    window.DataService = {
        getSupabase,
        getCategories,
        getAITypes,
        getPublicPrompts,
        getPopularPrompts,
        getFavoritePrompts,
        getUserPublicPrompts,
        getGraphData,
        getSharedWithMe,
        getMySharedPrompts,
        getCurrentSession
    };

    console.log('✅ DataService loaded');
})();
