import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

interface NumericKeypadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  onDecimal?: () => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export function NumericKeypad({ onPress, onDelete, onDecimal }: NumericKeypadProps) {
  function handleKey(key: string) {
    if (key === '⌫') {
      onDelete();
    } else if (key === '.') {
      onDecimal?.();
    } else {
      onPress(key);
    }
  }

  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={() => handleKey(key)}
            >
              <Text style={[styles.keyText, key === '⌫' && styles.deleteText]}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  key: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  keyPressed: {
    backgroundColor: Colors.dark.surface2,
    transform: [{ scale: 0.96 }],
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  deleteText: {
    fontSize: 20,
    color: Colors.dark.textSecondary,
  },
});
