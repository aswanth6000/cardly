import { Image, StyleSheet, View } from 'react-native';

import { T, useTheme } from '@cardly/ui';

/**
 * Card-network mark.
 *
 * Uses a branded image from `assets/cards/` when present (visa.png,
 * mastercard.png, amex.png, rupay.png, discover.png) and falls back to a
 * minimal typographic/geometric glyph with a single brand accent dot — so
 * the card still reads its network even before images are added.
 *
 * Unknown networks render a neutral dot.
 */

const NETWORK_ACCENTS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  rupay: '',
  discover: '',
};

const NETWORK_LABELS: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  rupay: 'RPAY',
  discover: 'DISC',
};

/** Image assets keyed by network. Missing files fall back to the glyph. */
const NETWORK_IMAGES: Record<string, number> = {
  visa: require('@/assets/cards/visa.png'),
  mastercard: require('@/assets/cards/mastercard.png'),
  amex: require('@/assets/cards/amex.png'),
  rupay: require('@/assets/cards/rupay.png'),
  discover: require('@/assets/cards/discover.png'),
};

export function NetworkMark({ network, size = 'sm' }: { network?: string; size?: 'sm' | 'lg' }) {
  const theme = useTheme();
  const accent = NETWORK_ACCENTS[network ?? ''] ?? '';
  const label = NETWORK_LABELS[network ?? ''] ?? '';
  const lg = size === 'lg';

  // Branded image path when the asset exists.
  const asset = NETWORK_IMAGES[network ?? ''];
  if (asset) {
    return <Image source={asset} style={[styles.img, lg && styles.imgLg]} resizeMode="contain" accessibilityLabel={label || network} />;
  }

  if (network === 'mastercard' && !lg) {
    // The signature mark: two overlapping circles in brand colors.
    return (
      <View style={styles.mcWrap}>
        <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
        <View style={[styles.mcCircle, styles.mcCircleRight, { backgroundColor: '#F79E1B' }]} />
      </View>
    );
  }

  return (
    <View style={[styles.mark, lg && styles.markLg]}>
      {accent ? <View style={[styles.dot, { backgroundColor: accent }, lg && styles.dotLg]} /> : null}
      {label ? (
        <T variant="caption" color="tertiary" style={[styles.label, lg && styles.labelLg, !accent && { letterSpacing: 1 }]}>
          {label}
        </T>
      ) : (
        <View style={[styles.dot, { backgroundColor: theme.textTertiary }, lg && styles.dotLg]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  markLg: { gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotLg: { width: 8, height: 8, borderRadius: 4 },
  label: { letterSpacing: 0.5, fontWeight: '600' },
  labelLg: { fontSize: 13, letterSpacing: 1 },
  img: { width: 40, height: 22 },
  imgLg: { width: 56, height: 30 },
  mcWrap: { flexDirection: 'row', width: 28 },
  mcCircle: { width: 14, height: 14, borderRadius: 7, opacity: 0.85 },
  mcCircleRight: { marginLeft: -7 },
});
