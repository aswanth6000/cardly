/**
 * App theme module.
 *
 * Wraps the shared `@cardly/ui` theme system and loads Geist Sans fonts
 * for clean, modern typography across the entire app.
 */
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist';
import { useFonts } from 'expo-font';
import { ThemeProvider as UiThemeProvider, getTheme } from '@cardly/ui';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <UiThemeProvider scheme="light">{children}</UiThemeProvider>;
  }

  return <UiThemeProvider scheme="light">{children}</UiThemeProvider>;
}

export { getTheme };
