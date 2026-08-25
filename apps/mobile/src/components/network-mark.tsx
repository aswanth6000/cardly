import { StyleSheet, View } from 'react-native';

import { T, useTheme } from '@cardly/ui';

/**
 * Minimal card-network mark.
 *
 * The network mark is the one place Cardly spends color. Each mark is a small
 * typographic/geometric glyph with a single brand-colored accent dot — muted
 * enough to sit quietly on a card, recognizable enough to read at a glance.
 * Unknown networks render a neutral dot.
 */

const NETWORK_ACCENTS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  // RuPay / Discover stay neutral (no single recognizable brand color).
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

export function NetworkMark({ network, size = 'sm' }: { network?: string; size?: 'sm' | 'lg' }) {
  const theme = useTheme();
  const accent = NETWORK_ACCENTS[network ?? ''] ?? '';
  const label = NETWORK_LABELS[network ?? ''] ?? '';
  const lg = size === 'lg';

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
  mcWrap: { flexDirection: 'row', width: 28 },
  mcCircle: { width: 14, height: 14, borderRadius: 7, opacity: 0.85 },
  mcCircleRight: { marginLeft: -7 },
});
