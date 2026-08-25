import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { VaultProvider, useVault } from '@/vault-context';
import { useAppLock } from '@/hooks/use-app-lock';
import { AppThemeProvider } from '@/theme';

function RootNavigator() {
  const { ready, unlock, lock } = useVault();
  const colorScheme = useColorScheme() ?? 'light';
  useAppLock({ enabled: ready, onUnlock: unlock, onLock: lock });

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
          animationDuration: 220,
        }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="add/index" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="add/manual" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="add/review" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="add/scan" options={{ animation: 'fade' }} />
        <Stack.Screen name="card/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="card/edit/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="backup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
