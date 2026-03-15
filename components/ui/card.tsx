import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default', ...rest }: CardProps) {
  return (
    <View style={[styles.card, variant === 'elevated' && styles.elevated, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
