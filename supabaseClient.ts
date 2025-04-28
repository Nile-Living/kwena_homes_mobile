import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session'
const supabaseUrl = 'https://jdscpwxbrlbvnfsivwmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2Nwd3hicmxidm5mc2l2d21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzE1MDUsImV4cCI6MjA1NTcwNzUwNX0.uW_s7KF4f93JtzEYDQ-6LU38TgTM3CgHwYQEkX9XJng';

const redirectUrl = makeRedirectUri({
  path: '/auth/callback',
});

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL is not defined in .env file');
}

if (!supabaseAnonKey) {
  console.error('Error: SUPABASE_ANON_KEY is not defined in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
});