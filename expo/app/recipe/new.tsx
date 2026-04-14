import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, X, Camera, Save, ChevronLeft, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCookingStore } from '@/stores/cookingStore';
import { useAuthStore } from '@/stores/authStore';

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  primary: '#7b3b22',       // deep terracotta brown
  primaryLight: '#a0522d',  // sienna – hover/active shade
  primaryFaint: '#f0e0d4',  // very light tint of primary
  secondary: '#f5ece3',     // warm cream – page background
  cardBg: '#fffaf6',        // off-white card surface
  ink: '#2c1810',           // near-black text
  inkMid: '#7a5c50',        // muted body text
  inkLight: '#b89585',      // placeholder / label
  border: '#e8d5c8',        // card borders
  error: '#c0392b',
  white: '#ffffff',
};

// ─── Animated Press Button ────────────────────────────────────────────────────
function AnimatedPressable({
  onPress,
  style,
  children,
  scaleDown = 0.96,
}: {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  scaleDown?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// ─── Animated List Item ───────────────────────────────────────────────────────
function AnimatedListItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, speed: 14, bounciness: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.pill} />
      <Text style={sh.title}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  pill: { width: 4, height: 20, borderRadius: 2, marginRight: 10, backgroundColor: BRAND.primary },
  title: { fontSize: 15, fontWeight: '700', color: BRAND.ink, letterSpacing: 0.3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NewRecipeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addUserRecipe } = useCookingStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [images, setImages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  // Header entrance
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-18)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(headerTranslate, { toValue: 0, speed: 12, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  // Save pulse
  const savePulse = useRef(new Animated.Value(1)).current;
  const triggerSavePulse = () =>
    Animated.sequence([
      Animated.timing(savePulse, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.spring(savePulse, { toValue: 1, speed: 20, useNativeDriver: true }),
    ]).start();

  // ── Ingredients ──
  const addIngredient = () => setIngredients((p) => [...p, '']);
  const updateIngredient = (i: number, v: string) =>
    setIngredients((p) => { const u = [...p]; u[i] = v; return u; });
  const removeIngredient = (i: number) => {
    if (ingredients.length > 1) setIngredients((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Instructions ──
  const addInstruction = () => setInstructions((p) => [...p, '']);
  const updateInstruction = (i: number, v: string) =>
    setInstructions((p) => { const u = [...p]; u[i] = v; return u; });
  const removeInstruction = (i: number) => {
    if (instructions.length > 1) setInstructions((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Image ──
  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) setImages([result.assets[0].uri]);
  };
  const removeImage = () => setImages([]);

  // ── Save ──
  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Missing name', 'Please enter a recipe name.');
    if (!description.trim()) return Alert.alert('Missing description', 'Please describe your recipe.');
    const validIngredients = ingredients.filter((i) => i.trim());
    const validInstructions = instructions.filter((i) => i.trim());
    if (!validIngredients.length) return Alert.alert('Missing ingredients', 'Add at least one ingredient.');
    if (!validInstructions.length) return Alert.alert('Missing steps', 'Add at least one instruction.');

    triggerSavePulse();
    setSaved(true);

    addUserRecipe({
      id: Date.now().toString(),
      userId: user?.id || 'guest',
      name: name.trim(),
      description: description.trim(),
      images,
      ingredients: validIngredients,
      instructions: validInstructions,
      createdAt: new Date().toISOString(),
    });

    setTimeout(() => {
      Alert.alert('Recipe saved!', 'Your recipe has been created.', [
        { text: 'View recipes', onPress: () => router.push('/(tabs)/recipes') },
      ]);
    }, 350);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Soft background blobs ── */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* ── Animated Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] },
          ]}
        >
          <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={20} color={BRAND.primary} />
          </AnimatedPressable>

          <View>
            <Text style={styles.headerEyebrow}>NEW RECIPE</Text>
            <Text style={styles.headerTitle}>Create Something{'\n'}Delicious 🍽</Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Photo ── */}
          <AnimatedListItem delay={80}>
            <View style={styles.card}>
              <SectionHeader title="Photo" />
              {images[0] ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: images[0] }} style={styles.image} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage} activeOpacity={0.8}>
                    <X size={14} color={BRAND.white} />
                  </TouchableOpacity>
                  <View style={styles.imageBadge}>
                    <Check size={12} color={BRAND.white} />
                    <Text style={styles.imageBadgeText}>Photo added</Text>
                  </View>
                </View>
              ) : (
                <AnimatedPressable onPress={handleAddImage} style={styles.addImageBtn}>
                  <View style={styles.addImageInner}>
                    <View style={styles.cameraCircle}>
                      <Camera size={22} color={BRAND.primary} />
                    </View>
                    <Text style={styles.addImagePrimary}>Add a photo</Text>
                    <Text style={styles.addImageSub}>Tap to choose from your library</Text>
                  </View>
                </AnimatedPressable>
              )}
            </View>
          </AnimatedListItem>

          {/* ── Details ── */}
          <AnimatedListItem delay={150}>
            <View style={styles.card}>
              <SectionHeader title="Details" />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>RECIPE NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grandma's Lasagna"
                  placeholderTextColor={BRAND.inkLight}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What makes this recipe special?"
                  placeholderTextColor={BRAND.inkLight}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </AnimatedListItem>

          {/* ── Ingredients ── */}
          <AnimatedListItem delay={220}>
            <View style={styles.card}>
              <SectionHeader title="Ingredients" />
              {ingredients.map((ingredient, index) => (
                <AnimatedListItem key={index} delay={0}>
                  <View style={styles.listRow}>
                    <View style={styles.bulletDot} />
                    <TextInput
                      style={styles.listInput}
                      placeholder={`Ingredient ${index + 1}`}
                      placeholderTextColor={BRAND.inkLight}
                      value={ingredient}
                      onChangeText={(v) => updateIngredient(index, v)}
                    />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeIngredient(index)} activeOpacity={0.7}>
                      <X size={14} color={BRAND.error} />
                    </TouchableOpacity>
                  </View>
                </AnimatedListItem>
              ))}
              <AnimatedPressable onPress={addIngredient} style={styles.addRowBtn}>
                <View style={styles.addRowInner}>
                  <Plus size={15} color={BRAND.primary} />
                  <Text style={styles.addRowText}>Add Ingredient</Text>
                </View>
              </AnimatedPressable>
            </View>
          </AnimatedListItem>

          {/* ── Instructions ── */}
          <AnimatedListItem delay={290}>
            <View style={styles.card}>
              <SectionHeader title="Instructions" />
              {instructions.map((instruction, index) => (
                <AnimatedListItem key={index} delay={0}>
                  <View style={styles.listRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{index + 1}</Text>
                    </View>
                    <TextInput
                      style={[styles.listInput, styles.instructionInput]}
                      placeholder={`Describe step ${index + 1}`}
                      placeholderTextColor={BRAND.inkLight}
                      value={instruction}
                      onChangeText={(v) => updateInstruction(index, v)}
                      multiline
                    />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeInstruction(index)} activeOpacity={0.7}>
                      <X size={14} color={BRAND.error} />
                    </TouchableOpacity>
                  </View>
                </AnimatedListItem>
              ))}
              <AnimatedPressable onPress={addInstruction} style={styles.addRowBtn}>
                <View style={styles.addRowInner}>
                  <Plus size={15} color={BRAND.primary} />
                  <Text style={styles.addRowText}>Add Step</Text>
                </View>
              </AnimatedPressable>
            </View>
          </AnimatedListItem>

          {/* ── Save Button ── */}
          <AnimatedListItem delay={360}>
            <Animated.View style={{ transform: [{ scale: savePulse }] }}>
              <AnimatedPressable onPress={handleSave} scaleDown={0.97} style={styles.saveBtn}>
                {saved
                  ? <Check size={20} color={BRAND.white} />
                  : <Save size={20} color={BRAND.white} />}
                <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Recipe'}</Text>
              </AnimatedPressable>
            </Animated.View>
          </AnimatedListItem>

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.secondary,  // #f5ece3
  },

  // Background blobs
  blobTopRight: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: BRAND.primaryFaint,
    opacity: 0.6,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: BRAND.primaryFaint,
    opacity: 0.4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: BRAND.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND.ink,
    lineHeight: 28,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },

  // Cards
  card: {
    backgroundColor: BRAND.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // Image
  imageWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: BRAND.error,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  imageBadgeText: {
    color: BRAND.white,
    fontSize: 11,
    fontWeight: '600',
  },
  addImageBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  addImageInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  cameraCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addImagePrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.ink,
  },
  addImageSub: {
    fontSize: 12,
    color: BRAND.inkMid,
  },

  // Inputs
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: BRAND.inkLight,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BRAND.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: BRAND.ink,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  textArea: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: 13,
  },

  // List rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.primary,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: BRAND.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  stepBadgeText: {
    color: BRAND.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  listInput: {
    flex: 1,
    backgroundColor: BRAND.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: BRAND.ink,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  instructionInput: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#fdecea',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add row
  addRowBtn: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    backgroundColor: BRAND.primaryFaint,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.primary,
  },

  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.primary,
    paddingVertical: 17,
    borderRadius: 18,
    gap: 10,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: {
    color: BRAND.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});