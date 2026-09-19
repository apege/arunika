import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    'Supabase admin client missing SUPABASE_SERVICE_ROLE_KEY. Falling back to anon key.'
  );
}

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
