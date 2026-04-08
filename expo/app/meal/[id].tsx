import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Clock, Users, ChefHat, MapPin, Flame, Play, Pause } from 'lucide-react-native';
import { Accelerometer } from 'expo-sensors';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '@/constants/colors';
import { meals, type Meal } from '@/constants/meals';

const { width, height } = Dimensions.get('window');

type TabType = 'written' | 'video';

function WrittenRecipe({ meal }: { meal: Meal }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [lastShake, setLastShake] = useState(0);

  useEffect(() => {
    let subscription: any;
    
    const subscribe = async () => {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        
        if (acceleration > 1.8 && now - lastShake > 1000) {
          setLastShake(now);
          setCurrentStep((prev) => 
            prev < meal.instructions.length - 1 ? prev + 1 : prev
          );
        }
      });
    };

    if (Platform.OS !== 'web') {
      subscribe();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [lastShake, meal.instructions.length]);

  return (
    <View style={styles.recipeContainer}>
      <View style={styles.shakeHint}>
        <Text style={styles.shakeHintText}>
          📱 Shake your phone to go to next step
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentStep + 1) / meal.instructions.length) * 100}%` }
          ]} 
        />
      </View>

      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          Step {currentStep + 1} of {meal.instructions.length}
        </Text>
      </View>

      <View style={styles.currentStepCard}>
        <Text style={styles.currentStepNumber}>Step {currentStep + 1}</Text>
        <Text style={styles.currentStepText}>
          {meal.instructions[currentStep]}
        </Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton, 
            currentStep === meal.instructions.length - 1 && styles.navButtonDisabled
          ]}
          onPress={() => setCurrentStep((prev) => 
            Math.min(meal.instructions.length - 1, prev + 1)
          )}
          disabled={currentStep === meal.instructions.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientsTitle}>Ingredients</Text>
        {meal.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientDot} />
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function VideoRecipe({ meal }: { meal: Meal }) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.videoContainer}>
      <View style={styles.videoPlaceholder}>
        <Video
          ref={videoRef}
          source={{ uri: meal.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          isLooping
        />
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause size={32} color={Colors.white} />
          ) : (
            <Play size={32} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>Cooking Tutorial</Text>
        <Text style={styles.videoDescription}>
          Follow along with our step-by-step video guide to make the perfect {meal.name}.
        </Text>
      </View>
    </View>
  );
}

export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('written');
  
  const meal = meals.find((m) => m.id === id);

  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Meal not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{meal.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Image */}
        <Image source={{ uri: meal.image }} style={styles.heroImage} />

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Clock size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{meal.prepTime + meal.cookTime} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Users size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{meal.servings} servings</Text>
            </View>
            <View style={styles.infoItem}>
              <Flame size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{meal.difficulty}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{meal.region} Region</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{meal.description}</Text>
          <Text style={styles.costText}>
            Estimated cost: {meal.costPerServing.toLocaleString()} FCFA per serving
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'written' && styles.activeTab]}
            onPress={() => setActiveTab('written')}
          >
            <ChefHat size={18} color={activeTab === 'written' ? Colors.white : Colors.gray} />
            <Text style={[styles.tabText, activeTab === 'written' && styles.activeTabText]}>
              Written Recipe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'video' && styles.activeTab]}
            onPress={() => setActiveTab('video')}
          >
            <Play size={18} color={activeTab === 'video' ? Colors.white : Colors.gray} />
            <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>
              Video Recipe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'written' ? (
          <WrittenRecipe meal={meal} />
        ) : (
          <VideoRecipe meal={meal} />
        )}

        {/* Cook This Button */}
        <TouchableOpacity 
          style={styles.cookButton}
          onPress={() => router.push({
            pathname: '/meal/cook',
            params: { mealId: meal.id }
          })}
        >
          <ChefHat size={24} color={Colors.white} />
          <Text style={styles.cookButtonText}>Cook This</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  heroImage: {
    width: width,
    height: 250,
  },
  infoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '500',
  },
  descriptionSection: {
    padding: 16,
  },
  description: {
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
    marginBottom: 12,
  },
  costText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray,
  },
  activeTabText: {
    color: Colors.white,
  },
  recipeContainer: {
    paddingHorizontal: 16,
  },
  shakeHint: {
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  shakeHintText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicatorText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  currentStepCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentStepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currentStepText: {
    fontSize: 16,
    color: Colors.dark,
    lineHeight: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  navButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  videoContainer: {
    paddingHorizontal: 16,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: Colors.dark,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(122, 59, 34, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  cookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cookButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
