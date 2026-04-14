import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ChefHat, Share2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useCookingStore } from '@/stores/cookingStore';
import type { UserRecipe } from '@/stores/cookingStore';

// ─── Recipe Detail Modal ────────────────────────────────────────────────────

function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: UserRecipe | null;
  onClose: () => void;
}) {
  if (!recipe) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: recipe.name,
        message: [
          `🍽️ ${recipe.name}`,
          '',
          recipe.description,
          '',
          recipe.ingredients?.length
            ? `Ingredients:\n${recipe.ingredients.map((i: string) => `• ${i}`).join('\n')}`
            : '',
          '',
          recipe.instructions?.length
            ? `Steps:\n${recipe.instructions.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}`
            : '',
        ]
          .join('\n')
          .trim(),
      });
    } catch (e) {
      // user cancelled — do nothing
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={modal.header}>
          <TouchableOpacity style={modal.iconBtn} onPress={onClose}>
            <X size={20} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={modal.headerTitle} numberOfLines={1}>
            {recipe.name}
          </Text>
          <TouchableOpacity style={modal.iconBtn} onPress={handleShare}>
            <Share2 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero image */}
          {recipe.images?.[0] ? (
            <Image source={{ uri: recipe.images[0] }} style={modal.heroImage} />
          ) : (
            <View style={modal.heroPlaceholder}>
              <ChefHat size={48} color={Colors.lightGray} />
            </View>
          )}

          <View style={modal.body}>
            <Text style={modal.recipeName}>{recipe.name}</Text>
            {recipe.description ? (
              <Text style={modal.recipeDescription}>{recipe.description}</Text>
            ) : null}

            {/* Ingredients */}
            {recipe.ingredients?.length ? (
              <View style={modal.section}>
                <Text style={modal.sectionTitle}>Ingredients</Text>
                {recipe.ingredients.map((item: string, idx: number) => (
                  <View key={idx} style={modal.bulletRow}>
                    <View style={modal.bullet} />
                    <Text style={modal.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Instructions */}
            {recipe.instructions?.length ? (
              <View style={modal.section}>
                <Text style={modal.sectionTitle}>Instructions</Text>
                {recipe.instructions.map((step: string, idx: number) => (
                  <View key={idx} style={modal.stepRow}>
                    <View style={modal.stepNum}>
                      <Text style={modal.stepNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={modal.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={modal.createdAt}>
              Created {new Date(recipe.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function MyRecipesScreen() {
  const router = useRouter();
  const { userRecipes, removeUserRecipe, updateUserRecipe } = useCookingStore();
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Recipe', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeUserRecipe(id),
      },
    ]);
  };

  // ── Pick image and attach to existing recipe ──────────────────────────────
  const handlePickImage = async (recipeId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      updateUserRecipe(recipeId, { images: [result.assets[0].uri] });
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async (recipe: UserRecipe) => {
    try {
      await Share.share({
        title: recipe.name,
        message: [
          `🍽️ ${recipe.name}`,
          '',
          recipe.description,
          '',
          recipe.ingredients?.length
            ? `Ingredients:\n${recipe.ingredients.map((i: string) => `• ${i}`).join('\n')}`
            : '',
        ]
          .join('\n')
          .trim(),
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.headerTitle}>My Recipes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Create button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/recipe/new')}
          activeOpacity={0.9}
        >
          <Plus size={24} color={Colors.white} />
          <Text style={styles.addButtonText}>Create New Recipe</Text>
        </TouchableOpacity>

        {/* Empty state */}
        {userRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <ChefHat size={64} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>No Recipes Yet</Text>
            <Text style={styles.emptyText}>
              Start creating your own Cameroonian recipes and share your culinary creativity!
            </Text>
          </View>
        ) : (
          <View style={styles.recipesList}>
            {userRecipes.map((recipe) => (
              // Tap card → open detail modal
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => setSelectedRecipe(recipe)}
                activeOpacity={0.85}
              >
                {/* Image area — tap to change */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handlePickImage(recipe.id);
                  }}
                  activeOpacity={0.8}
                >
                  {recipe.images?.[0] ? (
                    <Image source={{ uri: recipe.images[0] }} style={styles.recipeImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Plus size={22} color={Colors.gray} />
                      <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeDescription} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                  <Text style={styles.recipeDate}>
                    Created {new Date(recipe.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShare(recipe);
                    }}
                  >
                    <Share2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(recipe.id, recipe.name);
                    }}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoHome: { fontSize: 24, fontWeight: 'bold', color: Colors.logoHome },
  logoChef: { fontSize: 24, fontWeight: 'bold', color: Colors.logoChef },
  headerTitle: { fontSize: 16, color: Colors.gray },
  content: { flex: 1, padding: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.dark, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.gray, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  recipesList: { gap: 16 },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: { width: 100, height: 100 },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  imagePlaceholderText: { fontSize: 10, color: Colors.gray },
  recipeInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  recipeName: { fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  recipeDescription: { fontSize: 13, color: Colors.gray, lineHeight: 18, marginBottom: 4 },
  recipeDate: { fontSize: 11, color: Colors.lightGray },
  actions: { flexDirection: 'column', justifyContent: 'center' },
  actionBtn: { padding: 12, justifyContent: 'center', alignItems: 'center' },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: Colors.dark, marginHorizontal: 8 },
  heroImage: { width: '100%', height: 240 },
  heroPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20 },
  recipeName: { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 },
  recipeDescription: { fontSize: 15, color: Colors.gray, lineHeight: 22, marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, color: Colors.dark, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: Colors.dark, lineHeight: 22, paddingTop: 3 },
  createdAt: { fontSize: 12, color: Colors.lightGray, marginTop: 8 },
});