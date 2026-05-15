import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing. Realtime features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
