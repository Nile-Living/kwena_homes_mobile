/**
 * Design System Typography
 * 
 * Consistent typography scale following Material Design and iOS Human Interface Guidelines
 * Supports both mobile and web platforms with proper scaling
 */

import { Platform } from 'react-native';

/**
 * Font families
 */
export const FontFamilies = {
  // Primary font (System fonts for better performance)
  primary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Secondary font for headings
  heading: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Monospace font for code/numbers
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'Courier New',
  }),
} as const;

/**
 * Font weights
 */
export const FontWeights = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
} as const;

/**
 * Line heights (relative to font size)
 */
export const LineHeights = {
  none: 1,
  tight: 1.1,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

/**
 * Letter spacing (in em units)
 */
export const LetterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
} as const;

/**
 * Typography scale
 */
export const Typography = {
  // Display headings (for hero sections, major headings)
  display: {
    large: {
      fontSize: 48,
      lineHeight: 52,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.tight,
      fontFamily: FontFamilies.heading,
    },
    medium: {
      fontSize: 40,
      lineHeight: 44,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.tight,
      fontFamily: FontFamilies.heading,
    },
    small: {
      fontSize: 32,
      lineHeight: 36,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
  },

  // Headings (for section titles, page headers)
  heading: {
    h1: {
      fontSize: 28,
      lineHeight: 32,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
    h2: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
    h3: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
    h4: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
    h5: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.heading,
    },
    h6: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.wide,
      fontFamily: FontFamilies.heading,
    },
  },

  // Body text (for paragraphs, descriptions)
  body: {
    large: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
  },

  // Labels (for form labels, UI elements)
  label: {
    large: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: FontWeights.medium,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    medium: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: FontWeights.medium,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FontWeights.medium,
      letterSpacing: LetterSpacing.wide,
      fontFamily: FontFamilies.primary,
    },
  },

  // Captions (for small text, disclaimers)
  caption: {
    large: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    medium: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.primary,
    },
    small: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: FontWeights.regular,
      letterSpacing: LetterSpacing.wider,
      fontFamily: FontFamilies.primary,
    },
  },

  // Buttons (for button text)
  button: {
    large: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.wide,
      fontFamily: FontFamilies.primary,
    },
    medium: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.wide,
      fontFamily: FontFamilies.primary,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.wider,
      fontFamily: FontFamilies.primary,
    },
  },

  // Price text (for property prices, payments)
  price: {
    large: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.tight,
      fontFamily: FontFamilies.mono,
    },
    medium: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: FontWeights.bold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.mono,
    },
    small: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.normal,
      fontFamily: FontFamilies.mono,
    },
  },

  // Overline (for categories, tags)
  overline: {
    large: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.widest,
      fontFamily: FontFamilies.primary,
      textTransform: 'uppercase' as const,
    },
    medium: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.widest,
      fontFamily: FontFamilies.primary,
      textTransform: 'uppercase' as const,
    },
    small: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: FontWeights.semiBold,
      letterSpacing: LetterSpacing.widest,
      fontFamily: FontFamilies.primary,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

/**
 * Responsive typography utilities
 */
export const ResponsiveTypography = {
  // Scale factors for different screen sizes
  scaleFactors: {
    small: 0.875,  // 87.5% for small screens
    medium: 1,     // 100% for medium screens
    large: 1.125,  // 112.5% for large screens
  },

  // Breakpoints for responsive scaling
  breakpoints: {
    small: 320,
    medium: 768,
    large: 1024,
  },
} as const;

/**
 * Accessibility typography settings
 */
export const AccessibilityTypography = {
  // Minimum font sizes for accessibility
  minimumSizes: {
    body: 14,
    caption: 11,
    button: 12,
  },

  // Maximum line lengths for readability
  maxLineLength: {
    characters: 75,
    words: 12,
  },

  // Contrast requirements
  contrastRequirements: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  },
} as const;

/**
 * Property-specific typography styles
 */
export const PropertyTypography = {
  propertyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
    fontFamily: FontFamilies.heading,
  },

  propertyPrice: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: FontWeights.bold,
    letterSpacing: LetterSpacing.tight,
    fontFamily: FontFamilies.mono,
  },

  propertyAddress: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
    fontFamily: FontFamilies.primary,
  },

  propertyDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
    fontFamily: FontFamilies.primary,
  },

  propertyFeatures: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
    fontFamily: FontFamilies.primary,
  },

  propertyType: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.widest,
    fontFamily: FontFamilies.primary,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyStyle = typeof Typography.body.medium;
export type TypographyCategory = keyof typeof Typography;