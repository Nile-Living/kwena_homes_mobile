import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdscpwxbrlbvnfsivwmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2Nwd3hicmxidm5mc2l2d21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzE1MDUsImV4cCI6MjA1NTcwNzUwNX0.uW_s7KF4f93JtzEYDQ-6LU38TgTM3CgHwYQEkX9XJng';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
