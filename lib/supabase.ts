/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://rjmujizjdamjgejagxax.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbXVqaXpqZGFtamdlamFneGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjU2MTcsImV4cCI6MjEwNTMwMTYxN30.0QdD4YtO4vd6FLbhh43AV1S6OSq81BF3RLkEyXldMe8';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured) throw new Error('Supabase n\'est pas configuré');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!isSupabaseConfigured) throw new Error('Supabase n\'est pas configuré');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!isSupabaseConfigured) throw new Error('Supabase n\'est pas configuré');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
