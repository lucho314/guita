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
import { getSpendingLeaks } from '@/services/analytics';
import { SpendingLeak, LeakType, LeakSeverity } from '@/types/database';
import { formatCurrency } from '@/utils/format';

const LEAK_TYPE_CONFIG: Record<LeakType, { label: string; icon: string; color: string; description: string }> = {
  recurring: {
    label: 'Gastos recurrentes',
    icon: 'autorenew',
    color: '#F59E0B',
    description: 'Categorías con gastos constantes todos los meses.',
  },
  spike: {
    label: 'Categorías disparadas',
    icon: 'trending-up',
    color: '#EF4444',
    description: 'Gastaste significativamente más que tu promedio este mes.',
  },
  'small-frequent': {
    label: 'Gastos pequeños frecuentes',
    icon: 'coffee',
    color: '#8B5CF6',
    description: 'Muchas compras pequeñas que suman bastante.',
  },
};

const SEVERITY_CONFIG: Record<LeakSeverity, { label: string; color: string }> = {
  high: { label: 'Alta', color: Colors.dark.danger },
  medium: { label: 'Media', color: Colors.dark.warning },
  low: { label: 'Baja', color: Colors.dark.success },
};

function LeakItem({ leak }: { leak: SpendingLeak }) {
  const severity = SEVERITY_CONFIG[leak.severity];
  return (
    <View style={item.row}>
      <View style={[item.icon, { backgroundColor: leak.categoryColor + '22' }]}>
        <MaterialIcons name={leak.categoryIcon as any} size={20} color={leak.categoryColor} />
      </View>
      <View style={item.body}>
        <Text style={item.label}>{leak.categoryLabel}</Text>
        <Text style={item.detail}>{leak.detail}</Text>
      </View>
      <View style={item.right}>
        <Text style={item.amount}>{formatCurrency(leak.monthlyAmount)}</Text>
        <View style={[item.severityBadge, { backgroundColor: severity.color + '22' }]}>
          <Text style={[item.severityText, { color: severity.color }]}>{severity.label}</Text>
        </View>
      </View>
    </View>
  );
}

const item = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  detail: { fontSize: 12, color: Colors.dark.textSecondary },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  severityText: { fontSize: 10, fontWeight: '700' },
});

function SectionCard({ type, leaks }: { type: LeakType; leaks: SpendingLeak[] }) {
  const config = LEAK_TYPE_CONFIG[type];
  const total = leaks.reduce((s, l) => s + l.monthlyAmount, 0);

  return (
    <View style={section.card}>
      <View style={section.header}>
        <View style={[section.iconWrap, { backgroundColor: config.color + '22' }]}>
          <MaterialIcons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={section.headerBody}>
          <Text style={section.title}>{config.label}</Text>
          <Text style={section.desc}>{config.description}</Text>
        </View>
        <Text style={[section.total, { color: config.color }]}>{formatCurrency(total)}</Text>
      </View>
      <View style={section.divider} />
      {leaks.map((leak) => (
        <LeakItem key={`${leak.type}-${leak.categoryId}`} leak={leak} />
      ))}
    </View>
  );
}

const section = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 2 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.dark.text },
  desc: { fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 16 },
  total: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: 8 },
});

export default function SpendingLeaksScreen() {
  const { user } = useAuth();
  const [leaks, setLeaks] = useState<SpendingLeak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    getSpendingLeaks(user.id)
      .then(setLeaks)
      .catch(() => setError('No se pudo cargar el análisis'))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const leaksByType = (type: LeakType) => leaks.filter((l) => l.type === type);
  const types: LeakType[] = ['spike', 'recurring', 'small-frequent'];
  const activeSections = types.filter((t) => leaksByType(t).length > 0);
  const totalLeak = leaks.reduce((s, l) => s + l.monthlyAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.title}>Fugas de dinero</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {leaks.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="check-circle" size={48} color={Colors.dark.success} />
              <Text style={styles.emptyTitle}>Sin fugas detectadas</Text>
              <Text style={styles.emptySub}>
                Tus patrones de gasto se ven saludables este mes. ¡Seguí así!
              </Text>
            </View>
          ) : (
            <>
              {/* Resumen */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total de fugas estimadas</Text>
                  <Text style={styles.summaryAmount}>{formatCurrency(totalLeak)}/mes</Text>
                </View>
                <View style={styles.severityRow}>
                  {(['high', 'medium', 'low'] as LeakSeverity[]).map((s) => {
                    const count = leaks.filter((l) => l.severity === s).length;
                    if (count === 0) return null;
                    const cfg = SEVERITY_CONFIG[s];
                    return (
                      <View key={s} style={[styles.severityChip, { backgroundColor: cfg.color + '22' }]}>
                        <View style={[styles.severityDot, { backgroundColor: cfg.color }]} />
                        <Text style={[styles.severityChipText, { color: cfg.color }]}>
                          {count} {cfg.label.toLowerCase()}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Secciones por tipo */}
              {activeSections.map((type) => (
                <SectionCard key={type} type={type} leaks={leaksByType(type)} />
              ))}
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
  emptyCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  emptySub: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  summaryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  summaryAmount: { fontSize: 18, fontWeight: '800', color: Colors.dark.danger },
  severityRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  severityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityChipText: { fontSize: 12, fontWeight: '600' },
});
