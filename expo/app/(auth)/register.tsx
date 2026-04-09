import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

// ── Password strength helpers ──────────────────────────────────────────────
const criteria = [
  { label: '8+ characters',     test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): number {
  return criteria.filter(c => c.test(password)).length; // 0‑5
}

function getStrengthColor(score: number): string {
  if (score <= 1) return '#e74c3c';
  if (score <= 2) return '#e67e22';
  if (score <= 3) return '#f1c40f';
  if (score === 4) return '#2ecc71';
  return '#27ae60';
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();

  const [username, setUsername]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);

  // Logo animation
  const logoScale  = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  const animateLogo = () => {
    logoScale.setValue(1);
    logoRotate.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale,  { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: -5,  duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale,  { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 3,   duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale,  { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 0,    duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(logoScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const strengthScore = getStrength(password);
  const strengthColor = getStrengthColor(strengthScore);
  const strengthPct   = `${(strengthScore / 5) * 100}%`;

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim(), phone.trim());
    setIsLoading(false);

    if (error) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } else {
      animateLogo();
      Alert.alert(
        'Success',
        'Account created successfully! Please sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  const spin = logoRotate.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── TOP: dark hero ── */}
          <View style={styles.topSection}>
            <Animated.View
              style={[
                styles.logoWrapper,
                { transform: [{ scale: logoScale }, { rotate: spin }] },
              ]}
            >
              <Image
                source={{ uri: 'https://i.pinimg.com/736x/1c/8f/e7/1c8fe7c5f63a8ccf73d3f9a392c7953a.jpg' }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </Animated.View>

            <Text style={styles.heroTitle}>Welcome To HomeChef</Text>
            <Text style={styles.heroBody}>
              Join our community of food lovers and share your culinary journey.
            </Text>

            <View style={styles.didYouKnowCard}>
              <Text style={styles.didYouKnowText}>
                <Text style={styles.didYouKnowBold}>Did you know? </Text>
                Did you know? Ndolé is Cameroon's national dish!
              </Text>
            </View>
          </View>

          {/* ── BOTTOM: cream form ── */}
          <View style={styles.bottomSection}>
            {/* Brand */}
            <View style={styles.brandRow}>
              <Text style={styles.brandHome}>Home</Text>
              <Text style={styles.brandChef}>Chef</Text>
            </View>

            <Text style={styles.formTitle}>Create your HomeChef{'\n'}account</Text>

            {/* Sign‑in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {/* Username */}
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Aymerick Atsa"
              placeholderTextColor="#b0a090"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#b0a090"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="655353513"
              placeholderTextColor="#b0a090"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor="#b0a090"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />

            {/* Confirm Password (first — above strength) */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#b0a090"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />

            {/* Password Strength */}
            <Text style={styles.strengthLabel}>Password Strength:</Text>
            <View style={styles.strengthBarTrack}>
              <View
                style={[
                  styles.strengthBarFill,
                  { width: strengthPct as any, backgroundColor: strengthColor },
                ]}
              />
            </View>

            {/* Criteria grid */}
            <View style={styles.criteriaGrid}>
              {criteria.map((c) => {
                const met = c.test(password);
                return (
                  <View key={c.label} style={styles.criteriaItem}>
                    <Text style={[styles.criteriaText, met && styles.criteriaMet]}>
                      • {c.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Show Password checkbox */}
            <TouchableOpacity
              style={styles.showPasswordRow}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                {showPassword && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.showPasswordLabel}>Show Password</Text>
            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Register Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
const DARK_BROWN  = '#3d1008';
const GOLD        = '#C9840A';
const RUST        = '#8B2500';
const CREAM       = '#f5f0e8';
const CREAM_BORDER = '#d9c9b0';

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: CREAM },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // TOP
  topSection: {
    backgroundColor: DARK_BROWN,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: { width: 110, height: 110, borderRadius: 55 },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  didYouKnowCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%',
  },
  didYouKnowText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  didYouKnowBold: { fontStyle: 'normal', fontWeight: 'bold', color: '#fff' },

  // BOTTOM
  bottomSection: {
    backgroundColor: CREAM,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  brandRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  brandHome: { fontSize: 30, fontWeight: 'bold', color: RUST },
  brandChef: { fontSize: 30, fontWeight: 'bold', color: GOLD },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 18,
  },
  signinRow: { flexDirection: 'row', marginBottom: 20 },
  signinText: { fontSize: 13, color: '#555' },
  signinLink: { fontSize: 13, color: '#4a90d9', fontWeight: '600' },

  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: CREAM_BORDER,
    borderRadius: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  // Strength bar
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  strengthBarTrack: {
    height: 5,
    backgroundColor: '#e0d8cc',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Criteria
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    columnGap: 12,
  },
  criteriaItem: { width: '45%', marginBottom: 4 },
  criteriaText: { fontSize: 12, color: '#999' },
  criteriaMet:  { color: '#555' },

  // Show password
  showPasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#aaa',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: DARK_BROWN, borderColor: DARK_BROWN },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  showPasswordLabel: { fontSize: 13, color: '#555' },

  // Button
  registerButton: {
    backgroundColor: DARK_BROWN,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});