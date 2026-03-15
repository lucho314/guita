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
import { getEmergencyFundAnalysis } from '@/services/analytics';
import { EmergencyFundAnalysis } from '@/types/database';
import { formatCurrency } from '@/utils/format';

const MIN_MONTHS = 3;

function DataProgress({ current, total }: { current: number; total: number }) {
  return (
    <View style={progress.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            progress.dot,
            i < current ? progress.dotFilled : progress.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const progress = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  dot: { width: 32, height: 8, borderRadius: 4 },
  dotFilled: { backgroundColor: Colors.dark.accent },
  dotEmpty: { backgroundColor: Colors.dark.surface2 },
});

interface LevelCardProps {
  label: string;
  months: number;
  amount: number;
  highlighted?: boolean;
  description: string;
}

function LevelCard({ label, months, amount, highlighted, description }: LevelCardProps) {
  return (
    <View style={[level.card, highlighted && level.cardHighlighted]}>
      {highlighted && (
        <View style={level.recommendedBadge}>
          <Text style={level.recommendedText}>Recomendado</Text>
        </View>
      )}
      <Text style={[level.label, highlighted && level.labelHighlighted]}>{label}</Text>
      <Text style={[level.amount, highlighted && level.amountHighlighted]}>
        {formatCurrency(amount)}
      </Text>
      <Text style={level.months}>{months} meses de gastos</Text>
      <Text style={level.desc}>{description}</Text>
    </View>
  );
}

const level = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 16,
    gap: 4,
  },
  cardHighlighted: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.accent + '11',
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dark.accent + '33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  recommendedText: { fontSize: 11, fontWeight: '700', color: Colors.dark.accent },
  label: { fontSize: 14, fontWeight: '700', color: Colors.dark.textSecondary },
  labelHighlighted: { color: Colors.dark.accentLight },
  amount: { fontSize: 26, fontWeight: '800', color: Colors.dark.text, marginVertical: 2 },
  amountHighlighted: { color: Colors.dark.accent },
  months: { fontSize: 12, color: Colors.dark.muted },
  desc: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, lineHeight: 18 },
});

export default function EmergencyFundScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<EmergencyFundAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    getEmergencyFundAnalysis(user.id)
      .then(setData)
      .catch(() => setError('No se pudo cargar el análisis'))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.title}>Fondo de emergencia</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !data ? null : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Info card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="shield" size={28} color={Colors.dark.accent} />
            <Text style={styles.infoText}>
              Un fondo de emergencia te protege ante imprevistos sin endeudarte.
              Se calcula en base a tu promedio mensual de gastos.
            </Text>
          </View>

          {/* Sin datos suficientes */}
          {!data.hasEnoughData ? (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataTitle}>Necesitamos más historial</Text>
              <Text style={styles.noDataSub}>
                Con {MIN_MONTHS} meses de gastos registrados podemos calcular un fondo preciso.
              </Text>
              <DataProgress current={data.monthsOfData} total={MIN_MONTHS} />
              <Text style={styles.noDataCounter}>
                {data.monthsOfData} de {MIN_MONTHS} meses registrados
              </Text>
              {data.monthsOfData > 0 && (
                <Text style={styles.noDataHint}>
                  Seguí registrando tus gastos. ¡Ya falta{data.monthsNeeded > 1 ? 'n' : ''}{' '}
                  {data.monthsNeeded} mes{data.monthsNeeded !== 1 ? 'es' : ''}!
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Promedio mensual */}
              <View style={styles.avgCard}>
                <Text style={styles.avgLabel}>Promedio mensual de gastos</Text>
                <Text style={styles.avgAmount}>
                  {formatCurrency(data.averageMonthlyExpenses)}
                </Text>
                <Text style={styles.avgSub}>
                  Basado en {data.monthsOfData} mes{data.monthsOfData !== 1 ? 'es' : ''} de historial
                  {data.monthsOfData < 6 && ' · estimación parcial'}
                </Text>
              </View>

              {/* Niveles */}
              <Text style={styles.sectionLabel}>¿Cuánto deberías tener?</Text>
              <View style={styles.levels}>
                <LevelCard
                  label="Mínimo"
                  months={3}
                  amount={data.minimum}
                  description="Cubre emergencias básicas de corto plazo."
                />
                <LevelCard
                  label="Recomendado"
                  months={6}
                  amount={data.recommended}
                  highlighted
                  description="El estándar financiero para la mayoría de las personas."
                />
                <LevelCard
                  label="Máximo"
                  months={12}
                  amount={data.maximum}
                  description="Ideal si sos autónomo o tenés ingresos variables."
                />
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface2,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.dark.danger, fontSize: 15 },
  infoCard: {
    backgroundColor: Colors.dark.accent + '11',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.dark.accent + '33',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 19,
  },
  noDataCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  noDataTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  noDataSub: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  noDataCounter: { fontSize: 13, color: Colors.dark.muted },
  noDataHint: {
    fontSize: 13,
    color: Colors.dark.accent,
    textAlign: 'center',
    marginTop: 4,
  },
  avgCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  avgLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  avgAmount: { fontSize: 32, fontWeight: '800', color: Colors.dark.text },
  avgSub: { fontSize: 12, color: Colors.dark.muted },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.dark.textSecondary },
  levels: { gap: 10 },
});
