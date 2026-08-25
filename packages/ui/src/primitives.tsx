import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme-context';
import { displayFont, displayFontBold, fontSize, fontWeight, spacing } from './theme';

export function Screen({ children, padded }: { children: React.ReactNode; padded?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }, padded && styles.padded]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  padded: { paddingHorizontal: spacing.md },
});

type TextVariant = 'hero' | 'title' | 'bodyLarge' | 'body' | 'caption' | 'secondary' | 'tertiary' | 'display' | 'displayBold';

export function T({
  variant = 'body',
  color,
  children,
  style,
  numberOfLines,
}: {
  variant?: TextVariant;
  color?: 'text' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  style?: Text['props']['style'];
  numberOfLines?: number;
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
    <Text style={[base, colorStyle, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

const textStyles = StyleSheet.create({
  hero: { fontSize: fontSize.hero, fontWeight: fontWeight.bold, fontFamily: displayFontBold },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, fontFamily: displayFontBold },
  bodyLarge: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular },
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  display: { fontFamily: displayFont, fontWeight: fontWeight.semibold, fontSize: fontSize.bodyLarge },
  displayBold: { fontFamily: displayFontBold, fontWeight: fontWeight.bold, fontSize: fontSize.bodyLarge },
});
