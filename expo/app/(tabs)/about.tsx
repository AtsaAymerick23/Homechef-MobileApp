import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, ChefHat, Globe, BookOpen, Flame, Leaf } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'us' | 'homechef';

// ─── Developer Card ───────────────────────────────────────────────────────────
function DeveloperCard({
  name,
  role,
  image,
  delay = 0,
}: {
  name: string;
  role: string;
  image: any;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.devCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.devImageWrapper}>
        <Image source={image} style={styles.devImage} />
        <View style={styles.devImageRing} />
      </View>
      <View style={styles.devInfo}>
        <Text style={styles.devName}>{name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Info Block ───────────────────────────────────────────────────────────────
function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.infoBlock}>
      <View style={styles.infoIconWrapper}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

// ─── Cuisine Stat ─────────────────────────────────────────────────────────────
function CuisineStat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Regional Badge ───────────────────────────────────────────────────────────
function RegionBadge({ name, flavor }: { name: string; flavor: string }) {
  return (
    <View style={styles.regionBadge}>
      <Text style={styles.regionName}>{name}</Text>
      <Text style={styles.regionFlavor}>{flavor}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('us');
  const indicatorX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    Animated.sequence([
      Animated.timing(contentOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(indicatorX, {
        toValue: tab === 'us' ? 0 : (width - 40) / 2,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab);
      Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.headerSub}>About</Text>
      </View>

      {/* ── Tab Switcher ── */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            { width: (width - 40) / 2, transform: [{ translateX: indicatorX }] },
          ]}
        />
        <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('us')} activeOpacity={0.8}>
          <Users size={15} color={activeTab === 'us' ? Colors.white : Colors.gray} strokeWidth={2} />
          <Text style={[styles.tabLabel, activeTab === 'us' && styles.tabLabelActive]}>
            About Us
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => switchTab('homechef')}
          activeOpacity={0.8}
        >
          <ChefHat
            size={15}
            color={activeTab === 'homechef' ? Colors.white : Colors.gray}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'homechef' && styles.tabLabelActive]}>
            About HomeChef
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <Animated.View style={[styles.contentWrapper, { opacity: contentOpacity }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ══════════════ ABOUT US ══════════════ */}
          {activeTab === 'us' && (
            <>
              {/* Developers */}
              <Text style={styles.sectionHeading}>The Team</Text>
              <DeveloperCard
                name="Yann Aymerick"
                role="Main Developer"
                image={require('@/assets/images/Yann.jpg')}
                delay={0}
              />
              <DeveloperCard
                name="Coralex Joel"
                role="Tester & Product Owner"
                image={require('@/assets/images/Coralex.jpg')}
                delay={120}
              />

              {/* Divider */}
              <View style={styles.divider} />

              {/* Mission blocks */}
              <Text style={styles.sectionHeading}>Our Mission</Text>
              <InfoBlock
                icon={<Flame size={20} color={Colors.accent} strokeWidth={2} />}
                title="What We Do"
                body="HomeChef is dedicated to preserving and promoting Cameroonian culinary traditions by creating a comprehensive digital repository of recipes from all regions of Cameroon."
              />
              <InfoBlock
                icon={<Globe size={20} color={Colors.accent} strokeWidth={2} />}
                title="Who We Serve"
                body="We make traditional Cameroonian cooking accessible to everyone — whether you're a Cameroonian living abroad missing the tastes of home, or someone curious about the rich flavors of Cameroonian cuisine."
              />
              <InfoBlock
                icon={<BookOpen size={20} color={Colors.accent} strokeWidth={2} />}
                title="Cultural Preservation"
                body="We document traditional recipes passed down through generations, preserving cooking methods and ingredients that are central to Cameroonian cultural identity."
              />
              <InfoBlock
                icon={<Leaf size={20} color={Colors.accent} strokeWidth={2} />}
                title="Global Community"
                body="We connect food enthusiasts from around the world who share a passion for Cameroonian cuisine, creating a community where cultural exchange happens through food."
              />
            </>
          )}

          {/* ══════════════ ABOUT HOMECHEF ══════════════ */}
          {activeTab === 'homechef' && (
            <>
              {/* Hero banner */}
              <View style={styles.cuisineHero}>
                <Text style={styles.cuisineHeroTitle}>Cameroonian Cuisine</Text>
                <Text style={styles.cuisineHeroSub}>
                  Africa in Miniature — on your plate
                </Text>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <CuisineStat emoji="" value="250+" label="Ethnic Groups" />
                <CuisineStat emoji="" value="7" label="Regions" />
                <CuisineStat emoji="" label="Ecosystems" value="4+" />
              </View>

              {/* Heritage */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Historical Roots</Text>
                <Text style={styles.cardBody}>
                  Cameroonian food traditions stretch back millennia, rooted in the agricultural
                  and hunting practices of indigenous peoples. Portuguese explorers arrived in the
                  15th century — naming the Wouri River{' '}
                  <Text style={styles.italic}>Rio dos Camarões</Text> ("River of Prawns"), giving
                  Cameroon its very name. Later German, British, and French colonial contact
                  blended new ingredients and techniques with indigenous traditions to form the
                  modern Cameroonian table.
                </Text>
              </View>

              {/* Staples */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Staple Ingredients</Text>
                {[
                  [ 'Plantains', 'Boiled, fried, or pounded — ripe and unripe'],
                  [ 'Cassava (Manioc)', 'Eaten as fufu, bobolo, or bâton de manioc'],
                  [ 'Groundnuts', 'Used extensively in sauces and stews'],
                  [ 'Palm Oil', 'Foundational cooking fat across most of the country'],
                  [ 'Maize', 'Used in porridges and fermented beverages'],
                ].map(([name, desc]) => (
                  <View key={name} style={styles.stapleRow}>
                    <View>
                      <Text style={styles.stapleName}>{name}</Text>
                      <Text style={styles.stapleDesc}>{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Iconic dishes */}
              <Text style={styles.sectionHeading}>Iconic Dishes</Text>
              {[
                {
                  name: 'Ndolé',
                  tag: 'National Dish',
                  desc: 'A rich stew of bitter ndolé leaves, groundnuts, and fish or meat. Born among the Bassa people of the Littoral region.',
                },
                {
                  name: 'Eru',
                  tag: 'Southwest',
                  desc: 'Shredded eru leaves slow-cooked with waterleaf and smoked fish or meat. Deeply tied to Anglophone communities.',
                },
                {
                  name: 'Achu',
                  tag: 'Northwest',
                  desc: 'Pounded yellow cocoyam served with a distinctive yellow palm-nut and limestone soup from the Bamenda highlands.',
                },
                {
                  name: 'Poulet DG',
                  tag: 'Urban Classic',
                  desc: 'Chicken fried with plantains and vegetables in a tomato-based sauce — its name "CEO Chicken" nods to its prestige.',
                },
                {
                  name: 'Koki',
                  tag: 'Festive',
                  desc: 'Steamed black-eyed pea pudding with palm oil and spices, wrapped in banana leaves. A traditional celebration food.',
                },
              ].map((dish) => (
                <View key={dish.name} style={styles.dishCard}>
                  <View style={styles.dishHeader}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    <View style={styles.dishTag}>
                      <Text style={styles.dishTagText}>{dish.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.dishDesc}>{dish.desc}</Text>
                </View>
              ))}

              {/* Regions */}
              <Text style={styles.sectionHeading}>Regional Flavors</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.regionsScroll}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {[
                  { name: 'South & Centre', flavor: 'Palm oil · Wild game · Bitter leaves' },
                  { name: 'Littoral', flavor: 'Seafood · Ndolé · Cosmopolitan' },
                  { name: 'West', flavor: 'Corn dishes · Smoked meats · Tchoukoutou' },
                  { name: 'Northwest', flavor: 'Achu · Fufu corn · Anglophone traditions' },
                  { name: 'Southwest', flavor: 'Eru · Cocoyam · Seafood' },
                  { name: 'Far North', flavor: 'Millet · Sorghum · Grilled meats' },
                ].map((r) => (
                  <RegionBadge key={r.name} name={r.name} flavor={r.flavor} />
                ))}
              </ScrollView>

              {/* Cooking traditions */}
              <View style={[styles.card, { marginBottom: 32 }]}>
                <Text style={styles.cardTitle}>Cooking Traditions</Text>
                <Text style={styles.cardBody}>
                  Wrapping food in banana or plantain leaves for steaming is a signature technique.
                  Slow simmering of stews over wood fire remains common in rural areas, and
                  pounding in large wooden mortars — for fufu and achu — is often a communal
                  activity. Food in Cameroon is deeply social: meals are rarely eaten alone, and
                  cooking for guests in generous quantities is a mark of hospitality and respect.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoContainer: {
    flexDirection: 'row',
  },
  logoHome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.logoHome,
  },
  logoChef: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.logoChef,
  },
  headerSub: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#f0ebe8',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: '100%',
    borderRadius: 11,
    backgroundColor: Colors.primary ?? '#5a2a1a',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray,
  },
  tabLabelActive: {
    color: Colors.white,
  },

  // Content wrapper
  contentWrapper: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 14,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#e8e0db',
    marginVertical: 24,
  },

  // Developer card
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 16,
    shadowColor: '#5a2a1a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  devImageWrapper: {
    position: 'relative',
  },
  devImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e0d5cf',
  },
  devImageRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2.5,
    borderColor: Colors.accent ?? '#c0622a',
  },
  devInfo: {
    flex: 1,
    gap: 8,
  },
  devName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
  },
  rolePill: {
    backgroundColor: '#fdf0ea',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent ?? '#c0622a',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent ?? '#c0622a',
  },

  // Info blocks
  infoBlock: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#5a2a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fdf0ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 19,
  },

  // Cuisine hero
  cuisineHero: {
    backgroundColor: Colors.primary ?? '#5a2a1a',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  cuisineHeroEmoji: { fontSize: 40, marginBottom: 8 },
  cuisineHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  cuisineHeroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#5a2a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statEmoji: { fontSize: 22 },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Generic card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#5a2a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
  },
  italic: { fontStyle: 'italic' },

  // Staples
  stapleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  stapleEmoji: { fontSize: 20, marginTop: 2 },
  stapleName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  stapleDesc: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 17,
  },

  // Dish cards
  dishCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent ?? '#c0622a',
    shadowColor: '#5a2a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  dishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
  },
  dishTag: {
    backgroundColor: '#fdf0ea',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dishTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent ?? '#c0622a',
  },
  dishDesc: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 19,
  },

  // Regions
  regionsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
    marginBottom: 20,
  },
  regionBadge: {
    backgroundColor: Colors.primary ?? '#5a2a1a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    minWidth: 150,
  },
  regionName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  regionFlavor: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
});