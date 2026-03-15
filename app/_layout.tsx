import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { onAuthStateChange } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { setSession, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transaction-modal"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="create-budget"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="create-goal"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="transaction-detail"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="budget-detail"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="goal-detail"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {!isAuthenticated && <Redirect href="/(auth)/login" />}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
