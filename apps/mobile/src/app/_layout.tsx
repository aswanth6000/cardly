import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@cardly/ui';

import { VaultProvider, useVault } from '@/vault-context';
import { useAppLock } from '@/hooks/use-app-lock';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AppThemeProvider } from '@/theme';

function RootNavigator() {
  const { ready, unlock, lock } = useVault();
  const motion = useReducedMotion();
  const reduceMotion = motion.ready && motion.reduceMotion;
  const theme = useTheme();
  useAppLock({ enabled: ready, onUnlock: unlock, onLock: lock });

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: reduceMotion ? 'none' : 'slide_from_right',
          animationDuration: reduceMotion ? 0 : 240,
        }}>
        <Stack.Screen name="index" options={{ animation: reduceMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="add" options={{ animation: reduceMotion ? 'none' : 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="card/[id]" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="card/edit/[id]" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: reduceMotion ? 'none' : 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="backup" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="privacy" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <VaultProvider>
        <RootNavigator />
      </VaultProvider>
    </AppThemeProvider>
  );
}
