import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Camera, Edit2, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');

  const handleSave = async () => {
    const { error } = await updateProfile({
      username,
      full_name: fullName,
    });

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
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
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.username || 'Guest'}</Text>
          <Text style={styles.profileEmail}>{user?.full_name || 'HomeChef Member'}</Text>
        </View>

        {/* Edit Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!isEditing ? (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Edit2 size={18} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                  <Check size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setIsEditing(false)}>
                  <X size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={username}
                onChangeText={setUsername}
                editable={isEditing}
                placeholderTextColor={Colors.gray}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={fullName}
                onChangeText={setFullName}
                editable={isEditing}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.gray}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.phone || 'Not provided'}
                editable={false}
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>HomeChef v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 HomeChef Cameroon</Text>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
  },
  inputDisabled: {
    backgroundColor: Colors.background,
    color: Colors.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: Colors.lightGray,
  },
});
