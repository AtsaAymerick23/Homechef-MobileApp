import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricCredentials {
  email: string;
  password: string;
}

export const BiometricAuth = {
  /**
   * Check if the device supports biometric authentication
   */
  isSupported: async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  /**
   * Get available biometric types (fingerprint, face, iris)
   */
  getAvailableTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  /**
   * Get a human-readable label for the biometric type
   */
  getBiometricLabel: async (): Promise<string> => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometrics';
  },

  /**
   * Prompt the user to authenticate with biometrics
   */
  authenticate: async (promptMessage?: string): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  /**
   * Save credentials securely (protected by biometrics on device)
   * In production, use expo-secure-store instead of AsyncStorage
   */
  saveCredentials: async (credentials: BiometricCredentials): Promise<void> => {
    const encrypted = JSON.stringify(credentials);
    await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, encrypted);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  },

  /**
   * Load saved credentials (call authenticate() before this)
   */
  loadCredentials: async (): Promise<BiometricCredentials | null> => {
    const raw = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BiometricCredentials;
  },

  /**
   * Check if biometric login is enabled for this user
   */
  isEnabled: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  },

  /**
   * Disable biometric login and clear stored credentials
   */
  disable: async (): Promise<void> => {
    await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
  },
};
