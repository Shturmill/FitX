import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.green[50], text: colors.green[600] };
      case 'warning':
        return { bg: colors.yellow[50], text: colors.yellow[700] };
      case 'error':
        return { bg: colors.red[50], text: colors.red[500] };
      case 'outline':
        return { bg: 'transparent', text: colors.gray[600] };
      default:
        return { bg: colors.gray[100], text: colors.gray[700] };
    }
  };

  const colorScheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.bg },
        variant === 'outline' && styles.outline,
        style,
      ]}
    >
      <Text style={[styles.text, { color: colorScheme.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
