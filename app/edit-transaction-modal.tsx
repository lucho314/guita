import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from '@/components/ui/category-grid';
import { DatePickerModal } from '@/components/ui/date-picker-modal';
import { NumericKeypad } from '@/components/ui/numeric-keypad';
import { Colors } from '@/constants/theme';
import { useTransactionStore } from '@/store/transaction-store';
import { TransactionType } from '@/types/database';
import { getCategoriesByType } from '@/utils/categories';
import { formatDate, toISODate } from '@/utils/format';

export default function EditTransactionModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, allTransactions, editTransaction } = useTransactionStore();

  const transaction = [...transactions, ...allTransactions].find((t) => t.id === id);

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amountStr, setAmountStr] = useState(String(transaction?.amount ?? '0'));
  const [categoryId, setCategoryId] = useState<string | null>(transaction?.category_id ?? null);
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [date, setDate] = useState(transaction?.transaction_date ?? toISODate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = getCategoriesByType(type);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Transacción no encontrada</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function handleDigit(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmountStr((prev) => {
      if (prev === '0') return key;
      if (prev.length >= 10) return prev;
      return prev + key;
    });
  }

  function handleDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmountStr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }

  function handleDecimal() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmountStr((prev) => (prev.includes('.') ? prev : prev + '.'));
  }

  async function handleSave() {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    setIsSubmitting(true);
    try {
      await editTransaction(transaction.id, {
        amount,
        category_id: categoryId,
        description: description || null,
        transaction_date: date,
        type,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar los cambios');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.title}>Editar transacción</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Type Selector */}
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
            onPress={() => { setType('expense'); setCategoryId(null); }}
          >
            <Text style={[styles.typeLabel, type === 'expense' && styles.typeLabelActive]}>
              Gasto
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
            onPress={() => { setType('income'); setCategoryId(null); }}
          >
            <Text style={[styles.typeLabel, type === 'income' && styles.typeLabelActive]}>
              Ingreso
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Display */}
          <View style={styles.amountSection}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountText}>
              {amountStr === '0' ? '0.00' : amountStr}
            </Text>
          </View>

          {/* Keypad */}
          <View style={styles.keypadContainer}>
            <NumericKeypad
              onPress={handleDigit}
              onDelete={handleDelete}
              onDecimal={handleDecimal}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <CategoryGrid
              categories={categories}
              selectedId={categoryId}
              onSelect={(c) => {
                setCategoryId(c.id);
                Haptics.selectionAsync();
              }}
              numColumns={4}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fecha</Text>
            <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={18} color={Colors.dark.accent} />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.dark.muted} />
            </Pressable>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nota (opcional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Agregar descripción..."
              placeholderTextColor={Colors.dark.muted}
              value={description}
              onChangeText={setDescription}
              maxLength={100}
              multiline
            />
          </View>

          {/* Save */}
          <Button
            label="Guardar cambios"
            onPress={handleSave}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        value={date}
        onConfirm={(d) => { setDate(d); setShowDatePicker(false); }}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  flex: { flex: 1 },
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  typeRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.dark.danger,
  },
  typeBtnActiveIncome: {
    backgroundColor: Colors.dark.income,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  typeLabelActive: {
    color: '#fff',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    lineHeight: 48,
  },
  amountText: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  keypadContainer: {
    marginBottom: 24,
  },
  section: {
    gap: 12,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark.text,
    minHeight: 60,
  },
  saveButton: {
    marginTop: 8,
  },
});
