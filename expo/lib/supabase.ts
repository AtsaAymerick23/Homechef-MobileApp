import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ipczxfjqsecuqdcslssv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY3p4Zmpxc2VjdXFkY3Nsc3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDM1NDgsImV4cCI6MjA5MTE3OTU0OH0.NXpKxdpaJgJN3Xetbu2GxE2j9BnWXqw47E5cIHDUptc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
};
