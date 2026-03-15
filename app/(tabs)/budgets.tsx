import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CircularGauge } from '@/components/ui/circular-gauge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/theme';
import { useBudgets } from '@/hooks/use-budgets';
import { BudgetCategory } from '@/types/database';
import { formatCurrency, formatMonth } from '@/utils/format';

export default function BudgetsScreen() {
  const { currentBudget, isLoading, statusLabel, statusColor, refresh } = useBudgets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Presupuesto</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/create-budget')}
        >
          <MaterialIcons name="add" size={22} color={Colors.dark.accent} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={{ marginTop: 40 }} />
      ) : !currentBudget ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="account-balance-wallet"
            title="Sin presupuesto"
            description="Crea un presupuesto mensual para controlar tus gastos"
            action={
              <Button
                label="Crear presupuesto"
                onPress={() => router.push('/create-budget')}
              />
            }
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={Colors.dark.accent}
            />
          }
        >
          {/* Monthly Summary */}
          <Text style={styles.monthLabel}>
            {formatMonth(currentBudget.month + '-01')}
          </Text>

          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryTitle}>Presupuesto total</Text>
                <Text style={styles.summaryTotal}>
                  {formatCurrency(currentBudget.total_limit)}
                </Text>
                <View style={styles.summaryStats}>
                  <Text style={styles.statText}>
                    Gastado:{' '}
                    <Text style={{ color: Colors.dark.expense }}>
                      {formatCurrency(currentBudget.total_spent)}
                    </Text>
                  </Text>
                  <Text style={styles.statText}>
                    Restante:{' '}
                    <Text style={{ color: Colors.dark.income }}>
                      {formatCurrency(currentBudget.total_limit - currentBudget.total_spent)}
                    </Text>
                  </Text>
                </View>
                {statusLabel && (
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                    <Text style={[styles.statusLabel, { color: statusColor ?? Colors.dark.text }]}>
                      {statusLabel}
                    </Text>
                  </View>
                )}
              </View>
              <CircularGauge
                progress={currentBudget.percentage}
                size={110}
                strokeWidth={10}
                label={`${Math.round(currentBudget.percentage * 100)}%`}
                sublabel="usado"
              />
            </View>
            <View style={styles.overallBar}>
              <ProgressBar progress={currentBudget.percentage} height={6} />
            </View>
          </Card>

          {/* Category Breakdown */}
          {(currentBudget.budget_categories ?? []).length > 0 && (
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Por categoría</Text>
              {(currentBudget.budget_categories ?? []).map((bc: BudgetCategory & { spent?: number }) => {
                const spent = bc.spent ?? 0;
                const pct = bc.amount_limit > 0 ? spent / bc.amount_limit : 0;
                return (
                  <Pressable
                    key={bc.id}
                    style={styles.categoryCard}
                    onPress={() =>
                      router.push({
                        pathname: '/budget-detail',
                        params: { budgetCategoryId: bc.id },
                      })
                    }
                  >
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>
                        {bc.category?.label ?? 'Categoría'}
                      </Text>
                      <Text style={styles.categoryAmounts}>
                        {formatCurrency(spent)} / {formatCurrency(bc.amount_limit)}
                      </Text>
                    </View>
                    <ProgressBar progress={pct} height={6} />
                  </Pressable>
                );
              })}
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.dark.text },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrapper: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  monthLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: 'capitalize',
    paddingTop: 8,
  },
  summaryCard: { marginBottom: 24 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLeft: { flex: 1, gap: 4 },
  summaryTitle: { fontSize: 13, color: Colors.dark.textSecondary },
  summaryTotal: { fontSize: 26, fontWeight: '800', color: Colors.dark.text },
  summaryStats: { gap: 2, marginTop: 4 },
  statText: { fontSize: 13, color: Colors.dark.textSecondary },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 8,
  },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  overallBar: { marginTop: 4 },
  categoriesSection: { gap: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  categoryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
  categoryAmounts: { fontSize: 12, color: Colors.dark.textSecondary },
});
