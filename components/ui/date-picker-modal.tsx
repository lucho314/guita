import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/theme';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PAD = Math.floor(VISIBLE_ITEMS / 2); // 2

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function range(start: number, end: number): number[] {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

interface WheelPickerProps {
  items: (string | number)[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

function WheelPicker({ items, selectedIndex, onIndexChange }: WheelPickerProps) {
  const ref = useRef<ScrollView>(null);
  const [displayIndex, setDisplayIndex] = useState(selectedIndex);
  const isUserScrolling = useRef(false);
  const isFirstRender = useRef(true);

  // Scroll to position when selectedIndex changes from parent (e.g. day clamping)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setTimeout(() => {
        ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
      }, 50);
      return;
    }
    if (isUserScrolling.current) return;
    setDisplayIndex(selectedIndex);
    ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
  }, [selectedIndex]);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), items.length - 1));
    setDisplayIndex(index);
    onIndexChange(index);
    setTimeout(() => { isUserScrolling.current = false; }, 100);
  }

  return (
    <View style={styles.wheel}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <ScrollView
        ref={ref}
        style={styles.wheelScroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => { isUserScrolling.current = true; }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PAD * ITEM_HEIGHT }}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <View key={String(item)} style={styles.wheelItem}>
            <Text style={[styles.wheelText, index === displayIndex && styles.wheelTextSelected]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export function DatePickerModal({ visible, value, onConfirm, onClose }: DatePickerModalProps) {
  const parsed = dayjs(value);
  const [year, setYear] = useState(parsed.year());
  const [month, setMonth] = useState(parsed.month()); // 0-indexed
  const [day, setDay] = useState(parsed.date() - 1); // 0-indexed for picker

  const currentYear = dayjs().year();
  const years = range(currentYear - 5, currentYear + 1);
  const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  const days = range(1, daysInMonth);

  // Clamp day index when month/year changes
  useEffect(() => {
    if (day >= daysInMonth) setDay(daysInMonth - 1);
  }, [daysInMonth]);

  // Reset state when modal opens with a new value
  useEffect(() => {
    if (visible) {
      const p = dayjs(value);
      setYear(p.year());
      setMonth(p.month());
      setDay(p.date() - 1);
    }
  }, [visible]);

  function handleConfirm() {
    const d = day + 1;
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onConfirm(date);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Pressable onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <View style={styles.sheetTitleRow}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.sheetTitle}>Fecha</Text>
          </View>
          <Pressable onPress={handleConfirm} style={styles.headerBtn}>
            <Text style={styles.confirmText}>Listo</Text>
          </Pressable>
        </View>

        {/* Column labels */}
        <View style={styles.columnLabels}>
          <Text style={styles.columnLabel}>Día</Text>
          <Text style={styles.columnLabel}>Mes</Text>
          <Text style={styles.columnLabel}>Año</Text>
        </View>

        {/* Pickers */}
        <View style={styles.pickersRow}>
          <WheelPicker
            items={days}
            selectedIndex={day}
            onIndexChange={setDay}
          />
          <WheelPicker
            items={MONTHS}
            selectedIndex={month}
            onIndexChange={setMonth}
          />
          <WheelPicker
            items={years}
            selectedIndex={years.indexOf(year)}
            onIndexChange={(i) => setYear(years[i])}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 72,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.accent,
    textAlign: 'right',
  },
  columnLabels: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  columnLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickersRow: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheel: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * PAD,
    left: 6,
    right: 6,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.dark.surface2,
    borderRadius: 8,
    zIndex: 0,
  },
  wheelScroll: {
    zIndex: 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  wheelTextSelected: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
});
