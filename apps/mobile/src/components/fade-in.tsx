import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

/**
 * Subtle enter animation: fade + slight rise.
 *
 * Used for wallet cards and detail rows. Respects the system reduced-motion
 * setting (renders without animation when enabled). The delay staggers
 * consecutive items so a list feels orchestrated rather than static.
 */
export function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: Animated.AnimatedProps<React.ComponentProps<typeof Animated.View>>['style'];
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const reduceMotion = useSharedValue(false);

  useEffect(() => {
    let mounted = true;
    if (Platform.OS !== 'web') {
      AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        if (mounted) reduceMotion.value = v;
      });
    }
    return () => {
      mounted = false;
    };
  }, [reduceMotion]);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 12;
    if (reduceMotion.value) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateY, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
