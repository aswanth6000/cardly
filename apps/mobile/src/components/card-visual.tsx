import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  borderWidth,
  displayFont,
  displayFontBold,
  hardShadow,
  radius,
  spacing,
  tabularNums,
  useTheme,
} from '@cardly/ui';

import { getCardArtwork } from '@/components/card-artwork';
import { CardNetworkBadge } from '@/components/card-network-badge';
import { PressScale } from '@/components/press-scale';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const CARD_RATIO = 1.586;
type CardVisualState = 'default' | 'empty' | 'locked';

export interface CardVisualProps {
  nickname: string;
  issuer?: string;
  network?: string;
  last4?: string;
  cardholderName?: string;
  expiry?: string;
  onPress?: () => void;
  compact?: boolean;
  state?: CardVisualState;
  /** Card ID for hash-based palette assignment. */
  cardId?: string;
}

export function CardVisual({
  nickname,
  issuer,
  network,
  last4,
  cardholderName,
  expiry,
  onPress,
  compact,
  state = 'default',
  cardId,
}: CardVisualProps) {
  const theme = useTheme();
  const art = getCardArtwork(issuer, network, cardId, nickname, last4);
  const isPlaceholder = state !== 'default';

  const issuerLabel = isPlaceholder
    ? 'CARD'
    : (issuer?.trim() || 'VAULT CARD').toUpperCase();

  const displayName = isPlaceholder
    ? state === 'locked'
      ? 'VAULT LOCKED'
      : 'YOUR FIRST CARD'
    : (cardholderName?.trim() || nickname).toUpperCase();

  const formattedNumber =
    state === 'locked'
      ? '••••  ••••  ••••  ••••'
      : state === 'empty'
        ? '••••  ••••  ••••  ••••'
        : last4
          ? `••••  ••••  ••••  ${last4}`
          : '••••  ••••  ••••  ••••';

  const displayExpiry = isPlaceholder
    ? '••/••'
    : (expiry?.trim() || '12/28');

  const card = (
    <View style={[styles.scene, compact && styles.sceneCompact]}>
      {/* Neobrutalist hard shadow with matched rounded corners */}
      <View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            backgroundColor: theme.hardShadow,
            borderRadius: radius.card,
          },
        ]}
      />

      {/* Physical Card Outer Frame */}
      <View
        style={[
          styles.cardOuter,
          {
            borderColor: theme.outline,
            borderRadius: radius.card,
          },
        ]}>
        <LinearGradient
          colors={art.gradientStops}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}>
          {/* Subtle glossy card surface reflection */}
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 0.7 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />

          {/* Animated card shine */}
          <CardShimmer />

          {/* Authentic Credit Card Face Layout */}
          <View style={[styles.inner, compact && styles.innerCompact]}>
            {/* Top Row: Issuer / Bank name on Left, Contactless symbol on Right */}
            <View style={styles.topRow}>
              <View style={styles.issuerRow}>
                <Text
                  style={[styles.issuer, { color: art.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {issuerLabel}
                </Text>
              </View>
              <Contactless color={art.text} />
            </View>

            {/* Middle Section: EMV Chip */}
            <View style={styles.chipRow} pointerEvents="none">
              <EmvChip borderColor={theme.outline} compact={compact} />
            </View>

            {/* Embossed Card Number */}
            <View style={styles.numberRow}>
              <Text
                style={[
                  styles.cardNumber,
                  compact && styles.cardNumberCompact,
                  { color: art.text },
                ]}>
                {formattedNumber}
              </Text>
            </View>

            {/* Bottom Row: Cardholder Name & Expiry on Left, Official Network Badge on Right */}
            <View style={styles.bottomRow}>
              <View style={styles.holderBlock}>
                <View style={styles.metaRow}>
                  <View style={styles.holderInfo}>
                    <Text style={[styles.microLabel, { color: art.text }]}>CARDHOLDER</Text>
                    <Text
                      style={[
                        styles.holderName,
                        compact && styles.holderNameCompact,
                        { color: art.text },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {displayName}
                    </Text>
                  </View>

                  {!compact ? (
                    <View style={styles.expiryInfo}>
                      <Text style={[styles.microLabel, { color: art.text }]}>VALID THRU</Text>
                      <Text style={[styles.expiryText, { color: art.text }]}>
                        {displayExpiry}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Official Network Badge PNG (Visa, Mastercard, Amex, Discover, RuPay) */}
              <View style={styles.networkBadgeWrap}>
                <CardNetworkBadge
                  network={network}
                  width={compact ? 44 : 58}
                  height={compact ? 28 : 36}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  if (!onPress) return card;
  return (
    <PressScale
      onPress={onPress}
      accessibilityLabel={
        state === 'locked'
          ? 'Locked wallet'
          : state === 'empty'
            ? 'Empty wallet illustration'
            : `${nickname} card${last4 ? ` ending ${last4}` : ''}`
      }>
      {card}
    </PressScale>
  );
}

/** Subtle animated highlight sweep across the card surface on mount. */
function CardShimmer() {
  const { reduceMotion, ready } = useReducedMotion();
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (!ready || reduceMotion) return;
    shimmerX.value = withDelay(
      300,
      withTiming(1.5, { duration: 900, easing: Easing.inOut(Easing.ease) }),
    );
  }, [ready, reduceMotion, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 420 }],
    opacity: shimmerX.value > -0.5 && shimmerX.value < 1.1 ? 0.16 : 0,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Realistic metallic Gold EMV chip with circuit etchings. */
function EmvChip({ borderColor, compact }: { borderColor: string; compact?: boolean }) {
  const w = compact ? 32 : 40;
  const h = compact ? 24 : 30;

  return (
    <View
      style={[
        styles.chip,
        {
          width: w,
          height: h,
          borderColor,
        },
      ]}>
      <LinearGradient
        colors={['#F9DA7A', '#E8B93D', '#C89320']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.chipGrad}>
        {/* Etched microcircuit contacts */}
        <View style={styles.chipInnerGrid}>
          {/* Horizontal center cut */}
          <View style={styles.chipLineH} />
          {/* Vertical center cut */}
          <View style={styles.chipLineV} />
          {/* Outer circuit rings */}
          <View style={[styles.chipCornerPad, { top: 2, left: 2 }]} />
          <View style={[styles.chipCornerPad, { top: 2, right: 2 }]} />
          <View style={[styles.chipCornerPad, { bottom: 2, left: 2 }]} />
          <View style={[styles.chipCornerPad, { bottom: 2, right: 2 }]} />
        </View>
      </LinearGradient>
    </View>
  );
}

/** Contactless payment wireless waves. */
function Contactless({ color }: { color: string }) {
  return (
    <View style={styles.waves} pointerEvents="none">
      <View style={[styles.wave, styles.wave1, { borderColor: color }]} />
      <View style={[styles.wave, styles.wave2, { borderColor: color }]} />
      <View style={[styles.wave, styles.wave3, { borderColor: color }]} />
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
    width: 240,
    alignSelf: 'center',
  },
  shadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
  },
  cardOuter: {
    aspectRatio: CARD_RATIO,
    overflow: 'hidden',
    width: '100%',
    borderWidth: borderWidth.standard,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  innerCompact: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -120,
    width: 140,
    height: '100%',
    transform: [{ skewX: '-25deg' }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issuerRow: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  issuer: {
    fontFamily: displayFontBold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  chipRow: {
    marginTop: 2,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderRadius: 6,
    borderWidth: borderWidth.standard,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  chipGrad: {
    flex: 1,
    padding: 2,
  },
  chipInnerGrid: {
    flex: 1,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(50,30,0,0.3)',
  },
  chipLineH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 0.8,
    backgroundColor: 'rgba(50,30,0,0.35)',
  },
  chipLineV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 0.8,
    backgroundColor: 'rgba(50,30,0,0.35)',
  },
  chipCornerPad: {
    position: 'absolute',
    width: 5,
    height: 4,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(50,30,0,0.25)',
  },
  waves: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    borderWidth: 1.6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    borderRadius: 16,
  },
  wave1: { width: 8, height: 8 },
  wave2: { width: 14, height: 14 },
  wave3: { width: 20, height: 20 },
  numberRow: {
    marginVertical: 4,
  },
  cardNumber: {
    fontFamily: displayFontBold,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2.4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
    ...(tabularNums as object),
  },
  cardNumberCompact: {
    fontSize: 13,
    letterSpacing: 1.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  holderBlock: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  holderInfo: {
    flexShrink: 1,
    maxWidth: '75%',
  },
  expiryInfo: {
    flexShrink: 0,
  },
  microLabel: {
    fontFamily: displayFont,
    fontSize: 7.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    opacity: 0.75,
    marginBottom: 1,
  },
  holderName: {
    fontFamily: displayFontBold,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  holderNameCompact: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  expiryText: {
    fontFamily: displayFontBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    ...(tabularNums as object),
  },
  networkBadgeWrap: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});
