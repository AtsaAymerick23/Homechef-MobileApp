import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { events } from '@/constants/meals';

function EventCard({ event, isUpcoming }: { event: typeof events[0]; isUpcoming: boolean }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.eventCard, !isUpcoming && styles.pastEvent]}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventBadge}>
          <Text style={[styles.eventBadgeText, !isUpcoming && styles.pastEventBadgeText]}>
            {isUpcoming ? 'Upcoming' : 'Past Event'}
          </Text>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaItem}>
            <Calendar size={14} color={Colors.primary} />
            <Text style={styles.eventMetaText}>{formattedDate}</Text>
          </View>
          <View style={styles.eventMetaItem}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.eventMetaText}>{event.location}</Text>
          </View>
        </View>
        <Text style={styles.eventDescription}>{event.description}</Text>
        {isUpcoming && (
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>Learn More</Text>
            <ExternalLink size={14} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const upcomingEvents = events.filter((e) => e.isUpcoming);
  const pastEvents = events.filter((e) => !e.isUpcoming);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHome}>Home</Text>
          <Text style={styles.logoChef}>Chef</Text>
        </View>
        <Text style={styles.headerTitle}>Culinary Events</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} isUpcoming={true} />
          ))}
        </View>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Events</Text>
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isUpcoming={false} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastEvent: {
    opacity: 0.8,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  eventBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  pastEventBadgeText: {
    color: Colors.gray,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: Colors.gray,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 16,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rsvpButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
