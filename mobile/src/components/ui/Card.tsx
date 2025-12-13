import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: string[];
  noPadding?: boolean;
}

export function Card({ children, style, gradient, noPadding }: CardProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, noPadding ? null : styles.padding, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, noPadding ? null : styles.padding, style]}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
}

export function CardHeader({ children }: CardHeaderProps) {
  return <View style={styles.header}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return <View style={[styles.title, style]}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  padding: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
