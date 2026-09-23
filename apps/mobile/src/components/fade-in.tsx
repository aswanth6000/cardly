import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { animation } from '@cardly/ui';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Subtle enter animation: fade + short rise using spring physics
 * for more organic movement.
 *
 * Used for wallet cards and detail rows. Respects the system reduced-motion
 * setting (renders without animation when enabled). The delay staggers
 * consecutive items so a list feels orchestrated rather than static.
 */
export function FadeIn({
  children,
  delay = 0,
  from = 'bottom',
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  /** Direction the element slides in from. */
  from?: 'bottom' | 'left' | 'right';
  style?: Animated.AnimatedProps<React.ComponentProps<typeof Animated.View>>['style'];
}) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(from === 'bottom' ? 8 : from === 'left' ? -12 : 12);
  const { reduceMotion, ready } = useReducedMotion();
  const isVertical = from === 'bottom';

  useEffect(() => {
    if (!ready) return;
    opacity.value = 0;
    offset.value = from === 'bottom' ? 8 : from === 'left' ? -12 : 12;

    if (reduceMotion) {
      opacity.value = 1;
      offset.value = 0;
      return;
    }

    const springConfig = {
      damping: animation.spring.damping,
      stiffness: animation.spring.stiffness,
      mass: animation.spring.mass,
    };

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }),
    );
    offset.value = withDelay(
      delay,
      withSpring(0, { damping: 16, stiffness: 140, mass: 0.9 }),
    );
  }, [delay, opacity, ready, reduceMotion, offset, from]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: isVertical
      ? [{ translateY: offset.value }]
      : [{ translateX: offset.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
