import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { signInWithGoogle } from '@/services/auth';

const benefits = [
  'Creas tu cuenta con un solo toque.',
  'Recuperas acceso sin recordar contrasenas.',
  'Tu perfil queda listo con los datos de Google.',
];

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setError(null);
      setIsSubmitting(true);
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al continuar con Google');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Nueva experiencia de acceso</Text>
          <Text style={styles.title}>Tu cuenta se crea con Google</Text>
          <Text style={styles.subtitle}>
            Eliminamos el registro con correo y contrasena para hacer el acceso mas simple y seguro.
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.googleRow}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <View style={styles.googleCopy}>
              <Text style={styles.googleTitle}>Cuenta unica con Google</Text>
              <Text style={styles.googleDescription}>
                Si ya habias entrado con ese correo, recuperas tu acceso. Si no, tu cuenta se crea en ese momento.
              </Text>
            </View>
          </View>

          <View style={styles.benefits}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Button
            label="Crear o recuperar con Google"
            onPress={handleGoogleSignIn}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya viste la pantalla principal? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.loginLink}>Volver al acceso</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    color: Colors.dark.accentLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.dark.textSecondary,
  },
  panel: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  googleRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  googleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#DB4437',
    fontSize: 24,
    fontWeight: '700',
  },
  googleCopy: {
    flex: 1,
  },
  googleTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  googleDescription: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  benefits: {
    gap: 14,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.accent,
  },
  benefitText: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: Colors.dark.danger + '20',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.danger,
  },
  errorBannerText: { color: Colors.dark.danger, fontSize: 14 },
  submitButton: { marginBottom: 22 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  loginText: { color: Colors.dark.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.dark.accent, fontSize: 14, fontWeight: '600' },
});
