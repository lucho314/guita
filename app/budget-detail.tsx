import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/theme';
import { useBudgets } from '@/hooks/use-budgets';
import { BudgetCategory } from '@/types/database';
import { formatCurrency } from '@/utils/format';

export default function BudgetDetailScreen() {
  const { budgetCategoryId } = useLocalSearchParams<{ budgetCategoryId: string }>();
  const { currentBudget, updateCategoryLimit } = useBudgets();

  const bc = (currentBudget?.budget_categories ?? []).find(
    (c): c is BudgetCategory & { spent?: number } => c.id === budgetCategoryId
  );

  const [newLimit, setNewLimit] = useState(bc?.amount_limit?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  if (!bc) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Categoría no encontrada</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const spent = (bc as any).spent ?? 0;
  const progress = bc.amount_limit > 0 ? spent / bc.amount_limit : 0;

  async function handleSave() {
    const limit = parseFloat(newLimit);
    if (!limit || limit <= 0) {
      Alert.alert('Error', 'Ingresa un límite válido');
      return;
    }
    setIsSaving(true);
    try {
      await updateCategoryLimit(bc!.id, limit);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el límite');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.title}>{bc.category?.label ?? 'Categoría'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Gastado</Text>
              <Text style={[styles.statValue, { color: Colors.dark.expense }]}>
                {formatCurrency(spent)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Límite</Text>
              <Text style={styles.statValue}>{formatCurrency(bc.amount_limit)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Restante</Text>
              <Text style={[styles.statValue, { color: Colors.dark.income }]}>
                {formatCurrency(Math.max(bc.amount_limit - spent, 0))}
              </Text>
            </View>
          </View>
          <ProgressBar progress={progress} height={8} />
        </View>

        <View style={styles.editSection}>
          <Text style={styles.editLabel}>Cambiar límite</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.dark.muted}
            keyboardType="decimal-pad"
            value={newLimit}
            onChangeText={setNewLimit}
          />
          <Button
            label="Guardar límite"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFound: { color: Colors.dark.text, fontSize: 16 },
  back: { color: Colors.dark.accent, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  content: { flex: 1, paddingHorizontal: 20, gap: 24, paddingTop: 8 },
  statsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 16,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 12, color: Colors.dark.textSecondary },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  editSection: { gap: 12 },
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
});
