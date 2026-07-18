import { createClient } from '@supabase/supabase-js';

// Read variables from Vite's env system using assertion for strict environments
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://rhtatjgmiancxyjtamou.supabase.co';

// We check if the environment variables are genuinely configured
export const isSupabaseConfigured = !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;

// Provide a safe non-empty dummy string placeholder key so the SDK doesn't throw a key error during initialization/build
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodGF0amduaWFuY3h5anRhbW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NzM2MDAsImV4cCI6MjAyMDQ0OTYwMH0.dummy-placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

