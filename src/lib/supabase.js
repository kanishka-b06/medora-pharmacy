import { createClient } from '@supabase/supabase-js';

// Resolve environment variables safely in both Vite and Node.js testing runtimes
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks whether valid Supabase credentials are configured.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project')
);

/**
 * Supabase client instance.
 * Returns null if credentials are unconfigured, triggering graceful offline/local fallback.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

if (!isSupabaseConfigured && env.DEV) {
  console.info(
    '%c[MEDORA Database Status]%c Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set in .env. Running on fallback local state until configured.',
    'color: #0d9488; font-weight: bold;',
    'color: inherit;'
  );
}
