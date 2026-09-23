import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import type { Theme, ColorScheme } from './theme';
import { darkTheme, lightTheme } from './theme';

export const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Provides the Cardly theme to the tree.
 * Cardly is built in light mode only.
 */
export function ThemeProvider({
  scheme = 'light',
  children,
}: {
  scheme?: ColorScheme | 'auto';
  children: React.ReactNode;
}) {
  return (
    <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
