/**
 * Spacing scale for consistent margins and padding
 * Using a 4px base unit scale
 */

export const Spacing = {
  xs: 4,   // 0.25rem - Very small spacing
  sm: 8,   // 0.5rem  - Small spacing
  md: 12,  // 0.75rem - Medium spacing
  lg: 16,  // 1rem    - Large spacing
  xl: 24,  // 1.5rem  - Extra large spacing
  xl2: 32, // 2rem    - 2x large spacing
  xl3: 48, // 3rem    - 3x large spacing
  xl4: 64, // 4rem    - 4x large spacing
  xl5: 96, // 6rem    - 5x large spacing
  xl6: 128, // 8rem   - 6x large spacing
};

// Common spacing combinations
export const Padding = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.lg,
  lg: Spacing.xl,
  xl: Spacing.xl2,
};

export const Margin = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.lg,
  lg: Spacing.xl,
  xl: Spacing.xl2,
};
