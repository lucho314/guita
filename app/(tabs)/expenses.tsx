import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { router } from 'expo-router';

dayjs.extend(isToday);
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/theme';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction } from '@/types/database';
import { getCategoryById } from '@/utils/categories';
import { formatCurrency } from '@/utils/format';

function TransactionItem({ item }: { item: Transaction }) {
  const category = item.category ?? getCategoryById(item.category_id);
  const isIncome = item.type === 'income';

  return (
    <Pressable
      style={styles.item}
      onPress={() => router.push({ pathname: '/transaction-detail', params: { id: item.id } })}
    >
      <View style={[styles.icon, { backgroundColor: (category?.color ?? '#6B7280') + '33' }]}>
        <MaterialIcons
          name={(category?.icon as any) ?? 'receipt'}
          size={20}
          color={category?.color ?? '#6B7280'}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.categoryLabel}>{category?.label ?? 'Sin categoría'}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.amount, { color: isIncome ? Colors.dark.income : Colors.dark.expense }]}>
        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const date = dayjs(title);
  const isToday = dayjs().format('YYYY-MM-DD') === title;
  const label = isToday
    ? 'Hoy'
    : date.format('dddd, D [de] MMMM');

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

export default function ExpensesScreen() {
  const { sections, isLoading, refresh, monthlyTotals } = useTransactions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <View style={styles.headerStats}>
          <View>
            <Text style={styles.statLabel}>Gastos</Text>
            <Text style={[styles.statAmount, { color: Colors.dark.expense }]}>
              {formatCurrency(monthlyTotals.expenses)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View>
            <Text style={styles.statLabel}>Ingresos</Text>
            <Text style={[styles.statAmount, { color: Colors.dark.income }]}>
              {formatCurrency(monthlyTotals.income)}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={Colors.dark.accent}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          contentContainerStyle={sections.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-long"
              title="Sin transacciones"
              description="Agrega tu primera transacción con el botón + en la barra de navegación"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={Colors.dark.accent}
            />
          }
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    textTransform: 'capitalize',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  desc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
