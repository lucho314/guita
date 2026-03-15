import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getEmergencyFundAnalysis, getSpendingLeaks } from '@/services/analytics';
import { EmergencyFundAnalysis, SpendingLeak } from '@/types/database';
import { formatCurrency } from '@/utils/format';

export default function AnalysisScreen() {
  const { user } = useAuth();
  const [efData, setEfData] = useState<EmergencyFundAnalysis | null>(null);
  const [leaks, setLeaks] = useState<SpendingLeak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    Promise.all([
      getEmergencyFundAnalysis(user.id),
      getSpendingLeaks(user.id),
    ])
      .then(([ef, lks]) => {
        setEfData(ef);
        setLeaks(lks);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const highLeaks = leaks.filter((l) => l.severity === 'high').length;
  const totalLeakAmount = leaks.reduce((s, l) => s + l.monthlyAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Análisis</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Fondo de emergencia */}
          <Pressable style={styles.card} onPress={() => router.push('/emergency-fund')}>
            <View style={[styles.cardIcon, { backgroundColor: '#6C63FF22' }]}>
              <MaterialIcons name="shield" size={26} color={Colors.dark.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Fondo de emergencia</Text>
              {efData && (
                efData.hasEnoughData ? (
                  <Text style={styles.cardSub}>
                    Recomendado: {formatCurrency(efData.recommended)}
                  </Text>
                ) : (
                  <Text style={[styles.cardSub, { color: Colors.dark.warning }]}>
                    Faltan {efData.monthsNeeded} mes{efData.monthsNeeded !== 1 ? 'es' : ''} de datos
                  </Text>
                )
              )}
            </View>
            <View style={styles.cardChevronCol}>
              {efData?.hasEnoughData && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{efData.monthsOfData} meses</Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={22} color={Colors.dark.muted} />
            </View>
          </Pressable>

          {/* Fugas de dinero */}
          <Pressable style={styles.card} onPress={() => router.push('/spending-leaks')}>
            <View style={[styles.cardIcon, { backgroundColor: '#EF444422' }]}>
              <MaterialIcons name="water-drop" size={26} color={Colors.dark.danger} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Fugas de dinero</Text>
              {leaks.length === 0 ? (
                <Text style={[styles.cardSub, { color: Colors.dark.success }]}>
                  Sin fugas detectadas
                </Text>
              ) : (
                <Text style={styles.cardSub}>
                  {leaks.length} fuga{leaks.length !== 1 ? 's' : ''} · {formatCurrency(totalLeakAmount)}/mes
                </Text>
              )}
            </View>
            <View style={styles.cardChevronCol}>
              {highLeaks > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.dark.danger + '33' }]}>
                  <Text style={[styles.badgeText, { color: Colors.dark.danger }]}>
                    {highLeaks} alta{highLeaks !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={22} color={Colors.dark.muted} />
            </View>
          </Pressable>

          {/* Metas de ahorro */}
          <Pressable style={styles.card} onPress={() => router.push('/(tabs)/goals')}>
            <View style={[styles.cardIcon, { backgroundColor: '#22C55E22' }]}>
              <MaterialIcons name="flag" size={26} color={Colors.dark.success} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Metas de ahorro</Text>
              <Text style={styles.cardSub}>Seguí el progreso de tus objetivos</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.dark.muted} />
          </Pressable>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.dark.text },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  cardSub: { fontSize: 13, color: Colors.dark.textSecondary },
  cardChevronCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: Colors.dark.accent + '33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.dark.accent },
});
