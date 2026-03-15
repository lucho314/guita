import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { Category } from '@/types/database';

interface CategoryGridProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
  numColumns?: number;
}

function CategoryItem({
  category,
  selected,
  onSelect,
}: {
  category: Category;
  selected: boolean;
  onSelect: (c: Category) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        selected && styles.itemSelected,
        pressed && styles.itemPressed,
      ]}
      onPress={() => onSelect(category)}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: category.color + (selected ? 'FF' : '33') },
        ]}
      >
        <MaterialIcons
          name={category.icon as any}
          size={22}
          color={selected ? '#fff' : category.color}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
        {category.label}
      </Text>
    </Pressable>
  );
}

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  numColumns = 4,
}: CategoryGridProps) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c.id}
      numColumns={numColumns}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <CategoryItem
          category={item}
          selected={selectedId === item.id}
          onSelect={onSelect}
        />
      )}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.grid}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  row: {
    gap: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  itemSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.accent + '15',
  },
  itemPressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  labelSelected: {
    color: Colors.dark.accent,
    fontWeight: '600',
  },
});
