import { Tabs } from 'expo-router';
import { Home, BookOpen, Calendar, History, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const TABS = [
  { name: 'index',      label: 'Home',       Icon: Home      },
  { name: 'recipes',   label: 'Recipes',    Icon: BookOpen  },
  { name: 'events',    label: 'Events',     Icon: Calendar  },
  { name: 'experience',label: 'Experience', Icon: History   },
  { name: 'account',   label: 'Account',    Icon: User      },
];

const TAB_COUNT   = TABS.length;
const TAB_WIDTH   = width / TAB_COUNT;
const PILL_WIDTH  = TAB_WIDTH - 16;

// ─── Animated Tab Bar ────────────────────────────────────────────────────────

function AnimatedTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Pill slide position
  const pillX = useRef(new Animated.Value(state.index * TAB_WIDTH + 8)).current;

  // Per-tab scale & opacity animations
  const scales  = useRef(TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.85))).current;
  const opacities = useRef(TABS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.45))).current;
  const iconScales = useRef(TABS.map((_, i) => new Animated.Value(i === 0 ? 1.15 : 1))).current;

  // Bounce spring on mount
  const barSlideY = useRef(new Animated.Value(80)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(barSlideY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const prevIndex = useRef(state.index);

  useEffect(() => {
    const curr = state.index;
    const prev = prevIndex.current;

    // Slide pill
    Animated.spring(pillX, {
      toValue: curr * TAB_WIDTH + 8,
      damping: 22,
      stiffness: 260,
      mass: 0.8,
      useNativeDriver: true,
    }).start();

    // Deactivate previous tab
    Animated.parallel([
      Animated.spring(scales[prev], {
        toValue: 0.85,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacities[prev], {
        toValue: 0.45,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(iconScales[prev], {
        toValue: 1,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Activate current tab
    Animated.parallel([
      Animated.spring(scales[curr], {
        toValue: 1,
        damping: 12,
        stiffness: 260,
        useNativeDriver: true,
      }),
      Animated.timing(opacities[curr], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(iconScales[curr], {
        toValue: 1.18,
        damping: 10,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();

    prevIndex.current = curr;
  }, [state.index]);

  return (
    <Animated.View
      style={[
        styles.barWrapper,
        {
          paddingBottom: insets.bottom + 8,
          transform: [{ translateY: barSlideY }],
          opacity: barOpacity,
        },
      ]}
    >
      {/* Frosted glass background */}
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.barOverlay} />

      {/* Sliding pill */}
      <Animated.View
        style={[
          styles.pill,
          { width: PILL_WIDTH, transform: [{ translateX: pillX }] },
        ]}
      />

      {/* Tab buttons */}
      <View style={styles.tabRow}>
        {TABS.map((tab, index) => {
          const route = state.routes[index];
          const isFocused = state.index === index;
          const { Icon } = tab;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabButton}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
            >
              <Animated.View
                style={[
                  styles.tabInner,
                  {
                    transform: [{ scale: scales[index] }],
                    opacity: opacities[index],
                  },
                ]}
              >
                <Animated.View style={{ transform: [{ scale: iconScales[index] }] }}>
                  <Icon
                    size={22}
                    color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                    strokeWidth={isFocused ? 2.2 : 1.6}
                  />
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      fontWeight: isFocused ? '700' : '400',
                    },
                  ]}
                >
                  {tab.label}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tabs.Screen name="index"      options={{ title: 'Home'       }} />
      <Tabs.Screen name="recipes"    options={{ title: 'Recipes'    }} />
      <Tabs.Screen name="events"     options={{ title: 'Events'     }} />
      <Tabs.Screen name="experience" options={{ title: 'Experience' }} />
      <Tabs.Screen name="account"    options={{ title: 'Account'    }} />
    </Tabs>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const BORDER_RADIUS = 28;

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    // Elevation / shadow
    ...Platform.select({
      ios: {
        shadowColor: '#5a2a1a',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  barOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(90, 42, 26, 0.82)',
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pill: {
    position: 'absolute',
    top: 10,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    // Subtle glow
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary ?? '#5a2a1a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
    }),
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});