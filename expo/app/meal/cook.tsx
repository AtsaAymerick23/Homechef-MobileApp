import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calculator, Users, Repeat, Clock, ChefHat } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { meals } from '@/constants/meals';
import { useCookingStore } from '@/stores/cookingStore';
import { soundManager } from '@/lib/soundManager';

export default function CookThisScreen() {
  const router = useRouter();
  const { mealId } = useLocalSearchParams();
  const { addToHistory } = useCookingStore();

  const meal = meals.find((m) => m.id === mealId);

  const [peopleCount, setPeopleCount] = useState('4');
  const [timesToEat, setTimesToEat] = useState('1');
  const [calculated, setCalculated] = useState(false);

  // ── Animated value for results section fade-in ────────────────────────────
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(24)).current;

  // ── Switch to cooking ambience on mount, restore kitchen on unmount ────────
  useEffect(() => {
    soundManager.playBackground('cooking');

    return () => {
      // Restore kitchen ambience when navigating back to the detail screen
      soundManager.playBackground('kitchen');
    };
  }, []);

  if (!meal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Meal not found</Text>
      </SafeAreaView>
    );
  }

  const calculateTotals = () => {
    const people = parseInt(peopleCount) || 1;
    const times = parseInt(timesToEat) || 1;
    const totalCost = meal.costPerServing * people * times;
    const totalTime = (meal.prepTime + meal.cookTime) * times;
    return { totalCost, totalTime, people, times };
  };

  const handleCalculate = () => {
    if (!peopleCount || !timesToEat) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // ── Tap sound + animate results in ───────────────────────────────────────
    soundManager.playSFX('button_tap');
    setCalculated(true);

    // Slight delay so the component mounts before animating
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(resultsTranslateY, {
          toValue: 0,
          damping: 14,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);
  };

  const handleConfirm = () => {
    const { totalCost, totalTime, people, times } = calculateTotals();

    addToHistory({
      id: Date.now().toString(),
      mealId: meal.id,
      mealName: meal.name,
      mealImage: meal.image,
      peopleCount: people,
      timesToEat: times,
      totalCost,
      totalTime,
      cookedAt: new Date().toISOString(),
    });

    // ── Success sound fires before the alert ─────────────────────────────────
    soundManager.playSFX('success');

    Alert.alert(
      '🎉 Success!',
      `Your cooking plan for ${meal.name} has been saved!`,
      [{
        text: 'OK',
        onPress: () => {
          // Stop cooking ambience on exit
          soundManager.stopBackground();
          router.push('/(tabs)/experience');
        },
      }]
    );
  };

  const { totalCost, totalTime } = calculateTotals();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>

        {/* Meal Info */}
        <View style={styles.mealCard}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
          <View style={styles.mealMeta}>
            <Text style={styles.mealMetaText}>Base: {meal.servings} servings</Text>
            <Text style={styles.mealMetaText}>•</Text>
            <Text style={styles.mealMetaText}>{meal.costPerServing.toLocaleString()} FCFA/serving</Text>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>My Assistant</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Users size={20} color={Colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Number of People Eating</Text>
              <TextInput
                style={styles.input}
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="number-pad"
                placeholder="4"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Repeat size={20} color={Colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Times to Eat This Meal</Text>
              <TextInput
                style={styles.input}
                value={timesToEat}
                onChangeText={setTimesToEat}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Calculator size={20} color={Colors.white} />
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {/* Results Section — animated fade + slide in */}
        {calculated && (
          <Animated.View
            style={[
              styles.resultsSection,
              { opacity: resultsOpacity, transform: [{ translateY: resultsTranslateY }] },
            ]}
          >
            <Text style={styles.resultsTitle}>Estimated Totals</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultItem}>
                <Clock size={24} color={Colors.primary} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Preparation Time</Text>
                  <Text style={styles.resultValue}>{totalTime} minutes</Text>
                  <Text style={styles.resultSubtext}>
                    ({Math.floor(totalTime / 60)}h {totalTime % 60}m)
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultItem}>
                <Text style={styles.currencyIcon}>₣</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Estimated Cost</Text>
                  <Text style={styles.resultValue}>{totalCost.toLocaleString()} FCFA</Text>
                  <Text style={styles.resultSubtext}>
                    for {peopleCount} people × {timesToEat} time(s)
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <ChefHat size={20} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Add to My Experience</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 20 },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealName: { fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 },
  mealDescription: { fontSize: 14, color: Colors.gray, lineHeight: 20, marginBottom: 12 },
  mealMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  mealMetaText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  inputSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.dark, marginBottom: 16 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inputWrapper: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: { fontSize: 18, fontWeight: '600', color: Colors.dark, padding: 0 },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  calculateButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  resultsSection: { marginBottom: 24 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark, marginBottom: 16 },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  currencyIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    width: 40,
    textAlign: 'center',
  },
  resultInfo: { flex: 1, marginLeft: 16 },
  resultLabel: { fontSize: 13, color: Colors.gray, marginBottom: 4 },
  resultValue: { fontSize: 24, fontWeight: 'bold', color: Colors.dark },
  resultSubtext: { fontSize: 12, color: Colors.gray, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: 8 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  confirmButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});