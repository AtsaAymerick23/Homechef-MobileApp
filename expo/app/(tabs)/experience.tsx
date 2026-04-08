import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Users, ChefHat } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useCookingStore } from '@/stores/cookingStore';

function HistoryCard({ item }: { item: typeof useCookingStore extends (...args: any[]) => infer R ? (R extends { history: infer H } ? H extends Array<infer I> ? I : never : never) : never }) {
  const cookedDate = new Date(item.cookedAt);
  const formattedDate = cookedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.historyCard}>
      <Image source={{ uri: item.mealImage }} style={styles.historyImage} />
      <View style={styles.historyContent}>
        <Text style={styles.historyMealName}>{item.mealName}</Text>
        <Text style={styles.historyDate}>{formattedDate}</Text>
        <View style={styles.historyStats}>
          <View style={styles.stat}>
            <Users size={14} color={Colors.primary} />
            <Text style={styles.statText}>{item.peopleCount} people</Text>
          </View>
          <View style={styles.stat}>
            <Clock size={14} color={Colors.primary} />
            <Text style={styles.statText}>{item.totalTime} min</Text>
          </View>
        </View>
        <View style={styles.costBadge}>
          <Text style={styles.costText}>{item.totalCost.toLocaleString()} FCFA</Text>
        </View>
      </View>
    </View>
  );
}

export default function ExperienceScreen() {
  const { history } = useCookingStore();

  const totalCooked = history.length;
  const totalSpent = history.reduce((sum, item) => sum + item.totalCost, 0);
  const totalTime = history.reduce((sum, item) => sum + item.totalTime, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.headerTitle}>My Experience</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ChefHat size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{totalCooked}</Text>
            <Text style={styles.statLabel}>Meals Cooked</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{Math.round(totalTime / 60)}h</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.currencyIcon}>₣</Text>
            <Text style={styles.statNumber}>{(totalSpent / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>FCFA Spent</Text>
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking History</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <ChefHat size={48} color={Colors.lightGray} />
              <Text style={styles.emptyTitle}>No Cooking History</Text>
              <Text style={styles.emptyText}>
                Start cooking meals to track your culinary journey!
              </Text>
            </View>
          ) : (
            history.map((item) => <HistoryCard key={item.id} item={item} />)
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  currencyIcon: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyImage: {
    width: 100,
    height: 100,
  },
  historyContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  historyMealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.gray,
  },
  costBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  costText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
