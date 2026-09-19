import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please verify .env.local configuration.'
  );
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
