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
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/theme';
import { useGoals } from '@/hooks/use-goals';
import { formatCurrency, formatDate } from '@/utils/format';

export default function GoalsScreen() {
  const { goals, isLoading, refresh } = useGoals();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Metas de ahorro</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/create-goal')}>
          <MaterialIcons name="add" size={22} color={Colors.dark.accent} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.dark.accent} size="large" style={{ marginTop: 40 }} />
      ) : goals.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="flag"
            title="Sin metas"
            description="Crea tu primera meta de ahorro y alcanza tus objetivos financieros"
            action={
              <Button
                label="Nueva meta"
                onPress={() => router.push('/create-goal')}
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
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              style={styles.goalCard}
              onPress={() =>
                router.push({ pathname: '/goal-detail', params: { id: goal.id } })
              }
            >
              <View style={styles.goalHeader}>
                <View
                  style={[
                    styles.goalIcon,
                    { backgroundColor: (goal.color ?? Colors.dark.accent) + '33' },
                  ]}
                >
                  <MaterialIcons
                    name={(goal.icon as any) ?? 'flag'}
                    size={24}
                    color={goal.color ?? Colors.dark.accent}
                  />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  {goal.target_date && (
                    <Text style={styles.goalDate}>
                      Meta: {formatDate(goal.target_date, 'D MMM YYYY')}
                    </Text>
                  )}
                </View>
                {goal.isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completada</Text>
                  </View>
                )}
              </View>

              <View style={styles.goalProgress}>
                <View style={styles.goalAmounts}>
                  <Text style={styles.goalCurrent}>
                    {formatCurrency(goal.current_amount)}
                  </Text>
                  <Text style={styles.goalTarget}>
                    de {formatCurrency(goal.target_amount)}
                  </Text>
                </View>
                <Text style={styles.goalPct}>
                  {Math.min(Math.round(goal.progress * 100), 100)}%
                </Text>
              </View>
              <ProgressBar progress={goal.progress} showThresholdColors={false} height={6} />
            </Pressable>
          ))}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 100, gap: 12, paddingTop: 8 },
  goalCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  goalDate: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  completedBadge: {
    backgroundColor: Colors.dark.success + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  completedText: { fontSize: 11, fontWeight: '600', color: Colors.dark.success },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  goalCurrent: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  goalTarget: { fontSize: 12, color: Colors.dark.textSecondary },
  goalPct: { fontSize: 13, fontWeight: '700', color: Colors.dark.accent },
});
