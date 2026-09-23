import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { T } from './primitives';
import { useTheme } from './theme-context';
import { animation, borderWidth, hardShadow, radius, spacing } from './theme';

export function TextField({
  label,
  error,
  success,
  rightAccessory,
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...inputProps
}: Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  /** When true, shows a success indicator (green border). */
  success?: boolean;
  rightAccessory?: React.ReactNode;
  style?: View['props']['style'];
  inputStyle?: TextInputProps['style'];
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const disabled = inputProps.editable === false;

  // Animated focus ring color
  const focusAnim = useSharedValue(0);
  useEffect(() => {
    focusAnim.value = withTiming(focused ? 1 : 0, { duration: animation.fast.duration });
  }, [focused, focusAnim]);

  const borderColor = error
    ? theme.danger
    : success
      ? theme.success
      : focused
        ? theme.focus
        : theme.outline;

  // Animated border width for focus emphasis
  const animatedWrapStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.standard + focusAnim.value * (borderWidth.heavy - borderWidth.standard),
  }));

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <T variant="label" color="secondary">
          {label}
        </T>
        {error ? (
          <T
            variant="caption"
            style={{ color: theme.danger, flexShrink: 1, textAlign: 'right' }}
            accessibilityLiveRegion="polite">
            {error}
          </T>
        ) : null}
      </View>
      <View style={styles.inputScene}>
        <View pointerEvents="none" style={[styles.fieldShadow, { backgroundColor: theme.hardShadow }]} />
        <Animated.View
          style={[
            styles.inputWrap,
            {
              backgroundColor: disabled ? theme.disabledSurface : theme.surface,
              borderColor,
            },
            animatedWrapStyle,
          ]}>
          <TextInput
            {...inputProps}
            accessibilityLabel={inputProps.accessibilityLabel ?? label}
            accessibilityHint={error ?? inputProps.accessibilityHint}
            accessibilityState={{ disabled }}
            placeholderTextColor={inputProps.placeholderTextColor ?? theme.textTertiary}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              { color: disabled ? theme.disabledText : theme.text },
              rightAccessory ? styles.inputWithAccessory : null,
              inputProps.multiline ? styles.multiline : null,
              inputStyle,
            ]}
          />
          {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
          {/* Success indicator dot */}
          {success && !error && !focused ? (
            <View style={[styles.successDot, { backgroundColor: theme.success }]} />
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputScene: { paddingRight: hardShadow.compact, paddingBottom: hardShadow.compact },
  fieldShadow: {
    position: 'absolute',
    top: hardShadow.compact,
    left: hardShadow.compact,
    right: 0,
    bottom: 0,
  },
  inputWrap: {
    borderWidth: borderWidth.standard,
    borderRadius: radius.md,
    minHeight: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    minHeight: 48,
  },
  inputWithAccessory: { paddingRight: 92 },
  multiline: { minHeight: 72, textAlignVertical: 'top', paddingTop: spacing.md },
  accessory: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  successDot: {
    position: 'absolute',
    right: spacing.sm + 2,
    top: spacing.sm + 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
