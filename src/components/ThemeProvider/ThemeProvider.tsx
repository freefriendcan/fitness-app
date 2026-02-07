/**
 * ThemeProvider Component
 * Wraps the application with theme context and handles theme initialization
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider as ThemeContextProvider } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/constants/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const InnerThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themePreference = useUserStore((state) => state.getTheme());
  // const themePreference = 'system';

  return (
    <ThemeContextProvider initialTheme={themePreference}>
      {children}
    </ThemeContextProvider>
  );
};

const ThemedApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <>
      {/* <StatusBar style={isDark ? 'light' : 'dark'} /> */}
      {children}
    </>
  );
};



/**
 * Main ThemeProvider component
 * Integrates with userStore for theme persistence
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <InnerThemeProvider>{children}</InnerThemeProvider>;
};
