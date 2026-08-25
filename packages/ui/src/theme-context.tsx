import { createContext, useContext } from 'react';
import type { Theme } from './theme';
import { darkTheme, lightTheme } from './theme';

export const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ scheme, children }: { scheme: 'light' | 'dark'; children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={scheme === 'dark' ? darkTheme : lightTheme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
