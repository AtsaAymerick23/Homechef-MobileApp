import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, X, Camera, Save } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useCookingStore } from '@/stores/cookingStore';
import { useAuthStore } from '@/stores/authStore';

export default function NewRecipeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addUserRecipe } = useCookingStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [images, setImages] = useState<string[]>([]);

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleAddImage = () => {
    // In a real app, this would open an image picker
    // For now, we'll use a placeholder
    if (images.length < 2) {
      setImages([
        ...images,
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
      ]);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 2 images');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.trim());
    const validInstructions = instructions.filter((i) => i.trim());

    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    if (validInstructions.length === 0) {
      Alert.alert('Error', 'Please add at least one instruction');
      return;
    }

    addUserRecipe({
      id: Date.now().toString(),
      userId: user?.id || 'guest',
      name: name.trim(),
      description: description.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'],
      ingredients: validIngredients,
      instructions: validInstructions,
      createdAt: new Date().toISOString(),
    });

    Alert.alert('Success', 'Recipe created successfully!', [
      { text: 'OK', onPress: () => router.push('/(tabs)/recipes') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipe Images (Max 2)</Text>
            <View style={styles.imagesContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 2 && (
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                  <Camera size={24} color={Colors.gray} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipe Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipe Name"
              placeholderTextColor={Colors.gray}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={Colors.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={styles.listInput}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor={Colors.gray}
                  value={ingredient}
                  onChangeText={(value) => updateIngredient(index, value)}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <X size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[styles.listInput, styles.instructionInput]}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor={Colors.gray}
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  multiline
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeInstruction(index)}
                >
                  <X size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Step</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.dark,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionInput: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
    marginBottom: 40,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
