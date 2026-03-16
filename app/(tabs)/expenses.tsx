import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { router } from 'expo-router';

dayjs.extend(isToday);
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
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
  const isToday = dayjs().format('YYYY-MM-DD') === title;
  const label = isToday
    ? 'Hoy'
    : dayjs(title).format('dddd, D [de] MMMM');

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

export default function ExpensesScreen() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [query, setQuery] = useState('');

  const { transactions, isLoading, refresh, monthlyTotals } = useTransactions(month);

  const monthLabel = dayjs(month).format('MMMM YYYY');
  const isCurrentMonth = month === dayjs().format('YYYY-MM');

  function prevMonth() {
    setQuery('');
    setMonth((m) => dayjs(m).subtract(1, 'month').format('YYYY-MM'));
  }

  function nextMonth() {
    setQuery('');
    setMonth((m) => dayjs(m).add(1, 'month').format('YYYY-MM'));
  }

  // Filter by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const category = t.category ?? getCategoryById(t.category_id);
      return (
        category?.label.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    });
  }, [transactions, query]);

  // Totals based on filtered results
  const filteredTotals = useMemo(() => {
    const q = query.trim();
    if (!q) return monthlyTotals;
    return filtered.reduce(
      (acc, t) => ({
        income: acc.income + (t.type === 'income' ? t.amount : 0),
        expenses: acc.expenses + (t.type === 'expense' ? t.amount : 0),
        balance: 0,
      }),
      { income: 0, expenses: 0, balance: 0 },
    );
  }, [filtered, query, monthlyTotals]);

  // Group into sections
  const sections = useMemo(() => {
    const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
      const key = t.transaction_date.substring(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});
    return Object.entries(grouped)
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([date, data]) => ({ title: date, data }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>

        {/* Month selector */}
        <View style={styles.monthRow}>
          <Pressable onPress={prevMonth} style={styles.monthArrow}>
            <MaterialIcons name="chevron-left" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            onPress={nextMonth}
            style={[styles.monthArrow, isCurrentMonth && styles.monthArrowDisabled]}
            disabled={isCurrentMonth}
          >
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isCurrentMonth ? Colors.dark.border : Colors.dark.text}
            />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.headerStats}>
          <View>
            <Text style={styles.statLabel}>Gastos</Text>
            <Text style={[styles.statAmount, { color: Colors.dark.expense }]}>
              {formatCurrency(filteredTotals.expenses)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View>
            <Text style={styles.statLabel}>Ingresos</Text>
            <Text style={[styles.statAmount, { color: Colors.dark.income }]}>
              {formatCurrency(filteredTotals.income)}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={18} color={Colors.dark.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por categoría o descripción..."
            placeholderTextColor={Colors.dark.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={16} color={Colors.dark.muted} />
            </Pressable>
          )}
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
              title={query ? 'Sin resultados' : 'Sin transacciones'}
              description={
                query
                  ? `No hay movimientos que coincidan con "${query}"`
                  : 'Agrega tu primera transacción con el botón + en la barra de navegación'
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refresh()}
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
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowDisabled: {
    opacity: 0.3,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    textTransform: 'capitalize',
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    padding: 0,
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
