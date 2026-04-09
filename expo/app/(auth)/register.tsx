import React, { useState, useRef, useEffect } from 'react';
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
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Palette ────────────────────────────────────────────────────────────────
const DARK_BROWN   = '#3d1008';
const GOLD         = '#C9840A';
const RUST         = '#8B2500';
const CREAM        = '#f7f2ea';
const CREAM_BORDER = '#e0d0ba';
const INPUT_BG     = '#fffdf9';
const GOLD_LIGHT   = '#fdf3de';

// ── Password strength helpers ──────────────────────────────────────────────
const criteria = [
  { label: '8+ characters',     test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): number {
  return criteria.filter(c => c.test(password)).length;
}

const STRENGTH_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

// ── Animated Input ─────────────────────────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable,
  delay = 0,
}: any) {
  const focused   = useRef(new Animated.Value(0)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 400,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFocus = () =>
    Animated.timing(focused, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  const handleBlur  = () =>
    Animated.timing(focused, { toValue: 0, duration: 180, useNativeDriver: false }).start();

  const borderColor = focused.interpolate({
    inputRange: [0, 1],
    outputRange: [CREAM_BORDER, GOLD],
  });

  return (
    <Animated.View
      style={{
        opacity: mountAnim,
        transform: [{ translateY: mountAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        marginBottom: 14,
      }}
    >
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#c0b09a"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          editable={editable !== false}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
    </Animated.View>
  );
}

// ── Strength Bar Segment ───────────────────────────────────────────────────
function StrengthSegment({ active, color, delay }: { active: boolean; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 260,
      delay: active ? delay : 0,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [active]);

  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: ['#e0d8cc', color] });

  return (
    <Animated.View style={{ flex: 1, height: 5, borderRadius: 4, backgroundColor: bg, marginHorizontal: 2 }} />
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();

  const [username, setUsername]               = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [agreed, setAgreed]                   = useState(false);

  // Entrance animations
  const heroOpacity   = useRef(new Animated.Value(0)).current;
  const heroSlide     = useRef(new Animated.Value(-30)).current;
  const formOpacity   = useRef(new Animated.Value(0)).current;
  const formSlide     = useRef(new Animated.Value(40)).current;
  const logoScale     = useRef(new Animated.Value(0.6)).current;
  const logoRotate    = useRef(new Animated.Value(0)).current;
  const buttonScale   = useRef(new Animated.Value(1)).current;
  const shimmerAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale,  { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(heroSlide,  { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(formSlide,   { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }, 200);

    // Looping shimmer on the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const celebrateLogo = () => {
    logoRotate.setValue(0);
    Animated.sequence([
      Animated.timing(logoScale,  { toValue: 1.35, duration: 130, useNativeDriver: true }),
      Animated.timing(logoRotate, { toValue: -8,   duration: 110, useNativeDriver: true }),
      Animated.timing(logoRotate, { toValue: 8,    duration: 110, useNativeDriver: true }),
      Animated.timing(logoRotate, { toValue: -5,   duration: 90,  useNativeDriver: true }),
      Animated.timing(logoRotate, { toValue: 0,    duration: 90,  useNativeDriver: true }),
      Animated.spring(logoScale,  { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const pressButton = (in_: boolean) =>
    Animated.spring(buttonScale, {
      toValue: in_ ? 0.96 : 1,
      tension: 160,
      friction: 10,
      useNativeDriver: true,
    }).start();

  const strengthScore = getStrength(password);
  const strengthColor = STRENGTH_COLORS[Math.min(strengthScore - 1, 4)] ?? '#e0d8cc';

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim(), phone.trim());
    setIsLoading(false);

    if (error) {
      Alert.alert('Registration failed', error.message || 'Could not create account.');
    } else {
      celebrateLogo();
      Alert.alert(
        'Welcome to HomeChef!',
        'Your account is ready. Please sign in.',
        [{ text: 'Let\'s go', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  const spin = logoRotate.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero section ── */}
          <Animated.View
            style={[
              styles.topSection,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroSlide }],
              },
            ]}
          >
            {/* Decorative ring */}
            <View style={styles.logoRing}>
              <Animated.View style={{ transform: [{ scale: logoScale }, { rotate: spin }] }}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={{ uri: 'https://i.pinimg.com/736x/1c/8f/e7/1c8fe7c5f63a8ccf73d3f9a392c7953a.jpg' }}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>
            </View>

            <Text style={styles.heroTitle}>Welcome to HomeChef</Text>
            <Text style={styles.heroBody}>
              Join our community of food lovers and share your culinary journey.
            </Text>

            {/* Did-you-know chip */}
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipEmoji}>🍽</Text>
                <Text style={styles.chipText}>
                  <Text style={styles.chipBold}>Did you know? </Text>
                  Ndolé is Cameroon's beloved national dish!
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Form section ── */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                opacity: formOpacity,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            {/* Brand pill */}
            <View style={styles.brandPill}>
              <Text style={styles.brandHome}>Home</Text>
              <Text style={styles.brandChef}>Chef</Text>
            </View>

            <Text style={styles.formTitle}>Create your account</Text>

            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Inputs */}
            <FloatingInput label="Username"       value={username}         onChangeText={setUsername}         placeholder="Aymerick Atsa"  editable={!isLoading} delay={0}   />
            <FloatingInput label="Email address"  value={email}            onChangeText={setEmail}            placeholder="you@example.com" keyboardType="email-address" editable={!isLoading} delay={60}  />
            <FloatingInput label="Phone number"   value={phone}            onChangeText={setPhone}            placeholder="+237 655 353 513" keyboardType="phone-pad" editable={!isLoading} delay={120} />
            <FloatingInput label="Password"       value={password}         onChangeText={setPassword}         placeholder="Create a password" secureTextEntry={!showPassword} editable={!isLoading} delay={180} />
            <FloatingInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" secureTextEntry={!showPassword} editable={!isLoading} delay={240} />

            {/* Strength indicator */}
            {password.length > 0 && (
              <Animated.View style={styles.strengthSection}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabel}>Password strength</Text>
                  <Text style={[styles.strengthWord, { color: strengthColor }]}>
                    {STRENGTH_LABELS[strengthScore]}
                  </Text>
                </View>

                <View style={styles.segmentRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StrengthSegment
                      key={i}
                      active={i < strengthScore}
                      color={strengthColor}
                      delay={i * 40}
                    />
                  ))}
                </View>

                <View style={styles.criteriaGrid}>
                  {criteria.map((c) => {
                    const met = c.test(password);
                    return (
                      <View key={c.label} style={styles.criteriaItem}>
                        <View style={[styles.criteriaDot, met && { backgroundColor: strengthColor }]} />
                        <Text style={[styles.criteriaText, met && styles.criteriaMet]}>
                          {c.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Controls row */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                  {showPassword && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.toggleLabel}>Show password</Text>
              </TouchableOpacity>
            </View>

            {/* T&C */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.toggleLabel}>
                I agree to the{' '}
                <Text style={styles.signinLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* CTA */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 24 }}>
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (isLoading || !agreed) && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                onPressIn={() => pressButton(true)}
                onPressOut={() => pressButton(false)}
                disabled={isLoading || !agreed}
                activeOpacity={1}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.footer}>
              By registering you agree to our Privacy Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: CREAM },
  scrollContent: { flexGrow: 1 },

  // TOP
  topSection: {
    backgroundColor: DARK_BROWN,
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  logoRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logoWrapper: {
    width: 108,
    height: 108,
    borderRadius: 54,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  logoImage: { width: 108, height: 108, borderRadius: 54 },

  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  chipRow: { width: '100%' },
  chip: {
    backgroundColor: 'rgba(201,132,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,132,10,0.35)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chipEmoji:  { fontSize: 16, lineHeight: 22 },
  chipText:   { flex: 1, color: 'rgba(255,255,255,0.80)', fontSize: 13, lineHeight: 20 },
  chipBold:   { fontWeight: '700', color: GOLD },

  // BOTTOM
  bottomSection: {
    backgroundColor: CREAM,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 48,
  },
  brandPill: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GOLD_LIGHT,
    alignSelf: 'center',
    borderRadius: 50,
    paddingHorizontal: 22,
    paddingVertical: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#f0d8a0',
  },
  brandHome: { fontSize: 20, fontWeight: '800', color: RUST, letterSpacing: 0.5 },
  brandChef: { fontSize: 20, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },

  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a0f08',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 22 },
  signinText: { fontSize: 13, color: '#7a6a58' },
  signinLink: { fontSize: 13, color: '#4a90d9', fontWeight: '600' },
  divider:    { height: 1, backgroundColor: CREAM_BORDER, marginBottom: 20 },

  // Inputs
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b5a46',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: INPUT_BG,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a0f08',
  },

  // Strength
  strengthSection: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CREAM_BORDER,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthLabel: { fontSize: 12, color: '#7a6a58', fontWeight: '600' },
  strengthWord:  { fontSize: 12, fontWeight: '700' },
  segmentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', width: '46%', gap: 6 },
  criteriaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0c8bc',
  },
  criteriaText: { fontSize: 12, color: '#aaa098' },
  criteriaMet:  { color: '#5a5048', fontWeight: '500' },

  // Controls
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#c0b09a',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: DARK_BROWN, borderColor: DARK_BROWN },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  toggleLabel: { fontSize: 13, color: '#6b5a46' },

  // Button
  registerButton: {
    backgroundColor: DARK_BROWN,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  registerButtonDisabled: { opacity: 0.55 },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#b0a090',
    marginTop: 20,
  },
});