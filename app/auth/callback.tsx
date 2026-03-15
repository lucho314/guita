import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallbackScreen() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.dark.accent} />
      <Text style={styles.text}>Completando acceso con Google...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
  },
  text: {
    marginTop: 16,
    color: Colors.dark.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
