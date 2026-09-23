import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const NETWORK_IMAGES: Record<string, any> = {
  visa: require('../../assets/cards/visa.png'),
  mastercard: require('../../assets/cards/mastercard.png'),
  amex: require('../../assets/cards/amex.png'),
  'american-express': require('../../assets/cards/amex.png'),
  discover: require('../../assets/cards/discover.png'),
  rupay: require('../../assets/cards/rupay.png'),
};

export interface CardNetworkBadgeProps {
  network?: string;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function normalizeNetwork(net?: string): string {
  if (!net) return 'unknown';
  const clean = net.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('visa')) return 'visa';
  if (clean.includes('master') || clean === 'mc') return 'mastercard';
  if (clean.includes('amex') || clean.includes('americanexpress') || clean.includes('american')) return 'amex';
  if (clean.includes('discover')) return 'discover';
  if (clean.includes('rupay')) return 'rupay';
  return 'unknown';
}

export function CardNetworkBadge({
  network,
  width = 54,
  height = 34,
  style,
  imageStyle,
}: CardNetworkBadgeProps) {
  const norm = normalizeNetwork(network);
  // Default to Visa if network is unknown or empty so a real card variant PNG always appears
  const imageSource = NETWORK_IMAGES[norm] || NETWORK_IMAGES.visa;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[
          styles.badgeImage,
          { width, height },
          imageStyle,
        ]}
        resizeMode="contain"
        accessibilityLabel={`${network ?? 'card'} logo`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    // Preserves aspect ratio with crisp transparency
  },
});
