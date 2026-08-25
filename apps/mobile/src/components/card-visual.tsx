import { Pressable, StyleSheet, View } from 'react-native';

import { T, radius, spacing, useTheme } from '@cardly/ui';

export function CardVisual({
  nickname,
  issuer,
  network,
  last4,
  onPress,
}: {
  nickname: string;
  issuer?: string;
  network?: string;
  last4: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const content = (
    <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
      <View style={styles.topRow}>
        <T variant="bodyLarge" numberOfLines={1} style={styles.nickname}>
          {nickname}
        </T>
        <T variant="caption" color="tertiary">
          {network ?? ''}
        </T>
      </View>
      <View style={styles.bottomRow}>
        <T variant="body" color="secondary">
          {issuer ? `${issuer}  ` : ''}
          {'\u2022\u2022\u2022\u2022 '}
          {last4}
        </T>
        <View style={[styles.chip, { backgroundColor: theme.chipBackground }]} />
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xl,
    minHeight: 176,
    justifyContent: 'space-between',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { width: 36, height: 26, borderRadius: radius.sm },
  nickname: { flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
