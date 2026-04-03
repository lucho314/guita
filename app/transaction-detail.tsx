import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
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
import { useTransactionStore } from '@/store/transaction-store';
import { getCategoryById } from '@/utils/categories';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, allTransactions, editTransaction, removeTransaction } =
    useTransactionStore();

  const transaction = [...transactions, ...allTransactions].find((t) => t.id === id);

  const [description, setDescription] = useState(transaction?.description ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const category = transaction.category ?? getCategoryById(transaction.category_id);
  const isIncome = transaction.type === 'income';

  async function handleSaveNote() {
    setIsEditing(true);
    try {
      await editTransaction(transaction!.id, { description });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsEditing(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removeTransaction(transaction!.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/edit-transaction-modal', params: { id: transaction.id } })}
          style={styles.backBtn}
        >
          <MaterialIcons name="edit" size={20} color={Colors.dark.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Amount + Category */}
        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, { backgroundColor: (category?.color ?? '#6B7280') + '22' }]}
          >
            <MaterialIcons
              name={(category?.icon as any) ?? 'receipt'}
              size={36}
              color={category?.color ?? '#6B7280'}
            />
          </View>
          <Text style={[styles.heroAmount, { color: isIncome ? Colors.dark.income : Colors.dark.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.heroCategory}>{category?.label ?? 'Sin categoría'}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <DetailRow label="Tipo" value={isIncome ? 'Ingreso' : 'Gasto'} />
          <DetailRow label="Fecha" value={formatDate(transaction.transaction_date)} />
          <DetailRow
            label="Creado"
            value={formatDate(transaction.created_at, 'D MMM YYYY, HH:mm')}
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nota</Text>
          <TextInput
            style={styles.noteInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Agregar nota..."
            placeholderTextColor={Colors.dark.muted}
            multiline
            maxLength={200}
          />
          {description !== (transaction.description ?? '') && (
            <Button
              label="Guardar nota"
              variant="secondary"
              onPress={handleSaveNote}
              loading={isEditing}
              fullWidth
            />
          )}
        </View>

        {/* Delete */}
        <Button
          label="Eliminar transacción"
          variant="danger"
          onPress={handleDelete}
          loading={isDeleting}
          fullWidth
          style={styles.deleteButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.text },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroAmount: { fontSize: 36, fontWeight: '800' },
  heroCategory: { fontSize: 16, color: Colors.dark.textSecondary, fontWeight: '500' },
  detailsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailLabel: { fontSize: 14, color: Colors.dark.textSecondary },
  detailValue: { fontSize: 14, color: Colors.dark.text, fontWeight: '500' },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    minHeight: 80,
  },
  deleteButton: { marginTop: 8 },
});
