import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface CircularGaugeProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

function getColor(progress: number): string {
  if (progress >= 1) return Colors.dark.danger;
  if (progress >= 0.8) return Colors.dark.warning;
  return Colors.dark.success;
}

export function CircularGauge({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: CircularGaugeProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const color = getColor(clampedProgress);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.dark.surface2}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {label && <Text style={[styles.label, { color }]}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
