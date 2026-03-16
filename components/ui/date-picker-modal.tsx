import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { Colors } from '@/constants/theme';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function range(start: number, end: number): number[] {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// Pads list so first/last items can center in the picker
function padList<T>(items: T[]): (T | null)[] {
  const pad = Math.floor(VISIBLE_ITEMS / 2);
  return [...Array(pad).fill(null), ...items, ...Array(pad).fill(null)];
}

interface WheelPickerProps {
  items: (string | number)[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

function WheelPicker({ items, selectedIndex, onIndexChange }: WheelPickerProps) {
  const padded = padList(items);
  const ref = useRef<FlatList>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    // Initial scroll without animation
    setTimeout(() => {
      ref.current?.scrollToIndex({ index: selectedIndex, animated: false });
    }, 0);
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    ref.current?.scrollToIndex({ index: selectedIndex, animated: true });
  }, [selectedIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const center = viewableItems.find((v) => v.item !== null);
      if (center && center.index !== null) {
        const realIndex = center.index - Math.floor(VISIBLE_ITEMS / 2);
        if (realIndex >= 0 && realIndex < items.length) {
          onIndexChange(realIndex);
        }
      }
    },
    [items.length, onIndexChange],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 100, minimumViewTime: 0 });

  return (
    <View style={styles.wheel}>
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={padded}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        renderItem={({ item, index }) => {
          const realIndex = index - Math.floor(VISIBLE_ITEMS / 2);
          const isSelected = realIndex === selectedIndex;
          return (
            <View style={styles.wheelItem}>
              <Text style={[styles.wheelText, isSelected && styles.wheelTextSelected]}>
                {item === null ? '' : item}
              </Text>
            </View>
          );
        }}
      />
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
  const [day, setDay] = useState(parsed.date());

  const currentYear = dayjs().year();
  const years = range(currentYear - 5, currentYear + 1);
  const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  const days = range(1, daysInMonth);

  // Clamp day when month/year changes
  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth]);

  function handleConfirm() {
    const date = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    onConfirm(date.format('YYYY-MM-DD'));
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

        {/* Pickers row */}
        <View style={styles.pickersRow}>
          {/* Day */}
          <WheelPicker
            items={days}
            selectedIndex={day - 1}
            onIndexChange={(i) => setDay(i + 1)}
          />
          {/* Month */}
          <WheelPicker
            items={MONTHS}
            selectedIndex={month}
            onIndexChange={setMonth}
          />
          {/* Year */}
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
    paddingBottom: 32,
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
  pickersRow: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    marginTop: 8,
  },
  wheel: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.dark.surface2,
    borderRadius: 8,
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
