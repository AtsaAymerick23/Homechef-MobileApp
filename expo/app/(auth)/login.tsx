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
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  espresso:   '#1C0A00',
  mahogany:   '#3B0F07',
  rust:       '#8B2500',
  ember:      '#C94F1A',
  gold:       '#D4900A',
  cream:      '#F7F2EA',
  parchment:  '#EDE6D8',
  sand:       '#D9CEBC',
  white:      '#FFFFFF',
  muted:      '#8A7A68',
  textDark:   '#1C0A00',
};

// ─── Particle component ───────────────────────────────────────────────────────
const Particle = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * SCREEN_W).current;
  const size = useRef(2 + Math.random() * 3).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 4000 + Math.random() * 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_H * 0.5] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.6, 0.4, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: C.gold,
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
};

// ─── Animated input wrapper ───────────────────────────────────────────────────
const FancyInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable,
  icon,
}: any) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.sand, C.ember],
  });

  const labelColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.muted, C.ember],
  });

  return (
    <View style={{ marginBottom: 20 }}>
      <Animated.Text style={[inputStyles.label, { color: labelColor }]}>{label}</Animated.Text>
      <Animated.View style={[inputStyles.box, { borderColor }]}>
        <Text style={inputStyles.icon}>{icon}</Text>
        <TextInput
          style={inputStyles.field}
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
      </Animated.View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: { fontSize: 16, marginRight: 10, opacity: 0.5 },
  field: { flex: 1, fontSize: 15, color: C.textDark },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // Mount animation values
  const heroFade     = useRef(new Animated.Value(0)).current;
  const heroSlide    = useRef(new Animated.Value(30)).current;
  const formFade     = useRef(new Animated.Value(0)).current;
  const formSlide    = useRef(new Animated.Value(40)).current;
  const logoScale    = useRef(new Animated.Value(0.6)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const glowAnim     = useRef(new Animated.Value(0)).current;

  // Logo bounce on success
  const successScale = useRef(new Animated.Value(1)).current;
  const successRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale,   { toValue: 1,  duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1,  duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Gentle logo glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerSuccessAnim = () => {
    successScale.setValue(1);
    successRotate.setValue(0);
    Animated.sequence([
      Animated.timing(successScale,  { toValue: 1.4, duration: 160, useNativeDriver: true }),
      Animated.timing(successRotate, { toValue: -8,  duration: 120, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(successScale,  { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(successRotate, { toValue: 5,   duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(successScale,  { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(successRotate, { toValue: 0,   duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(successScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password');
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message || 'Invalid credentials');
    } else {
      triggerSuccessAnim();
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] });
  const spinInterp  = successRotate.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });

  const particles = Array.from({ length: 12 }, (_, i) => (
    <Particle key={i} delay={i * 400} />
  ));

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <View style={s.hero}>
            {/* Floating particles */}
            {particles}

            {/* Decorative arc */}
            <View style={s.arcTop} />
            <View style={s.arcBottom} />

            {/* Logo */}
            <Animated.View
              style={{
                transform: [{ scale: successScale }, { rotate: spinInterp }, { scale: logoScale }],
                opacity: logoOpacity,
                marginBottom: 24,
              }}
            >
              <Animated.View style={[s.glowRing, { opacity: glowOpacity }]} />
              <View style={s.logoRing}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/736x/1c/8f/e7/1c8fe7c5f63a8ccf73d3f9a392c7953a.jpg' }}
                  style={s.logoImg}
                  resizeMode="cover"
                />
              </View>
            </Animated.View>

            {/* Hero copy */}
            <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }], alignItems: 'center' }}>
              <View style={s.badgeRow}>
                <View style={s.badge}><Text style={s.badgeText}>🍲 Cameroonian Cuisine</Text></View>
              </View>
              <Text style={s.heroTitle}>Welcome Back Home,{'\n'}My Chef</Text>
              <Text style={s.heroSub}>From Ndolé to Poulet DG — your kitchen awaits</Text>

              <View style={s.tipCard}>
                <Text style={s.tipLabel}>PRO TIP</Text>
                <Text style={s.tipText}>Achu soup is traditionally eaten with fingers — no utensils needed!</Text>
              </View>
            </Animated.View>
          </View>

          {/* ── FORM PANEL ────────────────────────────────────────────────── */}
          <Animated.View style={[s.panel, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>

            {/* Brand wordmark */}
            <View style={s.wordmarkRow}>
              <Text style={s.wordHome}>Home</Text>
              <Text style={s.wordChef}>Chef</Text>
            </View>

            <Text style={s.panelTitle}>Sign in</Text>
            <View style={s.registerRow}>
              <Text style={s.registerText}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
                <Text style={s.registerLink}>Create an account →</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            <FancyInput
              label="Email address"
              icon="✉"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!isLoading}
            />

            <FancyInput
              label="Password"
              icon="🔒"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            {/* Remember me + forgot */}
            <View style={s.rememberRow}>
              <TouchableOpacity style={s.rememberLeft} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                <View style={[s.check, rememberMe && s.checkActive]}>
                  {rememberMe && <Text style={s.checkMark}>✓</Text>}
                </View>
                <Text style={s.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.cta, isLoading && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={C.cream} />
                : <Text style={s.ctaText}>Sign in to my kitchen →</Text>}
            </TouchableOpacity>

            {/* Social hint */}
            <View style={s.orRow}>
              <View style={s.orLine} />
              <Text style={s.orText}>or continue with</Text>
              <View style={s.orLine} />
            </View>

            <View style={s.socialRow}>
              {['G', 'f', 'in'].map(lbl => (
                <TouchableOpacity key={lbl} style={s.socialBtn} activeOpacity={0.75}>
                  <Text style={s.socialBtnText}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  arcTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(212,144,10,0.18)',
  },
  arcBottom: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(212,144,10,0.12)',
  },

  // Logo
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: C.gold,
    top: -7,
    left: -7,
  },
  logoRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: C.gold,
    overflow: 'hidden',
    backgroundColor: C.sand,
  },
  logoImg: { width: 116, height: 116 },

  // Badge
  badgeRow: { flexDirection: 'row', marginBottom: 16 },
  badge: {
    backgroundColor: 'rgba(212,144,10,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212,144,10,0.35)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: { color: C.gold, fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },

  // Hero text
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: C.cream,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(247,242,234,0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Tip card
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%',
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(247,242,234,0.75)',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Panel
  panel: {
    backgroundColor: C.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 50,
    flex: 1,
  },

  // Wordmark
  wordmarkRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  wordHome: { fontSize: 28, fontWeight: '900', color: C.rust, letterSpacing: -0.5 },
  wordChef: { fontSize: 28, fontWeight: '900', color: C.gold, letterSpacing: -0.5 },

  // Panel headings
  panelTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, textAlign: 'center', marginBottom: 8 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  registerText: { fontSize: 13, color: C.muted },
  registerLink: { fontSize: 13, fontWeight: '700', color: C.ember },

  divider: { height: 1, backgroundColor: C.sand, marginBottom: 24 },

  // Remember me row
  rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  rememberLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: {
    width: 18, height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.sand,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: C.rust, borderColor: C.rust },
  checkMark: { color: C.white, fontSize: 11, fontWeight: '800' },
  rememberText: { fontSize: 13, color: C.muted },
  forgotText: { fontSize: 13, color: C.ember, fontWeight: '600' },

  // CTA
  cta: {
    backgroundColor: C.espresso,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: { color: C.cream, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Or divider
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: C.sand },
  orText: { fontSize: 12, color: C.muted, fontWeight: '500' },

  // Social
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.sand,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: { fontSize: 16, fontWeight: '700', color: C.textDark },
});