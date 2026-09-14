import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided in Vite environment variables
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project')
);

// Create Supabase client instance (or a harmless mock if env vars are pending)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '%c[MEDORA Database Status]%c Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set in .env. Running on fallback local state until configured.',
    'color: #0d9488; font-weight: bold;',
    'color: inherit;'
  );
}
