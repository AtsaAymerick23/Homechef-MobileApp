import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Profile } from '@/lib/supabase';
import { BiometricAuth } from '@/lib/biometric';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;

  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;

  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithBiometrics: () => Promise<{ error: any; cancelled?: boolean }>;
  enableBiometrics: (email: string, password: string) => Promise<{ error: any }>;
  disableBiometrics: () => Promise<void>;

  signUp: (email: string, password: string, username: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  loadSession: () => Promise<void>;
}

// Helper: fetch a fresh profile row from Supabase
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('fetchProfile error:', error);
    return null;
  }
  return data as Profile;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      biometricEnabled: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      loadSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          set({ session });

          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            set({ user: profile, isAuthenticated: true });
          }

          const biometricEnabled = await BiometricAuth.isEnabled();
          set({ biometricEnabled });
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
          const profile = await fetchProfile(data.session.user.id);
          set({ user: profile, isAuthenticated: true });
        }

        return { error };
      },

      signInWithBiometrics: async () => {
        const supported = await BiometricAuth.isSupported();
        if (!supported) {
          return { error: new Error('Biometrics not available on this device') };
        }

        const enabled = await BiometricAuth.isEnabled();
        if (!enabled) {
          return { error: new Error('Biometric login is not set up. Please sign in with your password first.') };
        }

        const label = await BiometricAuth.getBiometricLabel();
        const authenticated = await BiometricAuth.authenticate(`Use ${label} to sign in`);

        if (!authenticated) {
          return { error: null, cancelled: true };
        }

        const credentials = await BiometricAuth.loadCredentials();
        if (!credentials) {
          return { error: new Error('Stored credentials not found. Please sign in with your password.') };
        }

        return get().signIn(credentials.email, credentials.password);
      },

      enableBiometrics: async (email: string, password: string) => {
        const supported = await BiometricAuth.isSupported();
        if (!supported) {
          return { error: new Error('Biometrics not available on this device') };
        }

        const label = await BiometricAuth.getBiometricLabel();
        const authenticated = await BiometricAuth.authenticate(
          `Confirm ${label} to enable biometric login`
        );

        if (!authenticated) {
          return { error: new Error('Biometric confirmation failed') };
        }

        await BiometricAuth.saveCredentials({ email, password });
        set({ biometricEnabled: true });

        return { error: null };
      },

      disableBiometrics: async () => {
        await BiometricAuth.disable();
        set({ biometricEnabled: false });
      },

      signUp: async (email, password, username, phone) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, phone },
          },
        });

        if (!error && data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, username, phone: phone ?? null }]);

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
        const { user, session } = get();
        if (!user) return { error: new Error('No user logged in') };

        // Use .select() so Supabase actually executes the update and returns
        // the mutated row — without it some RLS configs silently no-op.
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('updateProfile error:', error);
          return { error };
        }

        // Prefer the server-returned row so local state stays in sync
        set({ user: data as Profile });
        return { error: null };
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);