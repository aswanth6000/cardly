import { Pressable, StyleSheet, View } from 'react-native';

import { T, radius, spacing, useTheme } from '@cardly/ui';

import { NetworkMark } from '@/components/network-mark';

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
        <T variant="display" numberOfLines={1} style={styles.nickname}>
          {nickname}
        </T>
        <NetworkMark network={network} />
      </View>
      <View style={styles.bottomRow}>
        <T variant="caption" color="tertiary" style={styles.issuer}>
          {issuer ?? ''}
        </T>
        <T variant="displayBold" style={[styles.last4, { color: theme.text }]}>
          {last4}
        </T>
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
    minHeight: 168,
    justifyContent: 'space-between',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  nickname: { flexShrink: 1, fontSize: 20 },
  issuer: { letterSpacing: 0.3 },
  last4: { fontSize: 24, letterSpacing: 3, fontVariant: ['tabular-nums'] },
  pressed: { opacity: 0.85 },
});
