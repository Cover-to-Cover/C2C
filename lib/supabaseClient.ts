// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwgxqonvaqvzhpqmearn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Z3hxb252YXF2emhwcW1lYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Mzk0MDMsImV4cCI6MjA1OTExNTQwM30.g5Z17a8SJJdLrgDlFh0hVWCdQU3v_aSjL_m2EbvmyKY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);