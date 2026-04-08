import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Profile } from '@/lib/supabase';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      loadSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          set({ session });
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            set({ user: profile, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Error loading session:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.session) {
          set({ session: data.session });
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          set({ user: profile, isAuthenticated: true });
        }

        return { error };
      },

      signUp: async (email, password, username, phone) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              phone,
            },
          },
        });

        if (!error && data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username,
                phone,
              },
            ]);

          if (profileError) {
            return { error: profileError };
          }
        }

        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { error: new Error('No user logged in') };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (!error) {
          set({ user: { ...user, ...updates } });
        }

        return { error };
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
