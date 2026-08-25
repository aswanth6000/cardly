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
        }}
      />
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
