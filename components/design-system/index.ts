/**
 * Kwena Properties Design System
 * 
 * Comprehensive design system for consistent UI/UX across the application
 * Includes colors, typography, spacing, shadows, and border radius
 */

// Core design tokens
export * from './Colors';
export * from './Typography';
export * from './Spacing';
export * from './Shadows';
export * from './BorderRadius';

// Re-export commonly used values for convenience
export { Colors, LightTheme, DarkTheme } from './Colors';
export { Typography, FontFamilies, FontWeights } from './Typography';
export { Spacing, ComponentSpacing, LayoutSpacing } from './Spacing';
export { Shadows, ComponentShadows, ColoredShadows } from './Shadows';
export { BorderRadius, ComponentRadius } from './BorderRadius';

/**
 * Design system theme interface
 */
export interface DesignSystemTheme {
  colors: typeof LightTheme;
  typography: typeof Typography;
  spacing: typeof Spacing;
  shadows: typeof Shadows;
  borderRadius: typeof BorderRadius;
  isDark: boolean;
}

/**
 * Create a complete theme object
 */
export const createTheme = (isDark: boolean = false): DesignSystemTheme => ({
  colors: isDark ? DarkTheme : LightTheme,
  typography: Typography,
  spacing: Spacing,
  shadows: isDark ? DarkModeShadows : Shadows,
  borderRadius: BorderRadius,
  isDark,
});

/**
 * Default themes
 */
export const LightDesignTheme = createTheme(false);
export const DarkDesignTheme = createTheme(true);

/**
 * Design system utilities
 */
export const DesignSystemUtils = {
  /**
   * Get theme-aware color
   */
  getColor: (
    colorKey: string,
    theme: DesignSystemTheme
  ): string => {
    return (theme.colors as any)[colorKey] || theme.colors.primary;
  },

  /**
   * Get responsive spacing
   */
  getSpacing: (
    spacingKey: keyof typeof Spacing,
    screenWidth?: number
  ): number => {
    const baseSpacing = Spacing[spacingKey];
    if (!screenWidth) return baseSpacing;
    
    return SpacingUtils.responsive(baseSpacing, screenWidth);
  },

  /**
   * Get theme-aware shadow
   */
  getShadow: (
    shadowKey: keyof typeof Shadows,
    theme: DesignSystemTheme
  ) => {
    return ShadowUtils.getThemeShadow(shadowKey, theme.isDark);
  },

  /**
   * Create consistent style object
   */
  createStyle: (options: {
    backgroundColor?: string;
    padding?: number;
    margin?: number;
    borderRadius?: number;
    shadow?: keyof typeof Shadows;
    theme: DesignSystemTheme;
  }) => {
    const {
      backgroundColor,
      padding,
      margin,
      borderRadius,
      shadow,
      theme,
    } = options;

    return {
      ...(backgroundColor && { backgroundColor }),
      ...(padding && { padding }),
      ...(margin && { margin }),
      ...(borderRadius && { borderRadius }),
      ...(shadow && DesignSystemUtils.getShadow(shadow, theme)),
    };
  },
} as const;

/**
 * Commonly used style combinations
 */
export const CommonStyles = {
  /**
   * Card style with theme support
   */
  card: (theme: DesignSystemTheme) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: ComponentRadius.card.medium,
    padding: ComponentSpacing.card.padding,
    ...DesignSystemUtils.getShadow('sm', theme),
  }),

  /**
   * Button style with theme support
   */
  button: (theme: DesignSystemTheme, variant: 'primary' | 'secondary' = 'primary') => ({
    backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.surface,
    borderRadius: ComponentRadius.button.medium,
    paddingVertical: ComponentSpacing.button.paddingVertical,
    paddingHorizontal: ComponentSpacing.button.paddingHorizontal,
    ...DesignSystemUtils.getShadow('sm', theme),
  }),

  /**
   * Input style with theme support
   */
  input: (theme: DesignSystemTheme) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: ComponentRadius.input.default,
    paddingVertical: ComponentSpacing.input.paddingVertical,
    paddingHorizontal: ComponentSpacing.input.paddingHorizontal,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: ComponentSpacing.input.minHeight,
  }),

  /**
   * Screen container style
   */
  screen: (theme: DesignSystemTheme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: LayoutSpacing.screen.paddingHorizontal,
  }),

  /**
   * Section style
   */
  section: (theme: DesignSystemTheme) => ({
    marginVertical: LayoutSpacing.section.marginVertical,
    paddingHorizontal: LayoutSpacing.section.paddingHorizontal,
  }),
} as const;

/**
 * Property-specific style utilities
 */
export const PropertyStyles = {
  /**
   * Property card style
   */
  propertyCard: (theme: DesignSystemTheme) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: PropertyRadius.propertyCard.container,
    padding: PropertySpacing.propertyCard.contentPadding,
    marginBottom: PropertySpacing.propertyCard.contentGap,
    ...DesignSystemUtils.getShadow('sm', theme),
  }),

  /**
   * Property image style
   */
  propertyImage: (theme: DesignSystemTheme) => ({
    borderRadius: PropertyRadius.propertyCard.image,
    aspectRatio: PropertySpacing.propertyCard.imageAspectRatio,
    overflow: 'hidden' as const,
  }),

  /**
   * Property price style
   */
  propertyPrice: (theme: DesignSystemTheme) => ({
    ...Typography.price.medium,
    color: theme.colors.primary,
    fontWeight: FontWeights.bold,
  }),

  /**
   * Property title style
   */
  propertyTitle: (theme: DesignSystemTheme) => ({
    ...PropertyTypography.propertyTitle,
    color: theme.colors.text,
  }),

  /**
   * Property description style
   */
  propertyDescription: (theme: DesignSystemTheme) => ({
    ...PropertyTypography.propertyDescription,
    color: theme.colors.textSecondary,
  }),
} as const;

// Type exports for TypeScript support
export type DesignSystemColor = keyof typeof LightTheme;
export type DesignSystemSpacing = keyof typeof Spacing;
export type DesignSystemShadow = keyof typeof Shadows;
export type DesignSystemRadius = keyof typeof BorderRadius;