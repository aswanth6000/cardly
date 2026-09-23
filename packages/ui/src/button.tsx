import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme-context';
import { borderWidth, displayFont, hardShadow, radius, spacing } from './theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  style?: View['props']['style'];
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const ghost = variant === 'ghost';
  const isDisabled = disabled || loading;
  const sm = size === 'sm';
  const backgroundColor =
    variant === 'primary'
      ? theme.purple
      : variant === 'secondary'
        ? theme.surface
        : variant === 'danger'
          ? theme.dangerSurface
          : 'transparent';
  const color =
    variant === 'primary'
      ? theme.purpleText
      : variant === 'secondary'
        ? theme.text
        : variant === 'danger'
          ? theme.dangerText
          : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(isDisabled) }}
      disabled={isDisabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.wrap, !ghost && styles.wrapWithShadow, style]}>
      {({ pressed }) => (
        <>
          {!ghost ? (
            <View
              pointerEvents="none"
              style={[
                styles.shadow,
                { backgroundColor: theme.hardShadow },
                pressed && !isDisabled && styles.shadowPressed,
              ]}
            />
          ) : null}
          <View
            style={[
              styles.base,
              sm && styles.baseSm,
              { backgroundColor, borderColor: theme.outline },
              ghost && styles.ghost,
              ghost && sm && styles.ghostSm,
              focused && styles.focused,
              pressed && !isDisabled && styles.pressed,
              pressed && !isDisabled && !ghost && { backgroundColor: adjustBrightness(backgroundColor, -0.06) },
              isDisabled && { backgroundColor: ghost ? 'transparent' : theme.disabledSurface, borderColor: theme.divider },
            ]}>
            {loading ? (
              <ActivityIndicator size="small" color={isDisabled ? theme.disabledText : color} style={styles.spinner} />
            ) : null}
            {icon && !loading ? <View style={styles.iconWrap}>{icon}</View> : null}
            <Text
              style={[
                styles.label,
                sm && styles.labelSm,
                { color },
                isDisabled && { color: theme.disabledText },
                loading && { opacity: 0.6 },
              ]}>
              {label}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

/** Darken/lighten a hex color for pressed state feedback. */
function adjustBrightness(hex: string, amount: number): string {
  if (hex === 'transparent') return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return hex;
  const num = parseInt(h, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * amount)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  wrapWithShadow: { paddingRight: hardShadow.x, paddingBottom: hardShadow.y },
  shadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
  },
  shadowPressed: { opacity: 0 },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 52,
    borderWidth: borderWidth.standard,
    gap: spacing.sm,
  },
  baseSm: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  label: { fontSize: 16, fontWeight: '600', fontFamily: displayFont },
  labelSm: { fontSize: 14 },
  ghost: {
    borderWidth: 0,
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  ghostSm: {
    minHeight: 36,
  },
  focused: { borderWidth: borderWidth.heavy },
  pressed: { transform: [{ translateX: hardShadow.x }, { translateY: hardShadow.y }] },
  spinner: { marginRight: 2 },
  iconWrap: { marginRight: 2 },
});
