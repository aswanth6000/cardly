/**
 * App theme module.
 *
 * Wraps the shared `@cardly/ui` theme with dark-mode awareness and loads the
 * display face (Instrument Sans) so titles and card numbers use it.
 */
import { InstrumentSans_600SemiBold, InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans';
import { useFonts } from 'expo-font';
import { ThemeProvider as UiThemeProvider, getTheme } from '@cardly/ui';
import { useColorScheme } from 'react-native';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() ?? 'light';
  const [fontsLoaded] = useFonts({
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  if (!fontsLoaded) {
    // Fall back to the system face for a frame; the font swaps in instantly.
    return <UiThemeProvider scheme={scheme}>{children}</UiThemeProvider>;
  }

  return <UiThemeProvider scheme={scheme}>{children}</UiThemeProvider>;
}

export { getTheme };
