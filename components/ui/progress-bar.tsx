import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  showThresholdColors?: boolean;
}

function getColor(progress: number): string {
  if (progress >= 1) return Colors.dark.danger;
  if (progress >= 0.8) return Colors.dark.warning;
  return Colors.dark.success;
}

export function ProgressBar({ progress, height = 8, showThresholdColors = true }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const color = showThresholdColors ? getColor(clampedProgress) : Colors.dark.accent;

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.dark.surface2,
    borderRadius: 100,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 100,
  },
});
