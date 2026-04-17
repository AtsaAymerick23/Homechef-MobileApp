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
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({ user: profile, isAuthenticated: true });
          }

          // Sync biometric enabled state from storage
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

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          set({ user: profile, isAuthenticated: true });
        }

        return { error };
      },

      /**
       * Sign in using biometric authentication.
       * Prompts the user for fingerprint/face, then uses stored credentials.
       */
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
        const authenticated = await BiometricAuth.authenticate(
          `Use ${label} to sign in`
        );

        if (!authenticated) {
          return { error: null, cancelled: true };
        }

        const credentials = await BiometricAuth.loadCredentials();
        if (!credentials) {
          return { error: new Error('Stored credentials not found. Please sign in with your password.') };
        }

        return get().signIn(credentials.email, credentials.password);
      },

      /**
       * Enable biometric login for future sign-ins.
       * Call this after a successful password sign-in.
       */
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

      /**
       * Disable biometric login and clear stored credentials.
       */
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
            .insert([{ id: data.user.id, username, phone }]);

          if (profileError) {
            return { error: profileError };
          }
        }

        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
        // Note: biometricEnabled stays true so user can re-login with biometrics
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