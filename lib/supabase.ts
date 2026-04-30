import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);

export const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
