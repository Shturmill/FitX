import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  fullWidth,
}: ButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          style={[styles.button, styles.primaryButton]}
        >
          <Text style={[styles.text, styles.primaryText, textStyle]}>
            {children}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'outline' && styles.outlineButton,
        variant === 'ghost' && styles.ghostButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
          variant === 'ghost' && styles.ghostText,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.gray[700],
  },
  ghostText: {
    color: colors.gray[600],
  },
});
