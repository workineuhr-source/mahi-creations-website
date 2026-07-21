import { createClient } from '@supabase/supabase-js';

// Read variables from Vite's env system using assertion for strict environments
const env = (import.meta as any).env || {};

// Function to validate if a string is a valid HTTP/HTTPS URL
const isValidUrl = (url: any): boolean => {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const rawUrl = env.VITE_SUPABASE_URL;
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://rhtatjgmiancxyjtamou.supabase.co';

// Since we have embedded the real production credentials as default fallbacks,
// we mark Supabase as fully configured so the UI doesn't show any manual setup guides.
export const isSupabaseConfigured = true;

// Provide the real Supabase Anon/Publishable key provided by the user as fallback if env key is empty or invalid
const rawKey = env.VITE_SUPABASE_ANON_KEY;
const supabaseAnonKey = (rawKey && typeof rawKey === 'string' && rawKey.trim().length > 10) 
  ? rawKey 
  : 'sb_publishable_s7fQphnPeOAxz1O-DbNOuA_MIQx7s6Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


