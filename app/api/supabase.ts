import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient>;
};

export const supabase = globalForSupabase.supabase || createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

export default supabase;