import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/utils/constants';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }
  return supabase;
};
