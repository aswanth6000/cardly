import { Stack } from 'expo-router';

export default function AddLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
        animationDuration: 220,
      }}>
      <Stack.Screen name="index" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="manual" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="review" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="scan" options={{ animation: 'fade' }} />
    </Stack>
  );
}
