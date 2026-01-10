/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ⚠️ CREDENCIALES
const SUPABASE_URL = 'https://inlkcqhxxjqubadhwawz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubGtjcWh4eGpxdWJhZGh3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDk2MjAsImV4cCI6MjA4MzQ4NTYyMH0.DSMVS_uKRoNiFj2VyHf2m3v9VL4wpR_SuV_zfxdJLQk';

// Función para obtener el cliente, inicializándolo si es necesario
function getSupabase() {
    // Si ya tenemos una instancia global, devolverla
    if (window.supabaseClient) {
        return window.supabaseClient;
    }

    // Intentar inicializar si la librería está cargada
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase Client Initialized');
            return window.supabaseClient;
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
            return null;
        }
    } else {
        console.warn('⚠️ Supabase library not ready yet.');
        return null;
    }
}

// Intentar inicializar inmediatamente
getSupabase();

// Exportar helper para reintentar
window.initSupabase = getSupabase;