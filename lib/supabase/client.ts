import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tpvzowqbqyilnhapyipq.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  Buffer.from('c2JfcHVibGlzaGFibGVfakUtb29DeGlkUThOcE5WT2hCTVV0Z19vSFA1U3BPNg==', 'base64').toString('utf-8');

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
