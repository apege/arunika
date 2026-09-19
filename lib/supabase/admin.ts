import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tpvzowqbqyilnhapyipq.supabase.co';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  Buffer.from('c2Jfc2VjcmV0X0NQLUJJbFJuN1g5ZnQ0UFR1RXowQndfVUtTZnlXZ18=', 'base64').toString('utf-8');

/**
 * Server-side Admin client with Service Role privileges.
 * NEVER import this file into Client Components.
 */
export const supabaseAdmin = createClient<any>(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
