/**
 * useTheme hook
 * Convenience hook for accessing theme colors and managing theme
 */

import { useMemo } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import type { Theme, ThemeMode } from '@/constants/themes';

/**
 * Hook to access theme colors and utilities
 * Provides direct access to theme colors and theme switching functionality
 */
export const useTheme = () => {
  const { theme, themeMode, setTheme, isSystem } = useThemeContext();

  // Memoize common color references for convenience
  const colors = useMemo(() => theme.colors, [theme]);

  // Shorthand access to commonly used colors
  const primary = colors.primary[500];
  const primaryLight = colors.primary[100];
  const primaryDark = colors.primary[700];

  const secondary = colors.secondary[500];
  const secondaryLight = colors.secondary[100];
  const secondaryDark = colors.secondary[700];

  const success = colors.success[500];
  const danger = colors.danger[500];
  const warning = colors.warning[500];

  const background = colors.background.primary;
  const backgroundSecondary = colors.background.secondary;
  const card = colors.background.card;

  const text = colors.text.primary;
  const textSecondary = colors.text.secondary;
  const textTertiary = colors.text.tertiary;

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = async () => {
    const newMode: ThemeMode = theme.dark ? 'light' : 'dark';
    await setTheme(newMode);
  };

  /**
   * Set theme to system default
   */
  const useSystemTheme = async () => {
    await setTheme('system');
  };

  /**
   * Check if current mode matches the given mode
   */
  const isMode = (mode: 'light' | 'dark' | 'system'): boolean => {
    if (mode === 'system') {
      return isSystem;
    }
    return themeMode === mode || (isSystem && theme.dark === (mode === 'dark'));
  };

  return {
    // Full theme object
    theme,

    // Theme mode info
    themeMode,
    isDark: theme.dark,
    isLight: !theme.dark,
    isSystem,

    // Theme actions
    setTheme,
    toggleTheme,
    useSystemTheme,
    isMode,

    // Color palettes
    colors,

    // Shorthand color access
    primary,
    primaryLight,
    primaryDark,
    secondary,
    secondaryLight,
    secondaryDark,
    success,
    danger,
    warning,
    background,
    backgroundSecondary,
    card,
    text,
    textSecondary,
    textTertiary,
  };
};

/**
 * Hook to access only theme colors (no theme switching)
 * Use this in components that don't need to change the theme
 */
export const useThemeColors = () => {
  const { theme } = useThemeContext();
  return theme.colors;
};
