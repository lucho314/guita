import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { signInWithGoogle } from '@/services/auth';

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setError(null);
      setIsSubmitting(true);
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión con Google');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>$</Text>
          </View>
          <Text style={styles.kicker}>Finanzas App</Text>
          <Text style={styles.title}>Accede con tu cuenta de Google</Text>
          <Text style={styles.subtitle}>
            Simplificamos el acceso para que entres mas rapido y con menos friccion.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>G</Text>
            </View>
            <Text style={styles.cardTitle}>Inicio de sesion unificado</Text>
          </View>

          <Text style={styles.cardText}>
            Ya no usamos correo y contrasena. Tu cuenta se crea o se recupera automaticamente con Google.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Button
            label="Continuar con Google"
            onPress={handleGoogleSignIn}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />

          <Text style={styles.helperText}>
            Usa el mismo correo de Google que vas a ocupar para sincronizar tus datos.
          </Text>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿Primera vez en la app? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.registerLink}>Te contamos como funciona</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
  },
  kicker: {
    color: Colors.dark.accentLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  googleBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadgeText: {
    color: '#DB4437',
    fontSize: 22,
    fontWeight: '700',
  },
  cardTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardText: {
    color: Colors.dark.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: Colors.dark.danger + '20',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.danger,
  },
  errorBannerText: {
    color: Colors.dark.danger,
    fontSize: 14,
  },
  submitButton: {
    marginBottom: 14,
  },
  helperText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 22,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  registerText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.dark.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
