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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  espresso:  '#1C0A00',
  mahogany:  '#3B0F07',
  rust:      '#8B2500',
  ember:     '#C94F1A',
  gold:      '#D4900A',
  cream:     '#F7F2EA',
  parchment: '#EDE6D8',
  sand:      '#D9CEBC',
  white:     '#FFFFFF',
  muted:     '#8A7A68',
  textDark:  '#1C0A00',
};

// ─── Password strength ────────────────────────────────────────────────────────
const CRITERIA = [
  { label: '8+ characters',     test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getScore(p: string) { return CRITERIA.filter(c => c.test(p)).length; }

const STRENGTH_COLORS = ['#e74c3c', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Moderate', 'Strong', 'Excellent'];

// ─── Particle ─────────────────────────────────────────────────────────────────
const Particle = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const x    = useRef(Math.random() * SCREEN_W).current;
  const size = useRef(2 + Math.random() * 3).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 4500 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_H * 0.45] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.5, 0.3, 0] });

  return (
    <Animated.View style={{
      position: 'absolute', bottom: 0, left: x,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.gold,
      transform: [{ translateY }], opacity,
    }} />
  );
};

// ─── Animated field ───────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  editable?: boolean;
  rightElement?: React.ReactNode;
  delay?: number;
}

const Field = ({ label, icon, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable = true, rightElement, delay = 0 }: FieldProps) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const mountAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1, duration: 400, delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const onFocus = () => Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onBlur  = () => Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [C.sand, C.ember] });
  const labelColor  = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [C.muted, C.ember] });
  const translateY  = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View style={[fStyles.wrap, { opacity: mountAnim, transform: [{ translateY }] }]}>
      <Animated.Text style={[fStyles.label, { color: labelColor }]}>{label}</Animated.Text>
      <Animated.View style={[fStyles.box, { borderColor }]}>
        <Text style={fStyles.icon}>{icon}</Text>
        <TextInput
          style={fStyles.input}
          placeholder={placeholder}
          placeholderTextColor={C.sand}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
        />
        {rightElement}
      </Animated.View>
    </Animated.View>
  );
};

const fStyles = StyleSheet.create({
  wrap:  { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 7 },
  box:   {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14,
    backgroundColor: C.white,
    paddingHorizontal: 15, paddingVertical: 13,
  },
  icon:  { fontSize: 15, marginRight: 10, opacity: 0.45 },
  input: { flex: 1, fontSize: 15, color: C.textDark },
});

// ─── Strength meter ───────────────────────────────────────────────────────────
const StrengthMeter = ({ password }: { password: string }) => {
  const score = getScore(password);
  const bars  = [1, 2, 3, 4, 5];
  const color = STRENGTH_COLORS[score] ?? C.sand;

  const barAnims = useRef(bars.map(() => new Animated.Value(0))).current;
  const prevScore = useRef(0);

  useEffect(() => {
    bars.forEach((_, i) => {
      const shouldFill = i < score;
      const wasFilledPrev = i < prevScore.current;
      if (shouldFill !== wasFilledPrev) {
        Animated.timing(barAnims[i], {
          toValue: shouldFill ? 1 : 0,
          duration: 250,
          delay: shouldFill ? i * 40 : 0,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }
    });
    prevScore.current = score;
  }, [score]);

  return (
    <View style={mStyles.wrap}>
      <View style={mStyles.topRow}>
        <Text style={mStyles.title}>Password strength</Text>
        {score > 0 && (
          <Text style={[mStyles.scoreLabel, { color }]}>{STRENGTH_LABELS[score]}</Text>
        )}
      </View>

      {/* Segmented bar */}
      <View style={mStyles.bars}>
        {bars.map((_, i) => {
          const bg = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [C.sand, color] });
          return <Animated.View key={i} style={[mStyles.bar, { backgroundColor: bg }]} />;
        })}
      </View>

      {/* Criteria chips */}
      <View style={mStyles.chips}>
        {CRITERIA.map(c => {
          const met = c.test(password);
          return (
            <View key={c.label} style={[mStyles.chip, met && mStyles.chipMet]}>
              <Text style={[mStyles.chipText, met && mStyles.chipTextMet]}>
                {met ? '✓' : '·'} {c.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const mStyles = StyleSheet.create({
  wrap:      { marginBottom: 22 },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title:     { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  scoreLabel:{ fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  bars:      { flexDirection: 'row', gap: 5, marginBottom: 12 },
  bar:       { flex: 1, height: 5, borderRadius: 3 },
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:      {
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    borderColor: C.sand, backgroundColor: C.white,
  },
  chipMet:      { borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.08)' },
  chipText:     { fontSize: 11, color: C.muted },
  chipTextMet:  { color: '#27ae60', fontWeight: '600' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();

  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  // Mount animations
  const heroFade   = useRef(new Animated.Value(0)).current;
  const heroSlide  = useRef(new Animated.Value(24)).current;
  const formFade   = useRef(new Animated.Value(0)).current;
  const formSlide  = useRef(new Animated.Value(36)).current;
  const logoScale  = useRef(new Animated.Value(0.5)).current;
  const logoOpac   = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // Success bounce
  const bounceScale  = useRef(new Animated.Value(1)).current;
  const bounceRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
        Animated.timing(logoOpac,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFade,  { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerBounce = () => {
    bounceScale.setValue(1); bounceRotate.setValue(0);
    Animated.sequence([
      Animated.timing(bounceScale,  { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(bounceRotate, { toValue: -8,  duration: 120, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(bounceScale,  { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceRotate, { toValue: 5,   duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(bounceScale,  { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceRotate, { toValue: 0,   duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(bounceScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim(), phone.trim());
    setIsLoading(false);
    if (error) {
      Alert.alert('Registration failed', error.message || 'Could not create account');
    } else {
      triggerBounce();
      Alert.alert('Welcome!', 'Account created successfully! Please sign in.', [
        { text: 'Sign in', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.5] });
  const spinInterp  = bounceRotate.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });

  const particles = Array.from({ length: 10 }, (_, i) => <Particle key={i} delay={i * 450} />);

  const EyeToggle = (
    <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7} style={{ padding: 4 }}>
      <Text style={{ fontSize: 16, opacity: 0.45 }}>{showPassword ? '🙈' : '👁'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <View style={s.hero}>
            {particles}
            <View style={s.arc1} /><View style={s.arc2} /><View style={s.arc3} />

            {/* Logo */}
            <Animated.View style={{
              transform: [{ scale: bounceScale }, { rotate: spinInterp }, { scale: logoScale }],
              opacity: logoOpac, marginBottom: 22,
            }}>
              <Animated.View style={[s.glowRing, { opacity: glowOpacity }]} />
              <View style={s.logoBorder}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/736x/1c/8f/e7/1c8fe7c5f63a8ccf73d3f9a392c7953a.jpg' }}
                  style={s.logoImg} resizeMode="cover"
                />
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }], alignItems: 'center' }}>
              {/* Step indicator */}
              <View style={s.stepRow}>
                {[1, 2, 3].map(n => (
                  <View key={n} style={[s.stepDot, n === 1 && s.stepDotActive]} />
                ))}
              </View>

              <View style={s.badge}><Text style={s.badgeText}>🍲 Join the Community</Text></View>
              <Text style={s.heroTitle}>Start Your{'\n'}Culinary Journey</Text>
              <Text style={s.heroSub}>Share recipes, discover Cameroonian flavours, and grow your kitchen skills.</Text>

              <View style={s.tipCard}>
                <Text style={s.tipLabel}>?</Text>
                <Text style={s.tipText}>Ndolé is Cameroon's beloved national dish — bitterleaf stew with peanuts & fish.</Text>
              </View>
            </Animated.View>
          </View>

          {/* ── FORM ─────────────────────────────────────────────────────── */}
          <Animated.View style={[s.panel, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>

            <View style={s.wordmarkRow}>
              <Text style={s.wHome}>Home</Text>
              <Text style={s.wChef}>Chef</Text>
            </View>

            <Text style={s.panelTitle}>Create your account</Text>

            <View style={s.signinRow}>
              <Text style={s.signinText}>Already a member? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={s.signinLink}>Sign in →</Text>
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <Field label="Username"     icon="👤" value={username}        onChangeText={setUsername}        placeholder="e.g. Aymerick Atsa"   editable={!isLoading} delay={80} />
            <Field label="Email address" icon="✉"  value={email}           onChangeText={setEmail}           placeholder="you@example.com"      editable={!isLoading} keyboardType="email-address" delay={140} />
            <Field label="Phone number" icon="📞" value={phone}           onChangeText={setPhone}           placeholder="+237 655 353 513"     editable={!isLoading} keyboardType="phone-pad" delay={200} />
            <Field label="Password"     icon="🔒" value={password}        onChangeText={setPassword}        placeholder="Min. 6 characters"    editable={!isLoading} secureTextEntry={!showPassword} delay={260} rightElement={EyeToggle} />
            <Field label="Confirm password" icon="🔒" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password"  editable={!isLoading} secureTextEntry={!showPassword} delay={320} />

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <View style={[s.matchRow, { backgroundColor: password === confirmPassword ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)' }]}>
                <Text style={[s.matchText, { color: password === confirmPassword ? '#27ae60' : '#e74c3c' }]}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              </View>
            )}

            <StrengthMeter password={password} />

            {/* Register CTA */}
            <TouchableOpacity
              style={[s.cta, isLoading && { opacity: 0.65 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={C.cream} />
                : <Text style={s.ctaText}>Create my account →</Text>}
            </TouchableOpacity>

            {/* Terms note */}
            <Text style={s.terms}>
              By registering you agree to our{' '}
              <Text style={s.termsLink}>Terms of Service</Text> and{' '}
              <Text style={s.termsLink}>Privacy Policy</Text>.
            </Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.espresso },

  // Hero
  hero: {
    backgroundColor: C.mahogany,
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  arc1: { position: 'absolute', top: -80, right: -80,  width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(212,144,10,0.18)' },
  arc2: { position: 'absolute', bottom: -50, left: -50, width: 160, height: 160, borderRadius: 80,  borderWidth: 1, borderColor: 'rgba(212,144,10,0.12)' },
  arc3: { position: 'absolute', top: 20, left: -40,     width: 100, height: 100, borderRadius: 50,  borderWidth: 1, borderColor: 'rgba(212,144,10,0.08)' },

  glowRing: {
    position: 'absolute',
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: C.gold,
    top: -7, left: -7,
  },
  logoBorder: {
    width: 114, height: 114, borderRadius: 57,
    borderWidth: 3, borderColor: C.gold,
    overflow: 'hidden', backgroundColor: C.sand,
  },
  logoImg: { width: 114, height: 114 },

  stepRow:      { flexDirection: 'row', gap: 6, marginBottom: 18 },
  stepDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  stepDotActive:{ backgroundColor: C.gold, width: 20, borderRadius: 3 },

  badge:     { backgroundColor: 'rgba(212,144,10,0.18)', borderWidth: 1, borderColor: 'rgba(212,144,10,0.35)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  badgeText: { color: C.gold, fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },

  heroTitle: { fontSize: 28, fontWeight: '800', color: C.cream, textAlign: 'center', lineHeight: 36, marginBottom: 10 },
  heroSub:   { fontSize: 13, color: 'rgba(247,242,234,0.6)', textAlign: 'center', lineHeight: 20, marginBottom: 22 },

  tipCard:  { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, width: '100%' },
  tipLabel: { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 1.2, marginBottom: 5 },
  tipText:  { fontSize: 12, color: 'rgba(247,242,234,0.72)', lineHeight: 19, fontStyle: 'italic' },

  // Panel
  panel: {
    backgroundColor: C.cream,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 26, paddingTop: 34, paddingBottom: 48,
    flex: 1,
  },

  wordmarkRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  wHome: { fontSize: 28, fontWeight: '900', color: C.rust, letterSpacing: -0.5 },
  wChef: { fontSize: 28, fontWeight: '900', color: C.gold, letterSpacing: -0.5 },

  panelTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, textAlign: 'center', marginBottom: 8 },

  signinRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 22 },
  signinText: { fontSize: 13, color: C.muted },
  signinLink: { fontSize: 13, fontWeight: '700', color: C.ember },

  divider: { height: 1, backgroundColor: C.sand, marginBottom: 22 },

  // Password match
  matchRow: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14, marginBottom: 16, marginTop: -8 },
  matchText: { fontSize: 12, fontWeight: '600' },

  // CTA
  cta: {
    backgroundColor: C.espresso, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginBottom: 20,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 14,
    elevation: 8,
  },
  ctaText: { color: C.cream, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Terms
  terms:     { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17 },
  termsLink: { color: C.ember, fontWeight: '600' },
});