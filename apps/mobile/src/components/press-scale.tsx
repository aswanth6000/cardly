import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

const SPRING_PRESS = { damping: 20, stiffness: 280, mass: 0.8 };
const PRESS_OFFSET = 3;

/**
 * Press feedback: tactile physical translation into the shadow and gentle scale spring.
 * Respects the system reduced-motion preference.
 */
export function PressScale({
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  children,
  style,
}: {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { reduceMotion, ready } = useReducedMotion();
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { translateY: offset.value },
      { scale: scale.value },
    ],
  }));

  const setPressed = (pressed: boolean) => {
    if (!ready || reduceMotion) return;
    offset.value = withSpring(pressed ? PRESS_OFFSET : 0, SPRING_PRESS);
    scale.value = withSpring(pressed ? 0.982 : 1, SPRING_PRESS);
  };

  if (!onPress) {
    return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[{ width: '100%' }, style]}>
      <Animated.View style={[animatedStyle, { width: '100%' }]}>{children}</Animated.View>
    </Pressable>
  );
}
