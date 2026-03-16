import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTransactions } from '@/hooks/use-transactions';
import { Transaction } from '@/types/database';
import { getCategoryById } from '@/utils/categories';
import { formatCurrency, formatDate, formatMonth } from '@/utils/format';

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const category = transaction.category ?? getCategoryById(transaction.category_id);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      style={styles.txRow}
      onPress={() => router.push({ pathname: '/transaction-detail', params: { id: transaction.id } })}
    >
      <View style={[styles.txIcon, { backgroundColor: (category?.color ?? '#6B7280') + '33' }]}>
        <MaterialIcons
          name={(category?.icon as any) ?? 'receipt'}
          size={20}
          color={category?.color ?? '#6B7280'}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txCategory}>{category?.label ?? 'Sin categoría'}</Text>
        {transaction.description ? (
          <Text style={styles.txDesc} numberOfLines={1}>
            {transaction.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isIncome ? Colors.dark.income : Colors.dark.expense }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.txDate}>
          {formatDate(transaction.transaction_date, 'D MMM')}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, displayName, profile, signOut } = useAuth();
  const { transactions, monthlyTotals, weeklySpending, isLoading, refresh } = useTransactions();

  function handleAvatarPress() {
    Alert.alert(
      displayName,
      user?.email ?? '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: signOut,
        },
      ],
    );
  }

  const currentMonth = formatMonth(new Date());
  const recentTransactions = transactions.slice(0, 5);

  const maxAmount = Math.max(...weeklySpending.map((w) => w.amount), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={Colors.dark.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {displayName} 👋</Text>
            <Text style={styles.monthLabel}>{currentMonth}</Text>
          </View>
          <Pressable onPress={handleAvatarPress}>
            <Avatar name={displayName} uri={profile?.avatar_url} size={42} />
          </Pressable>
        </View>

        {/* Balance Card */}
        <Card variant="elevated" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance del mes</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(monthlyTotals.balance)}
          </Text>
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <View style={styles.totalIconRow}>
                <MaterialIcons name="arrow-downward" size={16} color={Colors.dark.income} />
                <Text style={styles.totalLabel}>Ingresos</Text>
              </View>
              <Text style={[styles.totalAmount, { color: Colors.dark.income }]}>
                {formatCurrency(monthlyTotals.income)}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalItem}>
              <View style={styles.totalIconRow}>
                <MaterialIcons name="arrow-upward" size={16} color={Colors.dark.expense} />
                <Text style={styles.totalLabel}>Gastos</Text>
              </View>
              <Text style={[styles.totalAmount, { color: Colors.dark.expense }]}>
                {formatCurrency(monthlyTotals.expenses)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos de la semana</Text>
          <Card>
            {weeklySpending.length > 0 ? (
              <View style={{ height: 160 }}>
                <View style={styles.chartBars}>
                  {weeklySpending.map((w, i) => (
                    <View key={i} style={styles.chartBarCol}>
                      <View style={styles.chartBarTrack}>
                        <View
                          style={[
                            styles.chartBar,
                            { height: `${Math.round((w.amount / maxAmount) * 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartLabel}>{w.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noChart}>
                <Text style={styles.noChartText}>Sin datos esta semana</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transacciones recientes</Text>
            <Pressable onPress={() => router.push('/(tabs)/expenses')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={Colors.dark.accent} style={{ marginTop: 20 }} />
          ) : recentTransactions.length === 0 ? (
            <Card>
              <EmptyState
                icon="receipt-long"
                title="Sin transacciones"
                description="Agrega tu primera transacción con el botón +"
              />
            </Card>
          ) : (
            <Card style={styles.txCard}>
              {recentTransactions.map((tx, i) => (
                <View key={tx.id}>
                  <TransactionRow transaction={tx} />
                  {i < recentTransactions.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  monthLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.dark.accent,
    borderColor: 'transparent',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalItem: {
    flex: 1,
    gap: 4,
  },
  totalIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.dark.accent,
    fontWeight: '600',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    gap: 6,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBarTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: Colors.dark.accent,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  noChart: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChartText: {
    color: Colors.dark.muted,
    fontSize: 14,
  },
  txCard: { padding: 0, overflow: 'hidden' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  txDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end', gap: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txDate: { fontSize: 11, color: Colors.dark.textSecondary },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 14,
  },
});
