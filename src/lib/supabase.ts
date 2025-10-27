import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/utils/constants';

let browserClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export const getBrowserSupabase = () => {
  if (browserClient) {
    return browserClient;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase client is not configured');
  }

  browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
};

export const getServiceSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role Supabase client is only available server-side');
  }

  if (serviceClient) {
    return serviceClient;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error('Supabase service role is not configured');
  }

  serviceClient = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  return serviceClient;
};
