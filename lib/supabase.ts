
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in different environments
const getEnv = (key: string) => {
  try {
    // Check Vite environment
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

// --- CONFIGURAÇÃO DE AMBIENTE ---
// IMPORTANTE: Configure as variáveis de ambiente no Vercel:
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ ERRO: Variáveis de ambiente Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel');
}

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Opções do cliente Supabase para Produção
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

console.log(`🔌 Supabase Conectado: PRODUÇÃO`);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
