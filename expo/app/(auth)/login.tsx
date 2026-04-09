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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation ref for logo bounce on success
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  const animateLogo = () => {
    logoScale.setValue(1);
    logoRotate.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: -5,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } else {
      // Trigger logo bounce animation on successful sign-in
      animateLogo();
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
          {/* ── TOP SECTION: dark brown hero ── */}
          <View style={styles.topSection}>
            {/* Animated Chef Logo */}
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

            <Text style={styles.welcomeTitle}>Welcome Back Home</Text>
            <Text style={styles.welcomeSubTitle}>My Chef</Text>
            <Text style={styles.welcomeBody}>
              Glad to see you back. What are you going to learn today?{'\n'}
              From easy to complex, we have them all.
            </Text>

            {/* Pro Tip Card */}
            <View style={styles.proTipCard}>
              <Text style={styles.proTipText}>
                <Text style={styles.proTipBold}>Pro Tip: </Text>
                Did you know? Achu soup is traditionally eaten with fingers!
              </Text>
            </View>
          </View>

          {/* ── BOTTOM SECTION: cream form area ── */}
          <View style={styles.bottomSection}>
            {/* Brand */}
            <View style={styles.brandRow}>
              <Text style={styles.brandHome}>Home</Text>
              <Text style={styles.brandChef}>Chef</Text>
            </View>

            <Text style={styles.signInTitle}>Sign in</Text>

            {/* Create account link */}
            <View style={styles.createRow}>
              <Text style={styles.createText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.createLink}>Create now</Text>
              </TouchableOpacity>
            </View>

            {/* Email */}
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor="#b0a090"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
              secureTextEntry
              editable={!isLoading}
            />

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const DARK_BROWN = '#3d1008';
const MEDIUM_BROWN = '#5a1a0a';
const GOLD = '#C9840A';
const RUST = '#8B2500';
const CREAM = '#f5f0e8';
const CREAM_BORDER = '#d9c9b0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── TOP ──
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
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  welcomeSubTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  proTipCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%',
  },
  proTipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  proTipBold: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    color: '#fff',
  },

  // ── BOTTOM ──
  bottomSection: {
    backgroundColor: CREAM,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandHome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: RUST,
  },
  brandChef: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GOLD,
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  createRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  createText: {
    fontSize: 13,
    color: '#555',
  },
  createLink: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
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
  checkboxChecked: {
    backgroundColor: RUST,
    borderColor: RUST,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberLabel: {
    fontSize: 13,
    color: '#555',
  },
  signInButton: {
    backgroundColor: DARK_BROWN,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});