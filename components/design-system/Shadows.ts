/**
 * Design System Shadows
 * 
 * Consistent shadow system for depth and elevation
 * Supports both iOS and Android shadow styles
 */

import { Platform } from 'react-native';

/**
 * Shadow colors for light and dark themes
 */
export const ShadowColors = {
  light: {
    primary: 'rgba(0, 0, 0, 0.1)',      // Default shadow color
    secondary: 'rgba(0, 0, 0, 0.05)',   // Lighter shadow
    strong: 'rgba(0, 0, 0, 0.15)',      // Stronger shadow
    colored: 'rgba(14, 165, 233, 0.1)', // Brand colored shadow
  },
  dark: {
    primary: 'rgba(0, 0, 0, 0.3)',      // Default shadow color for dark mode
    secondary: 'rgba(0, 0, 0, 0.2)',    // Lighter shadow
    strong: 'rgba(0, 0, 0, 0.4)',       // Stronger shadow
    colored: 'rgba(14, 165, 233, 0.2)', // Brand colored shadow
  },
} as const;

/**
 * Platform-specific shadow configurations
 */
const createShadow = (
  elevation: number,
  shadowOffset: { width: number; height: number },
  shadowOpacity: number,
  shadowRadius: number,
  shadowColor: string = ShadowColors.light.primary
) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    };
  } else {
    return {
      elevation,
      shadowColor,
    };
  }
};

/**
 * Shadow elevation levels (Material Design inspired)
 */
export const Shadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Very subtle shadow (elevation 1)
  xs: createShadow(
    1,
    { width: 0, height: 1 },
    0.05,
    1,
  ),

  // Light shadow (elevation 2)
  sm: createShadow(
    2,
    { width: 0, height: 1 },
    0.1,
    2,
  ),

  // Default shadow (elevation 4)
  md: createShadow(
    4,
    { width: 0, height: 2 },
    0.1,
    4,
  ),

  // Medium shadow (elevation 6)
  lg: createShadow(
    6,
    { width: 0, height: 4 },
    0.12,
    6,
  ),

  // Strong shadow (elevation 8)
  xl: createShadow(
    8,
    { width: 0, height: 6 },
    0.15,
    8,
  ),

  // Very strong shadow (elevation 12)
  '2xl': createShadow(
    12,
    { width: 0, height: 8 },
    0.18,
    12,
  ),

  // Maximum shadow (elevation 16)
  '3xl': createShadow(
    16,
    { width: 0, height: 12 },
    0.2,
    16,
  ),
} as const;

/**
 * Component-specific shadows
 */
export const ComponentShadows = {
  // Card shadows
  card: {
    resting: Shadows.sm,           // Default card shadow
    hover: Shadows.md,             // Card shadow on hover
    pressed: Shadows.xs,           // Card shadow when pressed
    elevated: Shadows.lg,          // Elevated card shadow
  },

  // Button shadows
  button: {
    primary: Shadows.sm,           // Primary button shadow
    secondary: Shadows.xs,         // Secondary button shadow
    floating: Shadows.lg,          // Floating action button
    pressed: Shadows.xs,           // Button shadow when pressed
  },

  // Modal shadows
  modal: {
    backdrop: Shadows['2xl'],      // Modal backdrop shadow
    content: Shadows.xl,           // Modal content shadow
    sheet: Shadows.lg,             // Bottom sheet shadow
  },

  // Navigation shadows
  navigation: {
    header: Shadows.sm,            // Navigation header shadow
    tabBar: Shadows.md,            // Tab bar shadow
    drawer: Shadows.xl,            // Navigation drawer shadow
  },

  // Input shadows
  input: {
    default: Shadows.xs,           // Default input shadow
    focus: Shadows.sm,             // Input shadow when focused
    error: createShadow(2, { width: 0, height: 1 }, 0.1, 2, 'rgba(239, 68, 68, 0.2)'),
  },

  // Property-specific shadows
  property: {
    card: Shadows.sm,              // Property card shadow
    image: Shadows.md,             // Property image shadow
    featured: Shadows.lg,          // Featured property shadow
    promoted: createShadow(4, { width: 0, height: 2 }, 0.15, 4, 'rgba(236, 72, 153, 0.2)'),
  },
} as const;

/**
 * Interactive shadows for different states
 */
export const InteractiveShadows = {
  // Default state shadows
  default: {
    card: Shadows.sm,
    button: Shadows.xs,
    input: Shadows.xs,
  },

  // Hover state shadows
  hover: {
    card: Shadows.md,
    button: Shadows.sm,
    input: Shadows.sm,
  },

  // Pressed/Active state shadows
  pressed: {
    card: Shadows.xs,
    button: Shadows.none,
    input: Shadows.xs,
  },

  // Focus state shadows
  focus: {
    card: Shadows.lg,
    button: Shadows.md,
    input: Shadows.md,
  },

  // Disabled state shadows
  disabled: {
    card: Shadows.none,
    button: Shadows.none,
    input: Shadows.none,
  },
} as const;

/**
 * Colored shadows for brand elements
 */
export const ColoredShadows = {
  // Primary brand colored shadows
  primary: {
    light: createShadow(4, { width: 0, height: 2 }, 0.1, 4, 'rgba(14, 165, 233, 0.2)'),
    medium: createShadow(6, { width: 0, height: 4 }, 0.15, 6, 'rgba(14, 165, 233, 0.25)'),
    strong: createShadow(8, { width: 0, height: 6 }, 0.2, 8, 'rgba(14, 165, 233, 0.3)'),
  },

  // Success colored shadows
  success: {
    light: createShadow(4, { width: 0, height: 2 }, 0.1, 4, 'rgba(34, 197, 94, 0.2)'),
    medium: createShadow(6, { width: 0, height: 4 }, 0.15, 6, 'rgba(34, 197, 94, 0.25)'),
    strong: createShadow(8, { width: 0, height: 6 }, 0.2, 8, 'rgba(34, 197, 94, 0.3)'),
  },

  // Warning colored shadows
  warning: {
    light: createShadow(4, { width: 0, height: 2 }, 0.1, 4, 'rgba(245, 158, 11, 0.2)'),
    medium: createShadow(6, { width: 0, height: 4 }, 0.15, 6, 'rgba(245, 158, 11, 0.25)'),
    strong: createShadow(8, { width: 0, height: 6 }, 0.2, 8, 'rgba(245, 158, 11, 0.3)'),
  },

  // Error colored shadows
  error: {
    light: createShadow(4, { width: 0, height: 2 }, 0.1, 4, 'rgba(239, 68, 68, 0.2)'),
    medium: createShadow(6, { width: 0, height: 4 }, 0.15, 6, 'rgba(239, 68, 68, 0.25)'),
    strong: createShadow(8, { width: 0, height: 6 }, 0.2, 8, 'rgba(239, 68, 68, 0.3)'),
  },

  // Premium/Special colored shadows
  premium: {
    light: createShadow(4, { width: 0, height: 2 }, 0.1, 4, 'rgba(139, 92, 246, 0.2)'),
    medium: createShadow(6, { width: 0, height: 4 }, 0.15, 6, 'rgba(139, 92, 246, 0.25)'),
    strong: createShadow(8, { width: 0, height: 6 }, 0.2, 8, 'rgba(139, 92, 246, 0.3)'),
  },
} as const;

/**
 * Shadow utilities for animation and transitions
 */
export const ShadowAnimations = {
  // Duration for shadow transitions
  duration: {
    fast: 150,      // Fast shadow transitions
    normal: 250,    // Normal shadow transitions
    slow: 350,      // Slow shadow transitions
  },

  // Easing functions for shadow animations
  easing: {
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Animation presets
  presets: {
    hover: {
      duration: 250,
      easing: 'ease-out',
    },
    press: {
      duration: 150,
      easing: 'ease-in-out',
    },
    focus: {
      duration: 200,
      easing: 'ease-out',
    },
  },
} as const;

/**
 * Dark mode shadow adjustments
 */
export const DarkModeShadows = {
  // Adjusted shadows for dark theme
  xs: createShadow(1, { width: 0, height: 1 }, 0.2, 1, ShadowColors.dark.primary),
  sm: createShadow(2, { width: 0, height: 1 }, 0.25, 2, ShadowColors.dark.primary),
  md: createShadow(4, { width: 0, height: 2 }, 0.3, 4, ShadowColors.dark.primary),
  lg: createShadow(6, { width: 0, height: 4 }, 0.35, 6, ShadowColors.dark.primary),
  xl: createShadow(8, { width: 0, height: 6 }, 0.4, 8, ShadowColors.dark.primary),
  '2xl': createShadow(12, { width: 0, height: 8 }, 0.45, 12, ShadowColors.dark.primary),
  '3xl': createShadow(16, { width: 0, height: 12 }, 0.5, 16, ShadowColors.dark.primary),
} as const;

/**
 * Utility functions for shadow manipulation
 */
export const ShadowUtils = {
  /**
   * Get shadow for current theme
   */
  getThemeShadow: (shadowKey: keyof typeof Shadows, isDark: boolean = false) => {
    return isDark ? DarkModeShadows[shadowKey] || Shadows[shadowKey] : Shadows[shadowKey];
  },

  /**
   * Create custom shadow
   */
  createCustomShadow: (
    elevation: number,
    offsetX: number = 0,
    offsetY: number,
    opacity: number,
    radius: number,
    color: string = ShadowColors.light.primary
  ) => {
    return createShadow(elevation, { width: offsetX, height: offsetY }, opacity, radius, color);
  },

  /**
   * Combine multiple shadows (iOS only)
   */
  combineShadows: (shadows: any[]) => {
    if (Platform.OS === 'ios') {
      // For iOS, we can only use one shadow, so return the strongest
      return shadows.reduce((strongest, current) => {
        return (current.shadowRadius || 0) > (strongest.shadowRadius || 0) ? current : strongest;
      });
    } else {
      // For Android, return the highest elevation
      return shadows.reduce((highest, current) => {
        return (current.elevation || 0) > (highest.elevation || 0) ? current : highest;
      });
    }
  },
} as const;

export type ShadowKey = keyof typeof Shadows;
export type ShadowValue = typeof Shadows[ShadowKey];