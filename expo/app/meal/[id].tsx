import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  Users,
  ChefHat,
  MapPin,
  Flame,
  Play,
  Star,
  Heart,
} from 'lucide-react-native';
import { Accelerometer } from 'expo-sensors';
import YoutubeIframe from 'react-native-youtube-iframe';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/colors';
import { meals, type Meal } from '@/constants/meals';
import { soundManager } from '@/lib/soundManager';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = 320;
const HEADER_HEIGHT = 60;
const VIDEO_WIDTH = width - 32;
const VIDEO_HEIGHT = Math.round(VIDEO_WIDTH * (9 / 16));

// ─── Pill badge ───────────────────────────────────────────────────────────────
function Badge({ label, color = Colors.primary }: { label: string; color?: string }) {
  return (
    <View style={[badgeStyles.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
const badgeStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon, value, delay }: { icon: React.ReactNode; value: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, damping: 14 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[chipStyles.chip, { opacity, transform: [{ translateY }] }]}>
      {icon}
      <Text style={chipStyles.text}>{value}</Text>
    </Animated.View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  text: { fontSize: 12, fontWeight: '700', color: Colors.dark },
});

// ─── Written Recipe ───────────────────────────────────────────────────────────
function WrittenRecipe({ meal }: { meal: Meal }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [lastShake, setLastShake] = useState(0);

  const currentStepRef = useRef(currentStep);
  const lastShakeRef = useRef(lastShake);

  // ── Lottie ref for step-advance feedback (animation.json) ─────────────────
  const stepLottieRef = useRef<LottieView>(null);
  // Track whether the Lottie overlay is visible
  const [showStepLottie, setShowStepLottie] = useState(false);

  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { lastShakeRef.current = lastShake; }, [lastShake]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStep = useCallback((next: number) => {
    soundManager.playSFX('step_complete');

    // ── Show the Lottie burst then hide it after one play (~1 s) ─────────────
    setShowStepLottie(true);
    stepLottieRef.current?.play();
    setTimeout(() => setShowStepLottie(false), 1000);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentStep(next);
      currentStepRef.current = next;
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 14, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    const subscribe = async () => {
      await Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (acceleration > 1.8 && now - lastShakeRef.current > 1000) {
          lastShakeRef.current = now;
          setLastShake(now);

          const next = currentStepRef.current + 1;
          if (next < meal.instructions.length) {
            animateStep(next);
          }
        }
      });
    };

    subscribe();
    return () => subscription?.remove();
  }, []);

  const progress = (currentStep + 1) / meal.instructions.length;
  const progressAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(progressAnim, { toValue: progress, damping: 16, useNativeDriver: false }).start();
  }, [currentStep]);

  return (
    <View style={recipeStyles.container}>
      <View style={recipeStyles.shakeHint}>
        <Text style={recipeStyles.shakeIcon}>📱</Text>
        <Text style={recipeStyles.shakeText}>Shake to advance to the next step</Text>
      </View>

      <View style={recipeStyles.progressRow}>
        <Text style={recipeStyles.progressLabel}>
          Step {currentStep + 1} / {meal.instructions.length}
        </Text>
        <Text style={recipeStyles.progressPct}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={recipeStyles.progressTrack}>
        <Animated.View
          style={[
            recipeStyles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Step card — Lottie overlays it briefly on each advance */}
      <View style={recipeStyles.stepCardWrapper}>
        <Animated.View
          style={[recipeStyles.stepCard, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
        >
          <View style={recipeStyles.stepBadge}>
            <Text style={recipeStyles.stepBadgeText}>Step {currentStep + 1}</Text>
          </View>
          <Text style={recipeStyles.stepText}>{meal.instructions[currentStep]}</Text>
        </Animated.View>

        {/* ── Lottie 2: animation.json — step-advance feedback ──────────────
              Renders on top of the step card, centered, plays once per step
              advance then disappears. pointerEvents="none" keeps the card
              tappable underneath.                                            */}
        {showStepLottie && (
          <LottieView
            ref={stepLottieRef}
            source={require('@/assets/lottie/animation.json')}
            autoPlay
            loop={false}
            style={recipeStyles.stepLottie}
          />
        )}
      </View>

      <View style={recipeStyles.navRow}>
        <TouchableOpacity
          style={[recipeStyles.navBtn, currentStep === 0 && recipeStyles.navBtnDisabled]}
          onPress={() => currentStep > 0 && animateStep(currentStep - 1)}
          disabled={currentStep === 0}
          activeOpacity={0.7}
        >
          <Text style={[recipeStyles.navBtnText, currentStep === 0 && recipeStyles.navBtnTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            recipeStyles.navBtn,
            recipeStyles.navBtnPrimary,
            currentStep === meal.instructions.length - 1 && recipeStyles.navBtnDisabled,
          ]}
          onPress={() =>
            currentStep < meal.instructions.length - 1 && animateStep(currentStep + 1)
          }
          disabled={currentStep === meal.instructions.length - 1}
          activeOpacity={0.7}
        >
          <Text style={[recipeStyles.navBtnText, recipeStyles.navBtnTextPrimary]}>Next →</Text>
        </TouchableOpacity>
      </View>

      <View style={recipeStyles.ingredientsSection}>
        <Text style={recipeStyles.sectionTitle}>Ingredients</Text>
        {meal.ingredients.map((ingredient, i) => (
          <IngredientRow key={i} ingredient={ingredient} delay={i * 60} />
        ))}
      </View>
    </View>
  );
}

function IngredientRow({ ingredient, delay }: { ingredient: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, delay, damping: 14, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[recipeStyles.ingredientRow, { opacity, transform: [{ translateX }] }]}>
      <View style={recipeStyles.dot} />
      <Text style={recipeStyles.ingredientText}>{ingredient}</Text>
    </Animated.View>
  );
}

const recipeStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 8 },
  shakeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  shakeIcon: { fontSize: 18 },
  shakeText: { fontSize: 13, color: Colors.primary, fontWeight: '600', flex: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  progressPct: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  progressTrack: {
    height: 7,
    backgroundColor: '#EEE',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 10 },

  // ── Wrapper gives the Lottie a positioned anchor over the step card ───────
  stepCardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  // ── Lottie: step-advance feedback, centered over the step card ────────────
  stepLottie: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: 120,
    height: 120,
    marginTop: -60, // half of height to truly center vertically
  },

  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '18',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  stepText: { fontSize: 15, color: Colors.dark, lineHeight: 24 },
  navRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  navBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navBtnDisabled: { borderColor: '#DDD', backgroundColor: '#F5F5F5' },
  navBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  navBtnTextPrimary: { color: Colors.white },
  navBtnTextDisabled: { color: '#BBB' },
  ingredientsSection: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: 12 },
  ingredientText: { fontSize: 14, color: Colors.dark, flex: 1 },
});

// ─── Helper: extract YouTube video ID ────────────────────────────────────────
function extractYouTubeId(url: string): string {
  const patterns = [/[?&]v=([^&#]+)/, /youtu\.be\/([^?&#]+)/, /\/shorts\/([^?&#]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

// ─── Video Recipe ─────────────────────────────────────────────────────────────
function VideoRecipe({ meal }: { meal: Meal }) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractYouTubeId(meal.videoUrl);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  const handleTogglePlay = () => {
    soundManager.playSFX('button_tap');
    setPlaying((prev) => !prev);
  };

  return (
    <View style={videoStyles.container}>
      <View style={videoStyles.videoWrapper}>
        <YoutubeIframe
          height={VIDEO_HEIGHT}
          width={VIDEO_WIDTH}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
          webViewStyle={{ flex: 1 }}
          webViewProps={{ allowsFullscreenVideo: true, allowsInlineMediaPlayback: true }}
        />
      </View>

      <View style={videoStyles.infoCard}>
        <View style={videoStyles.infoHeader}>
          <Text style={videoStyles.infoTitle}>Cooking Tutorial</Text>
          <View style={videoStyles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} color="#F5A623" fill="#F5A623" />
            ))}
          </View>
        </View>
        <Text style={videoStyles.infoDesc}>
          Follow along with our step-by-step video guide to make the perfect{' '}
          <Text style={{ fontWeight: '700', color: Colors.primary }}>{meal.name}</Text>.
        </Text>
      </View>
    </View>
  );
}

const videoStyles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  videoWrapper: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: Colors.dark,
    alignSelf: 'center',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pauseBtn: { backgroundColor: Colors.dark },
  playBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  starRow: { flexDirection: 'row', gap: 2 },
  infoDesc: { fontSize: 14, color: Colors.gray, lineHeight: 21 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'written' | 'video'>('written');
  const [liked, setLiked] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const cookBtnScale = useRef(new Animated.Value(1)).current;
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  // ── Lottie ref for cook button (cooking.json) ─────────────────────────────
  const cookLottieRef = useRef<LottieView>(null);
  const [showCookLottie, setShowCookLottie] = useState(false);

  const meal = meals.find((m) => m.id === id);

  useEffect(() => {
    soundManager.playBackground('kitchen');
    return () => { soundManager.stopBackground(); };
  }, []);

  const heroTranslate = scrollY.interpolate({
    inputRange: [-100, 0, HERO_HEIGHT],
    outputRange: [50, 0, -HERO_HEIGHT * 0.4],
    extrapolate: 'clamp',
  });

  const handleLike = () => {
    soundManager.playSFX('button_tap');
    setLiked((v) => !v);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, damping: 6, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, damping: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleCook = () => {
    soundManager.playSFX('cooking_start');

    // ── Lottie 1: cooking.json plays once on the button, then navigates ──────
    setShowCookLottie(true);
    cookLottieRef.current?.play();

    Animated.sequence([
      Animated.timing(cookBtnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(cookBtnScale, { toValue: 1, damping: 10, useNativeDriver: true }),
    ]).start(() => {
      // Navigate after the button spring settles (~400 ms).
      // The Lottie plays concurrently; we hide it after navigation.
      setTimeout(() => {
        setShowCookLottie(false);
        router.push({ pathname: '/meal/cook', params: { mealId: meal?.id } });
      }, 600);
    });
  };

  const switchTab = (tab: 'written' | 'video') => {
    soundManager.playSFX('button_tap');
    setActiveTab(tab);
    Animated.spring(tabIndicatorX, {
      toValue: tab === 'written' ? 0 : 1,
      damping: 14,
      useNativeDriver: false,
    }).start();
  };

  // ── Lottie 3: loading.json shown while meal data is absent ────────────────
  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingFallback}>
          <LottieView
            source={require('@/assets/lottie/loading.json')}
            autoPlay
            loop
            style={styles.loadingLottie}
          />
          <Text style={styles.loadingText}>Looking for that meal…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const TAB_WIDTH = (width - 32 - 8) / 2;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Sticky header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [HERO_HEIGHT - HEADER_HEIGHT - 40, HERO_HEIGHT - HEADER_HEIGHT],
              outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <SafeAreaView edges={['top']} style={styles.stickyHeaderInner}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              soundManager.playSFX('button_tap');
              router.back();
            }}
          >
            <ChevronLeft size={22} color={Colors.dark} />
          </TouchableOpacity>
          <Animated.Text
            style={[
              styles.stickyTitle,
              {
                opacity: scrollY.interpolate({
                  inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT - 40],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
            numberOfLines={1}
          >
            {meal.name}
          </Animated.Text>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity style={styles.heartBtn} onPress={handleLike}>
              <Heart
                size={20}
                color={liked ? '#E74C3C' : Colors.gray}
                fill={liked ? '#E74C3C' : 'transparent'}
              />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
          <Animated.Image
            source={{ uri: meal.image }}
            style={[styles.heroImage, { transform: [{ translateY: heroTranslate }] }]}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.tagRow}>
              <Badge label={meal.region} color={Colors.white} />
              <Badge label={meal.difficulty} color="#F5A623" />
            </View>
            <Text style={styles.heroTitle}>{meal.name}</Text>
          </View>
        </View>

        {/* Stat chips */}
        <View style={styles.statsRow}>
          <StatChip icon={<Clock size={14} color={Colors.primary} />} value={`${meal.prepTime + meal.cookTime} min`} delay={0} />
          <StatChip icon={<Users size={14} color={Colors.primary} />} value={`${meal.servings} servings`} delay={80} />
          <StatChip icon={<Flame size={14} color="#E74C3C" />} value={meal.difficulty} delay={160} />
          <StatChip icon={<MapPin size={14} color={Colors.primary} />} value={meal.region} delay={240} />
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descText}>{meal.description}</Text>
          <View style={styles.costBadge}>
            <Text style={styles.costText}>💰 {meal.costPerServing.toLocaleString()} FCFA / serving</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabWrapper}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: TAB_WIDTH,
                left: tabIndicatorX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, TAB_WIDTH + 4],
                }),
              },
            ]}
          />
          <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('written')} activeOpacity={0.8}>
            <ChefHat size={16} color={activeTab === 'written' ? Colors.white : Colors.gray} />
            <Text style={[styles.tabText, activeTab === 'written' && styles.tabTextActive]}>
              Written Recipe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('video')} activeOpacity={0.8}>
            <Play size={16} color={activeTab === 'video' ? Colors.white : Colors.gray} />
            <Text style={[styles.tabText, activeTab === 'video' && styles.tabTextActive]}>
              Video Recipe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'written' ? <WrittenRecipe meal={meal} /> : <VideoRecipe meal={meal} />}
        </View>

        {/* Cook button */}
        <View style={styles.cookSection}>
          {/* ── Lottie 1: cooking.json overlays the cook button on tap ────────
                Positioned absolutely over the button, centered, plays once
                then the screen navigates away. pointerEvents="none" keeps
                the button pressable underneath while it plays.              */}
          <View style={styles.cookBtnWrapper}>
            <Animated.View style={{ transform: [{ scale: cookBtnScale }] }}>
              <TouchableOpacity style={styles.cookBtn} onPress={handleCook} activeOpacity={1}>
                <ChefHat size={22} color={Colors.white} />
                <Text style={styles.cookBtnText}>Cook This Meal</Text>
              </TouchableOpacity>
            </Animated.View>

            {showCookLottie && (
              <LottieView
                ref={cookLottieRef}
                source={require('@/assets/lottie/cooking.json')}
                autoPlay
                loop={false}
                style={styles.cookLottie}
              />
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3EE' },

  // ── Lottie: loading fallback (replaces plain text "Meal not found") ────────
  loadingFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLottie: {
    width: 160,
    height: 160,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.gray,
    fontWeight: '600',
  },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  stickyHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    height: HEADER_HEIGHT,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stickyTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
    marginHorizontal: 8,
  },
  heartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroImage: { width, height: HERO_HEIGHT + 60, position: 'absolute', top: -30 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  heroContent: { position: 'absolute', bottom: 24, left: 20, right: 20 },
  tagRow: { flexDirection: 'row', marginBottom: 10 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
    marginBottom: 4,
  },
  descSection: { paddingHorizontal: 16, paddingVertical: 16 },
  descText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 14 },
  costBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  costText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  tabWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#EDE8E2',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    zIndex: 0,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 6,
    zIndex: 1,
  },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.gray },
  tabTextActive: { color: Colors.white },
  tabContent: { marginBottom: 4 },
  cookSection: { paddingHorizontal: 16, paddingVertical: 24 },

  // ── Cook button wrapper gives the Lottie an anchor to position against ─────
  cookBtnWrapper: {
    position: 'relative',
  },
  cookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  cookBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // ── Lottie: cooking.json centered over the cook button ────────────────────
  cookLottie: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    width: 100,
    height: 100,
    marginTop: -50,
  },
});