import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Animated,
  Easing,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Camera, Edit2, Check, X, User, Volume2, VolumeX, Music, Music2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useSoundStore } from '@/stores/soundStore';
import { soundManager } from '@/lib/soundManager';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  cream: '#FAF7F2',
  sand: '#EDE8DF',
  terracotta: '#ebba25',
  terracottaLight: '#E8845A',  // ← comma was missing here in your local file
  charcoal: '#9b3716',
  muted: '#8C7B72',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#27AE60',
  cardBg: '#FFFFFF',
  border: '#E0D9D0',
  inputBg: '#F7F3EE',
  shadow: '#2B2420',
};

// ─── Custom hook: fade + slide-up mount animation ─────────────────────────────
function useMountAnimation(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── Animated Input ───────────────────────────────────────────────────────────
function AnimatedInput({
  label,
  value,
  onChangeText,
  editable = true,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  editable?: boolean;
  placeholder?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderColor = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.01, useNativeDriver: true }),
      Animated.timing(borderColor, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };
  const onBlur = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(borderColor, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const interpolatedBorder = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [T.border, T.charcoal],
  });

  return (
    <Animated.View style={[inputStyles.group, { transform: [{ scale }] }]}>
      <Text style={inputStyles.label}>{label}</Text>
      <Animated.View
        style={[
          inputStyles.inputWrap,
          { borderColor: interpolatedBorder },
          !editable && inputStyles.disabledWrap,
        ]}
      >
        <TextInput
          style={[inputStyles.input, !editable && inputStyles.disabledText]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={T.muted}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Animated.View>
    </Animated.View>
  );
}

const inputStyles = StyleSheet.create({
  group: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: T.muted,
    marginBottom: 6,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: T.inputBg,
    overflow: 'hidden',
  },
  disabledWrap: { backgroundColor: T.sand, borderColor: T.border },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: T.charcoal,
  },
  disabledText: { color: T.muted },
});

// ─── Avatar with camera overlay ───────────────────────────────────────────────
function AvatarPicker({ uri, onPick }: { uri: string | null; onPick: (localUri: string) => void }) {
  const ripple = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    Animated.sequence([
      Animated.timing(ripple, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library in Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      onPick(result.assets[0].uri);
    }
  };

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={[avatarStyles.container, { transform: [{ scale: rippleScale }] }]}>
        {uri ? (
          <Image source={{ uri }} style={avatarStyles.image} />
        ) : (
          <View style={avatarStyles.placeholder}>
            <User size={40} color={T.muted} />
          </View>
        )}
        <View style={avatarStyles.overlay} />
        <View style={avatarStyles.cameraBtn}>
          <Camera size={16} color={T.white} />
        </View>
        <Text style={avatarStyles.hint}>Change Photo</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: { width: 108, height: 108, borderRadius: 54, borderWidth: 3, borderColor: T.white },
  placeholder: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: T.sand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T.border,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 54,
    backgroundColor: 'rgba(43,36,32,0.12)',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: T.charcoal,  // ← comma was missing here in your local file
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: T.white,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  hint: {
    position: 'absolute',
    bottom: -22,
    fontSize: 11,
    color: T.muted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

// ─── Volume Slider (custom — no external dep) ─────────────────────────────────
function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackWidth = useRef(0);
  const fillAnim = useRef(new Animated.Value(value)).current;

  // Keep fill in sync when value changes from outside
  React.useEffect(() => {
    Animated.spring(fillAnim, { toValue: value, damping: 18, useNativeDriver: false }).start();
  }, [value]);

  return (
    <View style={sliderStyles.row}>
      <VolumeX size={16} color={T.muted} />
      <View
        style={sliderStyles.track}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
      >
        {/* Filled portion */}
        <Animated.View
          style={[
            sliderStyles.fill,
            {
              width: fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        {/* 5 discrete step buttons */}
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <TouchableOpacity
            key={step}
            style={[sliderStyles.step, { left: `${step * 100}%` as any }]}
            onPress={() => onChange(step)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <View
              style={[
                sliderStyles.dot,
                value >= step && sliderStyles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Volume2 size={16} color={T.terracotta} />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: T.sand,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: T.charcoal,
    borderRadius: 3,
  },
  step: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: T.border,
    borderWidth: 2,
    borderColor: T.white,
  },
  dotActive: {
    backgroundColor: T.charcoal,
  },
});

// ─── Sound Row (toggle row inside the sound card) ─────────────────────────────
function SoundRow({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    soundManager.playSFX('button_tap');
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[soundStyles.row, { transform: [{ scale }] }]}>
      <View style={soundStyles.rowIcon}>{icon}</View>
      <View style={soundStyles.rowText}>
        <Text style={soundStyles.rowLabel}>{label}</Text>
        <Text style={soundStyles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: T.border, true: T.terracottaLight }}
        thumbColor={value ? T.charcoal : T.sand}
        ios_backgroundColor={T.border}
      />
    </Animated.View>
  );
}

const soundStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FDF0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: T.charcoal, marginBottom: 2 },
  rowDesc: { fontSize: 12, color: T.muted, lineHeight: 16 },
  divider: { height: 1, backgroundColor: T.sand, marginLeft: 50 },
  volumeBlock: { paddingBottom: 8, paddingLeft: 50, paddingRight: 4 },
  volumeLabel: { fontSize: 11, fontWeight: '700', color: T.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();
  const { sfxEnabled, bgEnabled, bgVolume, toggleSFX, toggleBG, setBGVolume } = useSoundStore();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null);

  // Staggered entrance animations
  const headerAnim  = useMountAnimation(0);
  const cardAnim    = useMountAnimation(120);
  const formAnim    = useMountAnimation(220);
  const soundAnim   = useMountAnimation(300);
  const footerAnim  = useMountAnimation(380);

  const editSlide = useRef(new Animated.Value(0)).current;
  const toggleEdit = (on: boolean) => {
    setIsEditing(on);
    Animated.spring(editSlide, {
      toValue: on ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const handleAvatarPick = (uri: string) => setAvatarUri(uri);

  const handleSave = async () => {
    const { error } = await updateProfile({ username, full_name: fullName });
    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      toggleEdit(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const saveButtonScale = editSlide.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim]}>
        <View style={styles.logoRow}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.screenLabel}>My Account</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <Animated.View style={[styles.card, cardAnim]}>
          <View style={styles.cardAccent} />
          <View style={styles.avatarRow}>
            <AvatarPicker uri={avatarUri} onPick={handleAvatarPick} />
          </View>
          <Text style={styles.profileName}>{username || 'Guest'}</Text>
          <Text style={styles.profileSub}>{fullName || 'HomeChef Member'}</Text>
        </Animated.View>

        {/* Profile Information */}
        <Animated.View style={[styles.section, formAnim]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!isEditing ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => toggleEdit(true)} activeOpacity={0.7}>
                <Edit2 size={14} color={T.terracotta} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View style={[styles.editActions, { transform: [{ scale: saveButtonScale }] }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                  <Check size={18} color={T.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => toggleEdit(false)}>
                  <X size={18} color={T.error} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <View style={styles.formCard}>
            <AnimatedInput label="Username" value={username} onChangeText={setUsername} editable={isEditing} placeholder="Enter username" />
            <AnimatedInput label="Full Name" value={fullName} onChangeText={setFullName} editable={isEditing} placeholder="Enter your full name" />
            <AnimatedInput label="Phone Number" value={user?.phone || 'Not provided'} editable={false} />
          </View>
        </Animated.View>

        {/* ── Sound Settings ───────────────────────────────────────────────── */}
        <Animated.View style={[styles.section, soundAnim]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sound Settings</Text>
          </View>

          <View style={styles.formCard}>
            {/* Sound Effects toggle */}
            <SoundRow
              icon={<Volume2 size={18} color={T.terracotta} />}
              label="Sound Effects"
              description="Button taps, step chimes & success sounds"
              value={sfxEnabled}
              onToggle={toggleSFX}
            />

            <View style={soundStyles.divider} />

            {/* Background Music toggle */}
            <SoundRow
              icon={<Music size={18} color={T.terracotta} />}
              label="Background Music"
              description="Ambient kitchen & cooking atmosphere"
              value={bgEnabled}
              onToggle={toggleBG}
            />

            {/* Volume slider — only shown when bg music is on */}
            {bgEnabled && (
              <View style={soundStyles.volumeBlock}>
                <Text style={soundStyles.volumeLabel}>
                  Background Volume — {Math.round(bgVolume * 100)}%
                </Text>
                <VolumeSlider
                  value={bgVolume}
                  onChange={(v) => setBGVolume(v)}
                />
              </View>
            )}

            <View style={soundStyles.divider} />

            {/* Preview button */}
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => soundManager.playSFX('step_complete')}
              activeOpacity={0.75}
            >
              <Music2 size={16} color={T.charcoal} />
              <Text style={styles.previewBtnText}>Preview Sound Effects</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* Logout */}
        <Animated.View style={footerAnim}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={18} color={T.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>HomeChef v1.0.0</Text>
            <Text style={styles.appCopyright}>© 2024 HomeChef Cameroon</Text>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.cream },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.sand,
    backgroundColor: T.cream,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  logoHome: { fontSize: 22, fontWeight: '800', color: T.charcoal, letterSpacing: -0.5 },
  logoChef: { fontSize: 22, fontWeight: '800', color: T.terracotta, letterSpacing: -0.5 },
  screenLabel: { fontSize: 13, color: T.muted, fontWeight: '500', letterSpacing: 0.3 },
  scroll: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: T.cardBg,
    borderRadius: 20,
    alignItems: 'center',
    paddingBottom: 28,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardAccent: { width: '100%', height: 72, backgroundColor: T.charcoal },
  avatarRow: { marginTop: -54, marginBottom: 28, alignItems: 'center' },
  profileName: { fontSize: 20, fontWeight: '800', color: T.charcoal, letterSpacing: -0.3, marginBottom: 4 },
  profileSub: { fontSize: 13, color: T.muted, fontWeight: '500' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: T.charcoal, letterSpacing: -0.2 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FDF0EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: { color: T.terracotta, fontWeight: '700', fontSize: 13 },
  editActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: T.cardBg,
    borderRadius: 16,
    padding: 18,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.charcoal + '50',
    backgroundColor: '#FDF0EA',
  },
  previewBtnText: { fontSize: 13, fontWeight: '700', color: T.terracotta },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.cardBg,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#F5D5D2',
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: { color: T.error, fontSize: 15, fontWeight: '700' },
  appInfo: { alignItems: 'center', gap: 3 },
  appVersion: { fontSize: 12, color: T.muted, fontWeight: '500' },
  appCopyright: { fontSize: 11, color: T.border },
});