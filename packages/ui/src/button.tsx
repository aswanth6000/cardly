import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme-context';
import { radius, spacing } from './theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: View['props']['style'];
}) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.accent
      : variant === 'secondary'
        ? theme.backgroundElevated
        : variant === 'danger'
          ? theme.danger
          : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.accentText
      : variant === 'secondary'
        ? theme.text
        : variant === 'danger'
          ? '#FFFFFF'
          : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        (pressed || disabled) && styles.pressed,
        disabled && { opacity: 0.5 },
        style,
      ]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 52,
  },
  label: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
