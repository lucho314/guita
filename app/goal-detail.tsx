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
import { CircularGauge } from '@/components/ui/circular-gauge';
import { Colors } from '@/constants/theme';
import { useGoalStore } from '@/store/goal-store';
import { useGoals } from '@/hooks/use-goals';
import { formatCurrency, formatDate } from '@/utils/format';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals } = useGoalStore();
  const { contribute, removeGoal } = useGoals();

  const rawGoal = goals.find((g) => g.id === id);
  const goal = rawGoal
    ? {
        ...rawGoal,
        progress: rawGoal.target_amount > 0 ? rawGoal.current_amount / rawGoal.target_amount : 0,
        remaining: rawGoal.target_amount - rawGoal.current_amount,
        isCompleted: rawGoal.current_amount >= rawGoal.target_amount,
      }
    : null;

  const [contributionStr, setContributionStr] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Meta no encontrada</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handleContribute() {
    const amount = parseFloat(contributionStr);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    setIsContributing(true);
    try {
      await contribute(goal!.id, amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setContributionStr('');
    } catch {
      Alert.alert('Error', 'No se pudo registrar la contribución');
    } finally {
      setIsContributing(false);
    }
  }

  function handleDelete() {
    Alert.alert('Eliminar meta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await removeGoal(goal!.id);
            router.back();
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }

  const pct = Math.min(Math.round(goal.progress * 100), 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <CircularGauge
            progress={goal.progress}
            size={140}
            strokeWidth={12}
            label={`${pct}%`}
            sublabel="completado"
          />
          {goal.isCompleted && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>🎉 ¡Meta alcanzada!</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Ahorrado</Text>
            <Text style={[styles.statValue, { color: Colors.dark.income }]}>
              {formatCurrency(goal.current_amount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Objetivo</Text>
            <Text style={styles.statValue}>{formatCurrency(goal.target_amount)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Faltante</Text>
            <Text style={[styles.statValue, { color: Colors.dark.warning }]}>
              {formatCurrency(Math.max(goal.remaining, 0))}
            </Text>
          </View>
        </View>

        {goal.target_date && (
          <View style={styles.dateRow}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.dateText}>
              Fecha objetivo: {formatDate(goal.target_date, 'D [de] MMMM, YYYY')}
            </Text>
          </View>
        )}

        {/* Contribute */}
        {!goal.isCompleted && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Agregar ahorros</Text>
            <View style={styles.contributionRow}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.dark.muted}
                keyboardType="decimal-pad"
                value={contributionStr}
                onChangeText={setContributionStr}
              />
              <Button
                label="Agregar"
                onPress={handleContribute}
                loading={isContributing}
                style={styles.contributeBtn}
              />
            </View>
          </View>
        )}

        <Button
          label="Eliminar meta"
          variant="danger"
          onPress={handleDelete}
          loading={isDeleting}
          fullWidth
          style={styles.deleteBtn}
        />
      </ScrollView>
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
  title: { fontSize: 18, fontWeight: '700', color: Colors.dark.text, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  hero: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  completedBanner: {
    backgroundColor: Colors.dark.success + '22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  completedText: { color: Colors.dark.success, fontWeight: '700', fontSize: 15 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  stat: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 12, color: Colors.dark.textSecondary },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 12,
  },
  dateText: { fontSize: 14, color: Colors.dark.textSecondary, textTransform: 'capitalize' },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contributionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: {
    flex: 1,
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
  contributeBtn: { minWidth: 100 },
  deleteBtn: { marginTop: 8 },
});
