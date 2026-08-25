/**
 * App theme module.
 *
 * Wraps the shared `@cardly/ui` theme with dark-mode awareness. Also loads
 * the system SF font on iOS so dynamic type works; other platforms use the
 * default system font.
 */
import { ThemeProvider as UiThemeProvider, getTheme } from '@cardly/ui';
import { useColorScheme } from 'react-native';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() ?? 'light';
  return <UiThemeProvider scheme={scheme}>{children}</UiThemeProvider>;
}

export { getTheme };
