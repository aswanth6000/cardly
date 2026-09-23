import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Skeleton, borderWidth, hardShadow, radius, spacing, useTheme } from '@cardly/ui';

const CARD_RATIO = 1.586;

/**
 * Shimmering skeleton placeholder in card shape.
 * Displayed while the vault is hydrating.
 */
export function SkeletonCard({ compact }: { compact?: boolean }) {
  const theme = useTheme();

  return (
    <View style={[styles.scene, compact && styles.sceneCompact]}>
      <View pointerEvents="none" style={[styles.shadow, { backgroundColor: theme.hardShadow }]} />
      <View style={[styles.card, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Skeleton width={80} height={12} />
            <Skeleton width={44} height={16} />
          </View>
          <View style={styles.chipRow}>
            <Skeleton width={36} height={28} borderRadiusValue={radius.sm} />
          </View>
          <View style={styles.bottom}>
            <Skeleton width={140} height={18} />
            <Skeleton width={180} height={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    paddingRight: hardShadow.x,
    paddingBottom: hardShadow.y,
  },
  sceneCompact: {
    width: 228,
    alignSelf: 'center',
  },
  shadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
  },
  card: {
    aspectRatio: CARD_RATIO,
    borderRadius: radius.card,
    overflow: 'hidden',
    width: '100%',
    borderWidth: borderWidth.standard,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottom: {
    gap: spacing.xs,
  },
});
