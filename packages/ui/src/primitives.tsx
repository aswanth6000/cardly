import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from './theme-context';
import {
  borderWidth,
  displayFont,
  displayFontBold,
  fontMedium,
  fontRegular,
  fontSize,
  fontWeight,
  hardShadow,
  radius,
  spacing,
  tabularNums,
} from './theme';

export function Screen({ children, padded }: { children: React.ReactNode; padded?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }, padded && styles.padded]}>{children}</View>
  );
}

type SurfaceTone = 'default' | 'accent' | 'subtle';

export function Surface({
  children,
  style,
  contentStyle,
  tone = 'default',
  shadow = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
  shadow?: boolean;
}) {
  const theme = useTheme();
  const backgroundColor =
    tone === 'accent' ? theme.surfaceAccent : tone === 'subtle' ? theme.backgroundElevated : theme.surface;

  return (
    <View style={[styles.surfaceWrap, shadow && styles.surfaceWrapWithShadow, style]}>
      {shadow ? <View pointerEvents="none" style={[styles.surfaceShadow, { backgroundColor: theme.hardShadow }]} /> : null}
      <View style={[styles.surface, { backgroundColor, borderColor: theme.outline }, contentStyle]}>{children}</View>
    </View>
  );
}

export function Section({
  children,
  style,
  contentStyle,
  tone,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
}) {
  return (
    <Surface style={style} contentStyle={[styles.section, contentStyle]} tone={tone}>
      {children}
    </Surface>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  style,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional icon rendered to the left of the title. */
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pageHeader, style]}>
      <View style={styles.pageHeaderCopy}>
        {eyebrow ? <T variant="label">{eyebrow}</T> : null}
        <View style={styles.pageHeaderTitleRow}>
          {icon ? <View style={styles.pageHeaderIcon}>{icon}</View> : null}
          <T variant="hero">{title}</T>
        </View>
        {description ? (
          <T variant="body" color="secondary" style={styles.pageHeaderDescription}>
            {description}
          </T>
        ) : null}
      </View>
      {action ? <View style={styles.pageHeaderAction}>{action}</View> : null}
    </View>
  );
}

export function ListRow({
  label,
  detail,
  action,
  onPress,
  danger = false,
  icon,
  style,
}: {
  label: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
  danger?: boolean;
  /** Optional icon rendered to the left. */
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const content = (
    <View style={[styles.listRow, { borderColor: theme.outline, backgroundColor: theme.surface }, style]}>
      {icon ? <View style={styles.listRowIcon}>{icon}</View> : null}
      <View style={styles.listRowCopy}>
        <T variant="bodyLarge" style={danger ? { color: theme.danger } : undefined}>
          {label}
        </T>
        {detail ? (
          <T variant="caption" color="secondary" numberOfLines={2}>
            {detail}
          </T>
        ) : null}
      </View>
      {action ? (
        <T variant="label" style={danger ? { color: theme.danger } : undefined}>
          {action}
        </T>
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={detail}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.listRowPressed}>
      {content}
    </Pressable>
  );
}

export function FeedbackBanner({
  children,
  tone = 'info',
  style,
}: {
  children: React.ReactNode;
  tone?: 'info' | 'success' | 'error';
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const palette =
    tone === 'error'
      ? { backgroundColor: theme.dangerSurface, color: theme.dangerText }
      : tone === 'success'
        ? { backgroundColor: theme.lime, color: theme.limeText }
        : { backgroundColor: theme.yellow, color: theme.yellowText };

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.feedback, { backgroundColor: palette.backgroundColor, borderColor: theme.outline }, style]}>
      <T variant="caption" style={{ color: palette.color }}>
        {children}
      </T>
    </View>
  );
}

/* ── Chip ─────────────────────────────────────────────────────────────── */

export function Chip({
  children,
  tone = 'default',
  style,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'muted';
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const bg =
    tone === 'accent'
      ? theme.chipBackground
      : tone === 'muted'
        ? theme.backgroundElevated
        : theme.surface;
  const border = tone === 'muted' ? theme.divider : theme.outline;

  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }, style]}>
      <T variant="label" style={tone === 'accent' ? { color: theme.yellowText } : undefined}>
        {children}
      </T>
    </View>
  );
}

/* ── IconButton ──────────────────────────────────────────────────────── */

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 40,
  style,
}: {
  icon: React.ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderColor: theme.outline,
          backgroundColor: theme.surface,
        },
        pressed && styles.iconButtonPressed,
        pressed && { backgroundColor: theme.pressedOverlay },
        style,
      ]}>
      {icon}
    </Pressable>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────── */

export function Skeleton({
  width,
  height,
  borderRadiusValue = radius.md,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadiusValue?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmerX.value * 0.25,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadiusValue,
          backgroundColor: theme.divider,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

/* ── Divider ─────────────────────────────────────────────────────────── */

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.divider }, style]} />;
}

/* ── SectionHeader ───────────────────────────────────────────────────── */

export function SectionHeader({
  icon,
  label,
  style,
}: {
  icon?: React.ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      {icon ? <View style={styles.sectionHeaderIcon}>{icon}</View> : null}
      <T variant="label">{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  padded: { paddingHorizontal: spacing.md },
  surfaceWrap: { width: '100%' },
  surfaceWrapWithShadow: { paddingRight: hardShadow.x, paddingBottom: hardShadow.y },
  surfaceShadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
  },
  surface: {
    width: '100%',
    borderWidth: borderWidth.standard,
    borderRadius: radius.lg,
  },
  section: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  pageHeaderCopy: { flex: 1, gap: spacing.xs },
  pageHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pageHeaderIcon: { marginRight: 2 },
  pageHeaderDescription: { lineHeight: 22, maxWidth: 440 },
  pageHeaderAction: { paddingTop: spacing.xs },
  listRow: {
    minHeight: 64,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.standard,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  listRowIcon: { marginRight: 2 },
  listRowCopy: { flex: 1, gap: spacing.xs },
  listRowPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  feedback: {
    borderWidth: borderWidth.standard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    alignSelf: 'flex-start',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.standard,
    borderRadius: radius.md,
  },
  iconButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
  divider: {
    height: 1,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeaderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type TextVariant =
  | 'hero'
  | 'title'
  | 'bodyLarge'
  | 'body'
  | 'caption'
  | 'label'
  | 'secondary'
  | 'tertiary'
  | 'display'
  | 'displayBold';

export function T({
  variant = 'body',
  color,
  children,
  style,
  numberOfLines,
  accessibilityLabel,
  accessibilityLiveRegion,
}: {
  variant?: TextVariant;
  color?: 'text' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  style?: Text['props']['style'];
  numberOfLines?: number;
  accessibilityLabel?: Text['props']['accessibilityLabel'];
  accessibilityLiveRegion?: Text['props']['accessibilityLiveRegion'];
}) {
  const theme = useTheme();
  const base =
    variant === 'hero'
      ? textStyles.hero
      : variant === 'title'
        ? textStyles.title
        : variant === 'bodyLarge'
          ? textStyles.bodyLarge
          : variant === 'body'
            ? textStyles.body
            : variant === 'caption'
              ? textStyles.caption
              : variant === 'label'
                ? textStyles.label
                : variant === 'secondary'
                  ? textStyles.body
                  : variant === 'tertiary'
                    ? textStyles.caption
                    : variant === 'display'
                      ? textStyles.display
                      : textStyles.displayBold;
  const colorStyle =
    color === 'secondary'
      ? { color: theme.textSecondary }
      : color === 'tertiary'
        ? { color: theme.textTertiary }
        : variant === 'secondary' || variant === 'tertiary'
          ? { color: theme.textSecondary }
          : { color: theme.text };
  return (
    <Text
      style={[base, colorStyle, style]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={accessibilityLiveRegion}>
      {children}
    </Text>
  );
}

const textStyles = StyleSheet.create({
  hero: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    fontFamily: displayFontBold,
    letterSpacing: -0.8,
    lineHeight: 39,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    fontFamily: displayFont,
    letterSpacing: -0.4,
  },
  bodyLarge: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium, fontFamily: fontMedium },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular, fontFamily: fontRegular },
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.medium, fontFamily: fontMedium },
  label: {
    fontSize: fontSize.label,
    lineHeight: 14,
    fontWeight: fontWeight.bold,
    fontFamily: displayFontBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  display: {
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.semibold,
    fontFamily: displayFont,
  },
  displayBold: {
    fontSize: 22,
    fontWeight: fontWeight.semibold,
    fontFamily: displayFont,
    ...(tabularNums as object),
  },
});
