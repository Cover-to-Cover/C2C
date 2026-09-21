// lib/supabase.ts
//
// Created lazily so a build without EXPO_PUBLIC_SUPABASE_* env vars still
// exports (static prerender imports every route). Pages that need data check
// for null and show a clear message instead of crashing the whole site.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

export const NOT_CONFIGURED =
  "This site was built without its Supabase configuration.";
