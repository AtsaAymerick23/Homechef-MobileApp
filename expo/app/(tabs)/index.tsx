import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { meals, foodFacts, restaurantPartners, type Meal } from '@/constants/meals';
import { useAuthStore } from '@/stores/authStore';

const { width } = Dimensions.get('window');

function MealCard({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: meal.image }} style={styles.mealImage} />
      <View style={styles.mealOverlay}>
        <View style={styles.mealContent}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.mealMeta}>
            <Text style={styles.mealRegion}>{meal.region}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{meal.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.mealDescription} numberOfLines={2}>
            {meal.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FeaturedMeal({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.95}>
      <Image source={{ uri: meal.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredBadge}>
          <Star size={14} color={Colors.accent} fill={Colors.accent} />
          <Text style={styles.featuredBadgeText}>Recipe of the Day</Text>
        </View>
        <Text style={styles.featuredName}>{meal.name}</Text>
        <Text style={styles.featuredDescription} numberOfLines={2}>
          {meal.description}
        </Text>
        <TouchableOpacity style={styles.viewRecipeButton} onPress={onPress}>
          <Text style={styles.viewRecipeText}>View Full Recipe</Text>
          <ChevronRight size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [randomFact] = useState(() => foodFacts[Math.floor(Math.random() * foodFacts.length)]);

  const featuredMeal = useMemo(() => meals.find((m) => m.isFeatured) || meals[0], []);

  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return meals;
    const query = searchQuery.toLowerCase();
    return meals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(query) ||
        meal.region.toLowerCase().includes(query) ||
        meal.category.toLowerCase().includes(query) ||
        meal.difficulty.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleMealPress = (mealId: string) => {
    router.push(`/meal/${mealId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoHome}>Home</Text>
            <Text style={styles.logoChef}>Chef</Text>
          </View>
          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, region, or difficulty..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Text style={styles.username}>{user?.username || 'Guest'}</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Welcome to HomeChef</Text>
            <Text style={styles.heroSubtitle}>
              Discover the rich flavors of Cameroonian cuisine
            </Text>
          </View>
        </View>

        {/* Recipe of the Day */}
        <View style={styles.section}>
          <FeaturedMeal meal={featuredMeal} onPress={() => handleMealPress(featuredMeal.id)} />
        </View>

        {/* Did You Know */}
        <View style={styles.factCard}>
          <Text style={styles.factLabel}>Did You Know?</Text>
          <Text style={styles.factText}>{randomFact}</Text>
        </View>

        {/* Meal Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Popular Dishes'}
          </Text>
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => handleMealPress(meal.id)}
            />
          ))}
        </View>

        {/* Restaurant Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Restaurants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.partnersScroll}>
            {restaurantPartners.map((partner) => (
              <View key={partner.id} style={styles.partnerCard}>
                <Image source={{ uri: partner.image }} style={styles.partnerImage} />
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.partnerLocation}>{partner.location}</Text>
                  <Text style={styles.partnerDesc} numberOfLines={2}>
                    {partner.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
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
    gap: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoHome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.logoHome,
  },
  logoChef: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.logoChef,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
  username: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'right',
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.lightGray,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
    backgroundColor: Colors.dark,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  featuredBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  featuredName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: Colors.lightGray,
    marginBottom: 16,
  },
  viewRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 4,
  },
  viewRecipeText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  factCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  factText: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  mealCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    marginBottom: 16,
    backgroundColor: Colors.dark,
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  mealContent: {
    padding: 16,
  },
  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  mealRegion: {
    fontSize: 13,
    color: Colors.lightGray,
  },
  difficultyBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  mealDescription: {
    fontSize: 13,
    color: Colors.lightGray,
    lineHeight: 18,
  },
  partnersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  partnerCard: {
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerImage: {
    width: '100%',
    height: 100,
  },
  partnerInfo: {
    padding: 12,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  partnerLocation: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  partnerDesc: {
    fontSize: 11,
    color: Colors.gray,
    lineHeight: 16,
  },
});
