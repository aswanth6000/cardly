import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const FULL_LOGO = require('../../assets/images/cardly-logo.png');
const MARK_LOGO = require('../../assets/images/cardly-mark.png');

const FULL_RATIO = 1.0;
const MARK_RATIO = 1.0;

export interface CardlyLogoProps {
  /** 'full' contains the 3 stacked cards and Cardly wordmark; 'mark' contains only the cards. */
  variant?: 'full' | 'mark';
  /** Target size (width). Height is computed automatically preserving aspect ratio. */
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function CardlyLogo({
  variant = 'full',
  size = 48,
  width,
  height,
  style,
  imageStyle,
}: CardlyLogoProps) {
  const isMark = variant === 'mark';
  const ratio = isMark ? MARK_RATIO : FULL_RATIO;

  let computedW: number;
  let computedH: number;

  if (width && height) {
    computedW = width;
    computedH = height;
  } else if (width) {
    computedW = width;
    computedH = Math.round(width / ratio);
  } else if (height) {
    computedH = height;
    computedW = Math.round(height * ratio);
  } else {
    computedW = size;
    computedH = Math.round(size / ratio);
  }

  const source = isMark ? MARK_LOGO : FULL_LOGO;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[
          {
            width: computedW,
            height: computedH,
          },
          imageStyle,
        ]}
        resizeMode="contain"
        accessibilityLabel="Cardly logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
