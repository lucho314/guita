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
import { useGoals } from '@/hooks/use-goals';
import { toISODate } from '@/utils/format';

const GOAL_ICONS = [
  { id: 'home', label: 'Casa' },
  { id: 'directions-car', label: 'Auto' },
  { id: 'flight', label: 'Viaje' },
  { id: 'school', label: 'Educación' },
  { id: 'devices', label: 'Tecnología' },
  { id: 'savings', label: 'Ahorro' },
  { id: 'favorite', label: 'Otro' },
  { id: 'flag', label: 'Meta' },
];

const GOAL_COLORS = [
  '#6C63FF', '#22C55E', '#EF4444', '#F59E0B',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
];

export default function CreateGoalScreen() {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState(GOAL_ICONS[0].id);
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addGoal } = useGoals();

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Error', 'Ingresa un título para la meta');
      return;
    }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) {
      Alert.alert('Error', 'Ingresa un monto objetivo válido');
      return;
    }

    setIsSubmitting(true);
    try {
      await addGoal({
        title: title.trim(),
        target_amount: target,
        current_amount: parseFloat(currentAmount) || 0,
        target_date: targetDate ? toISODate(targetDate) : null,
        icon,
        color,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo crear la meta');
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
        <Text style={styles.title}>Nueva meta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Vacaciones en Europa"
            placeholderTextColor={Colors.dark.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Monto objetivo</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.dark.muted}
            keyboardType="decimal-pad"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ya tengo ahorrado (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.dark.muted}
            keyboardType="decimal-pad"
            value={currentAmount}
            onChangeText={setCurrentAmount}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fecha objetivo (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.dark.muted}
            value={targetDate}
            onChangeText={setTargetDate}
            maxLength={10}
          />
        </View>

        {/* Icon Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ícono</Text>
          <View style={styles.iconGrid}>
            {GOAL_ICONS.map((ic) => (
              <Pressable
                key={ic.id}
                style={[styles.iconBtn, icon === ic.id && { borderColor: color, backgroundColor: color + '22' }]}
                onPress={() => setIcon(ic.id)}
              >
                <MaterialIcons name={ic.id as any} size={24} color={icon === ic.id ? color : Colors.dark.textSecondary} />
                <Text style={[styles.iconLabel, { color: icon === ic.id ? color : Colors.dark.textSecondary }]}>
                  {ic.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorRow}>
            {GOAL_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSelected]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <Button
          label="Crear meta"
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
    fontSize: 15,
    color: Colors.dark.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBtn: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  iconLabel: { fontSize: 10, fontWeight: '500' },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
});
