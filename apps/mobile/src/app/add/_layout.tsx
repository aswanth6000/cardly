import { Stack } from 'expo-router';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function AddLayout() {
  const motion = useReducedMotion();
  const reduceMotion = motion.ready && motion.reduceMotion;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: reduceMotion ? 'none' : 'slide_from_right',
        animationDuration: reduceMotion ? 0 : 240,
      }}>
      <Stack.Screen name="index" options={{ animation: reduceMotion ? 'none' : 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="manual" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
      <Stack.Screen name="review" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
      <Stack.Screen name="scan" options={{ animation: reduceMotion ? 'none' : 'fade' }} />
    </Stack>
  );
}
