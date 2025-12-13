import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressProps {
  value: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

export function Progress({
  value,
  height = 8,
  backgroundColor = colors.gray[200],
  fillColor = colors.primary[600],
  style,
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedValue}%`,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
