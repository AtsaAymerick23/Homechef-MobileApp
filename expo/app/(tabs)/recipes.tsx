import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useCookingStore } from '@/stores/cookingStore';

export default function MyRecipesScreen() {
  const router = useRouter();
  const { userRecipes, removeUserRecipe } = useCookingStore();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeUserRecipe(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.headerTitle}>My Recipes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/recipe/new')}
          activeOpacity={0.9}
        >
          <Plus size={24} color={Colors.white} />
          <Text style={styles.addButtonText}>Create New Recipe</Text>
        </TouchableOpacity>

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
              <View key={recipe.id} style={styles.recipeCard}>
                <Image
                  source={{
                    uri: recipe.images[0] || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
                  }}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeDescription} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                  <Text style={styles.recipeDate}>
                    Created {new Date(recipe.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(recipe.id, recipe.name)}
                >
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoHome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.logoHome,
  },
  logoChef: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.logoChef,
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
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
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  recipesList: {
    gap: 16,
  },
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
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
    marginBottom: 4,
  },
  recipeDate: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
  },
});
