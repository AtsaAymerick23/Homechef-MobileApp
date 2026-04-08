import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments, useRootNavigationState, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (!isMounted || !navigationState?.key) return;
    
    if (!isLoading) {
      SplashScreen.hideAsync();
      const inAuthGroup = segments[0] === '(auth)';
      
      if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isMounted, isLoading, isAuthenticated, navigationState?.key, segments]);

  if (!isMounted || !navigationState?.key) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="meal/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="meal/cook" 
        options={{ 
          headerShown: true,
          title: 'Cook This',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
        }} 
      />
      <Stack.Screen 
        name="recipe/new" 
        options={{ 
          headerShown: true,
          title: 'New Recipe',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
