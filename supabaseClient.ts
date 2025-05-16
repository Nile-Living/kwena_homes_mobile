import './polyfills';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';

console.log('[supabaseClient.ts] File loaded.');
console.log('[supabaseClient.ts] Checking global.crypto.subtle (set by polyfills.ts):', !!global.crypto?.subtle);
if (global.crypto?.subtle) {
    console.log('[supabaseClient.ts] global.crypto.subtle keys:', Object.keys(global.crypto.subtle));
}


const supabaseUrl = 'https://jdscpwxbrlbvnfsivwmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2Nwd3hicmxidm5mc2l2d21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzE1MDUsImV4cCI6MjA1NTcwNzUwNX0.uW_s7KF4f93JtzEYDQ-6LU38TgTM3CgHwYQEkX9XJng';

export const redirectUri = makeRedirectUri({
  path: '/auth/callback',
});
console.log("[supabaseClient.ts] Generated Redirect URI:", redirectUri);


let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    console.log('[supabaseClient.ts] Initializing Supabase client instance NOW.');
    if (!global.crypto?.subtle) {
        console.error('[supabaseClient.ts] FATAL: global.crypto.subtle is STILL NOT DEFINED before creating Supabase client!');
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL or Anon Key is missing.");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage, // Using AsyncStorage like your original setup
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
    console.log('[supabaseClient.ts] Supabase client instance created.');
  }
  return supabaseInstance;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
});
