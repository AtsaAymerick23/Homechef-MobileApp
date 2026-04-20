import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Users, ChefHat, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useCookingStore, type CookingHistory } from '@/stores/cookingStore';

// ─── Animated Stat Card ──────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Animated History Card ───────────────────────────────────────────────────

function HistoryCard({ item, index }: { item: CookingHistory; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const cookedDate = new Date(item.cookedAt);
  const formattedDate = cookedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 300 + index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: 300 + index * 80,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.historyCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: pressScale }],
        },
      ]}
    >
      <Pressable
        style={styles.historyInner}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.historyImageWrap}>
          <Image source={{ uri: item.mealImage }} style={styles.historyImage} />
          <View style={styles.imageOverlay} />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyMealName} numberOfLines={1}>
            {item.mealName}
          </Text>
          <Text style={styles.historyDate}>{formattedDate}</Text>

          <View style={styles.historyStats}>
            <View style={styles.pill}>
              <Users size={12} color={Colors.primary} />
              <Text style={styles.pillText}>{item.peopleCount} people</Text>
            </View>
            <View style={styles.pill}>
              <Clock size={12} color={Colors.primary} />
              <Text style={styles.pillText}>{item.totalTime} min</Text>
            </View>
          </View>

          <View style={styles.costBadge}>
            <Text style={styles.costText}>
              {item.totalCost.toLocaleString()} FCFA
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={styles.emptyIconRing}>
          <ChefHat size={40} color={Colors.primary} />
        </View>
      </Animated.View>
      <Text style={styles.emptyTitle}>No Cooking History Yet</Text>
      <Text style={styles.emptyText}>
        Start cooking meals to track your culinary journey!
      </Text>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ExperienceScreen() {
  const { history } = useCookingStore();

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  const totalCooked = history.length;
  const totalSpent = history.reduce((sum, item) => sum + item.totalCost, 0);
  const totalTime = history.reduce((sum, item) => sum + item.totalTime, 0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Experience</Text>
          <View style={styles.trendBadge}>
            <TrendingUp size={14} color={Colors.primary} />
            <Text style={styles.trendText}>{totalCooked} meals</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<ChefHat size={22} color={Colors.primary} />}
            value={String(totalCooked)}
            label="Meals Cooked"
            delay={80}
          />
          <StatCard
            icon={<Clock size={22} color={Colors.primary} />}
            value={`${Math.round(totalTime / 60)}h`}
            label="Time Spent"
            delay={160}
          />
          <StatCard
            icon={
              <Text style={styles.currencyIcon}>₣</Text>
            }
            value={`${(totalSpent / 1000).toFixed(1)}k`}
            label="FCFA Spent"
            delay={240}
          />
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cooking History</Text>
            {history.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{history.length}</Text>
              </View>
            )}
          </View>

          {history.length === 0 ? (
            <EmptyState />
          ) : (
            history.map((item, index) => (
              <HistoryCard key={item.id} item={item} index={index} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoHome: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.logoHome,
    letterSpacing: -0.5,
  },
  logoChef: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.logoChef,
    letterSpacing: -0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Content
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },

  // Stat Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: '500',
  },
  currencyIcon: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '800',
  },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // History Card
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  historyInner: {
    flexDirection: 'row',
  },
  historyImageWrap: {
    position: 'relative',
    width: 100,
    height: 110,
  },
  historyImage: {
    width: 100,
    height: 110,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  historyContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 4,
  },
  historyMealName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: -0.2,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '400',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  costBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  costText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 12,
  },
  emptyIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 36,
    lineHeight: 20,
  },
});