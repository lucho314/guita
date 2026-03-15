import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useBudgets } from '@/hooks/use-budgets';
import { CATEGORIES } from '@/utils/categories';
import { formatCurrency, getCurrentMonth } from '@/utils/format';

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense');

export default function CreateBudgetScreen() {
  const [totalLimit, setTotalLimit] = useState('');
  const [month] = useState(getCurrentMonth());
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addBudget } = useBudgets();

  function handleCategoryLimit(id: string, value: string) {
    setCategoryLimits((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSave() {
    const limit = parseFloat(totalLimit);
    if (!limit || limit <= 0) {
      Alert.alert('Error', 'Ingresa un límite total válido');
      return;
    }

    const catLimits = Object.entries(categoryLimits)
      .filter(([, v]) => v && parseFloat(v) > 0)
      .map(([category_id, v]) => ({ category_id, amount_limit: parseFloat(v) }));

    setIsSubmitting(true);
    try {
      await addBudget(month, limit, catLimits);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo crear el presupuesto');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.title}>Crear presupuesto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Límite total del mes</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.dark.muted}
            keyboardType="decimal-pad"
            value={totalLimit}
            onChangeText={setTotalLimit}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Límites por categoría (opcional)</Text>
          {EXPENSE_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + '33' }]}>
                <MaterialIcons name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <Text style={styles.catName}>{cat.label}</Text>
              <TextInput
                style={styles.catInput}
                placeholder="0"
                placeholderTextColor={Colors.dark.muted}
                keyboardType="decimal-pad"
                value={categoryLimits[cat.id] ?? ''}
                onChangeText={(v) => handleCategoryLimit(cat.id, v)}
              />
            </View>
          ))}
        </View>

        <Button
          label="Crear presupuesto"
          onPress={handleSave}
          loading={isSubmitting}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  section: { gap: 12 },
  sectionLabel: {
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { flex: 1, fontSize: 14, color: Colors.dark.text, fontWeight: '500' },
  catInput: {
    backgroundColor: Colors.dark.surface2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    minWidth: 80,
    textAlign: 'right',
  },
});
