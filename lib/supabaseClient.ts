// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // needed so Supabase can finalize OAuth login from the URL hash
    detectSessionInUrl: true,

    // keep user logged in on web
    persistSession: true,
    autoRefreshToken: true,

    // recommended flow for browser-based OAuth providers
    flowType: 'pkce',
  },
});
