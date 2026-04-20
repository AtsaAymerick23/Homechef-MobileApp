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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Camera, Edit2, Check, X, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  cream: '#FAF7F2',
  sand: '#EDE8DF',
  terracotta: '#C4622D',
  terracottaLight: '#E8845A',
  charcoal: '#2B2420',
  muted: '#8C7B72',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#27AE60',
  cardBg: '#FFFFFF',
  border: '#E0D9D0',
  inputBg: '#F7F3EE',
  shadow: '#2B2420',
};

// ─── Custom hook: fade + slide-up mount animation ──────────────────────────
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
    outputRange: [T.border, T.terracotta],
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

// ─── Avatar with camera overlay ──────────────────────────────────────────────
function AvatarPicker({
  uri,
  onPick,
}: {
  uri: string | null;
  onPick: (localUri: string) => void;
}) {
  const ripple = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    // Animate ripple feedback
    Animated.sequence([
      Animated.timing(ripple, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library in Settings to change your profile picture.',
      );
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
        {/* Overlay gradient hint */}
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
  image: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: T.white,
  },
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
    backgroundColor: T.terracotta,
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar_url || null,
  );

  // Staggered entrance animations
  const headerAnim = useMountAnimation(0);
  const cardAnim = useMountAnimation(120);
  const formAnim = useMountAnimation(220);
  const footerAnim = useMountAnimation(320);

  // Edit mode slide animation
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

  const handleAvatarPick = (uri: string) => {
    setAvatarUri(uri);
    // In a real app you would upload to Supabase Storage here and then call updateProfile
    // e.g.: const publicUrl = await uploadAvatarToStorage(uri);
    //       await updateProfile({ avatar_url: publicUrl });
  };

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

  const saveButtonScale = editSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
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
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => toggleEdit(true)}
                activeOpacity={0.7}
              >
                <Edit2 size={14} color={T.terracotta} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View
                style={[styles.editActions, { transform: [{ scale: saveButtonScale }] }]}
              >
                <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
                  <Check size={18} color={T.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => toggleEdit(false)}
                >
                  <X size={18} color={T.error} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <View style={styles.formCard}>
            <AnimatedInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              editable={isEditing}
              placeholder="Enter username"
            />
            <AnimatedInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              placeholder="Enter your full name"
            />
            <AnimatedInput
              label="Phone Number"
              value={user?.phone || 'Not provided'}
              editable={false}
            />
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View style={footerAnim}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
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
  root: {
    flex: 1,
    backgroundColor: T.cream,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.sand,
    backgroundColor: T.cream,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoHome: {
    fontSize: 22,
    fontWeight: '800',
    color: T.charcoal,
    letterSpacing: -0.5,
  },
  logoChef: {
    fontSize: 22,
    fontWeight: '800',
    color: T.terracotta,
    letterSpacing: -0.5,
  },
  screenLabel: {
    fontSize: 13,
    color: T.muted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  scroll: {
    padding: 20,
    paddingBottom: 48,
  },

  // Profile Card
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
  cardAccent: {
    width: '100%',
    height: 72,
    backgroundColor: T.terracotta,
    marginBottom: 0,
  },
  avatarRow: {
    marginTop: -54,
    marginBottom: 28,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: T.charcoal,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 13,
    color: T.muted,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: T.charcoal,
    letterSpacing: -0.2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FDF0EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: {
    color: T.terracotta,
    fontWeight: '700',
    fontSize: 13,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
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

  // Logout
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
  logoutText: {
    color: T.error,
    fontSize: 15,
    fontWeight: '700',
  },

  appInfo: {
    alignItems: 'center',
    gap: 3,
  },
  appVersion: {
    fontSize: 12,
    color: T.muted,
    fontWeight: '500',
  },
  appCopyright: {
    fontSize: 11,
    color: T.border,
  },
});