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
  Linking,
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

  const isSearching = searchQuery.trim().length > 0;

  const handleMealPress = (mealId: string) => {
    router.push(`/meal/${mealId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.username}>{user?.username || 'Guest'}</Text>
        </View>

        {/* ── Content shown only when NOT searching ── */}
        {!isSearching && (
          <>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Image
                source={{ uri: 'https://i.pinimg.com/736x/c5/27/4b/c5274b49e5f6d5c8bb7dc6666a7e960e.jpg' }}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>Discover Authentic{'\n'}Cameroonian Cuisine</Text>
                <Text style={styles.heroSubtitle}>
                  Explore traditional recipes and learn how to cook delicious{'\n'}meals from the heart of Africa
                </Text>
              </View>
            </View>

            {/* Recipe of the Day */}
            <View style={styles.section}>
              <FeaturedMeal meal={featuredMeal} onPress={() => handleMealPress(featuredMeal.id)} />
            </View>

            {/*  */}
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>?</Text>
              <Text style={styles.factText}>{randomFact}</Text>
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
                      <TouchableOpacity
                        style={styles.learnMoreButton}
                        onPress={() => partner.link && Linking.openURL(partner.link)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.learnMoreText}>Learn More</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* ── Meal list (always visible, adapts to search) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isSearching
              ? `Results for "${searchQuery}" (${filteredMeals.length})`
              : 'Popular Dishes'}
          </Text>

          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => handleMealPress(meal.id)}
              />
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsEmoji}>🍽️</Text>
              <Text style={styles.noResultsTitle}>No dishes found</Text>
              <Text style={styles.noResultsSubtitle}>
                Try searching for a region, ingredient, or difficulty level
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          )}
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
  clearText: {
    fontSize: 16,
    color: Colors.gray,
    paddingHorizontal: 4,
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
    marginBottom: 10,
  },
  learnMoreButton: {
    backgroundColor: '#7b3b22',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  noResultsEmoji: {
    fontSize: 48,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  clearSearchButton: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearSearchText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});