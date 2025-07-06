/**
 * Design System Spacing
 * 
 * 8px grid-based spacing system for consistent layouts
 * Follows Material Design spacing guidelines
 */

/**
 * Base spacing unit (8px)
 */
export const BASE_SPACING = 8;

/**
 * Spacing scale based on 8px grid
 */
export const Spacing = {
  // No spacing
  none: 0,
  
  // Micro spacing (1-2px for borders, dividers)
  hairline: 1,
  px: 1,
  
  // Small spacing (4-16px for tight layouts)
  xs: BASE_SPACING * 0.5,  // 4px
  sm: BASE_SPACING * 1,    // 8px
  md: BASE_SPACING * 1.5,  // 12px
  
  // Medium spacing (16-32px for regular layouts)
  lg: BASE_SPACING * 2,    // 16px
  xl: BASE_SPACING * 2.5,  // 20px
  '2xl': BASE_SPACING * 3, // 24px
  
  // Large spacing (32-64px for section separation)
  '3xl': BASE_SPACING * 4, // 32px
  '4xl': BASE_SPACING * 5, // 40px
  '5xl': BASE_SPACING * 6, // 48px
  
  // Extra large spacing (64px+ for major sections)
  '6xl': BASE_SPACING * 8,  // 64px
  '7xl': BASE_SPACING * 10, // 80px
  '8xl': BASE_SPACING * 12, // 96px
  '9xl': BASE_SPACING * 16, // 128px
} as const;

/**
 * Component-specific spacing
 */
export const ComponentSpacing = {
  // Card spacing
  card: {
    padding: Spacing.lg,        // 16px
    margin: Spacing.md,         // 12px
    gap: Spacing.sm,           // 8px
    borderRadius: Spacing.md,   // 12px
  },
  
  // Button spacing
  button: {
    paddingVertical: Spacing.md,    // 12px
    paddingHorizontal: Spacing.lg,  // 16px
    gap: Spacing.sm,               // 8px
    minHeight: Spacing['5xl'],     // 48px
  },
  
  // Input spacing
  input: {
    paddingVertical: Spacing.md,    // 12px
    paddingHorizontal: Spacing.lg,  // 16px
    marginBottom: Spacing.lg,       // 16px
    minHeight: Spacing['5xl'],     // 48px
  },
  
  // List spacing
  list: {
    itemPadding: Spacing.lg,       // 16px
    itemGap: Spacing.sm,          // 8px
    sectionGap: Spacing['2xl'],    // 24px
  },
  
  // Screen spacing
  screen: {
    paddingHorizontal: Spacing.lg,  // 16px
    paddingVertical: Spacing.lg,    // 16px
    marginTop: Spacing['3xl'],      // 32px
  },
  
  // Modal spacing
  modal: {
    padding: Spacing['2xl'],        // 24px
    gap: Spacing.lg,               // 16px
    buttonGap: Spacing.sm,         // 8px
  },
  
  // Property card spacing
  propertyCard: {
    padding: Spacing.lg,           // 16px
    imageHeight: 200,              // Fixed height for images
    contentGap: Spacing.md,        // 12px
    featureGap: Spacing.sm,        // 8px
  },
} as const;

/**
 * Layout spacing for different screen sections
 */
export const LayoutSpacing = {
  // Header/Navigation spacing
  header: {
    height: 56,                    // Standard header height
    paddingHorizontal: Spacing.lg, // 16px
    paddingVertical: Spacing.sm,   // 8px
  },
  
  // Tab bar spacing
  tabBar: {
    height: 80,                    // Tab bar height
    paddingBottom: Spacing.lg,     // 16px for safe area
    paddingTop: Spacing.sm,        // 8px
  },
  
  // Safe area spacing
  safeArea: {
    top: 44,                       // iOS status bar
    bottom: 34,                    // iOS home indicator
    paddingHorizontal: Spacing.lg, // 16px
  },
  
  // Section spacing
  section: {
    marginVertical: Spacing['3xl'], // 32px
    paddingHorizontal: Spacing.lg,  // 16px
    gap: Spacing.lg,               // 16px
  },
  
  // Grid spacing
  grid: {
    gap: Spacing.lg,               // 16px
    columnGap: Spacing.md,         // 12px
    rowGap: Spacing.lg,           // 16px
  },
} as const;

/**
 * Interactive element spacing
 */
export const InteractiveSpacing = {
  // Touch target sizes (minimum 44x44 per accessibility guidelines)
  touchTarget: {
    minimum: 44,                   // Minimum touch target
    comfortable: Spacing['6xl'],   // 64px comfortable target
    padding: Spacing.md,           // 12px padding
  },
  
  // Focus indicators
  focus: {
    outlineWidth: 2,
    outlineOffset: 2,
    padding: Spacing.xs,           // 4px
  },
  
  // Hover states
  hover: {
    scaleIncrease: 0.02,          // 2% scale increase
    paddingIncrease: Spacing.xs,   // 4px additional padding
  },
} as const;

/**
 * Responsive spacing for different screen sizes
 */
export const ResponsiveSpacing = {
  // Breakpoint-based spacing multipliers
  small: {
    multiplier: 0.75,              // 75% of base spacing
    maxWidth: 480,
  },
  medium: {
    multiplier: 1,                 // 100% of base spacing
    maxWidth: 768,
  },
  large: {
    multiplier: 1.25,              // 125% of base spacing
    maxWidth: 1024,
  },
  
  // Responsive container spacing
  container: {
    small: Spacing.md,             // 12px
    medium: Spacing.lg,            // 16px
    large: Spacing['2xl'],         // 24px
  },
} as const;

/**
 * Animation-related spacing
 */
export const AnimationSpacing = {
  // Transform values for animations
  slideDistance: Spacing['3xl'],   // 32px
  scaleFactors: {
    subtle: 0.02,                  // 2% scale change
    moderate: 0.05,                // 5% scale change
    dramatic: 0.1,                 // 10% scale change
  },
  
  // Parallax spacing
  parallax: {
    offset: Spacing.lg,            // 16px
    intensity: 0.5,                // 50% movement
  },
} as const;

/**
 * Accessibility spacing considerations
 */
export const AccessibilitySpacing = {
  // Minimum spacing for accessibility
  minimumTouchTarget: 44,          // iOS/Android guidelines
  minimumTextSpacing: Spacing.sm,  // 8px between text elements
  
  // Focus indicator spacing
  focusIndicator: {
    width: 2,
    offset: 2,
    padding: Spacing.xs,           // 4px
  },
  
  // Content spacing for readability
  readability: {
    lineSpacing: Spacing.xs,       // 4px between lines
    paragraphSpacing: Spacing.lg,  // 16px between paragraphs
    sectionSpacing: Spacing['3xl'], // 32px between sections
  },
} as const;

/**
 * Property-specific spacing
 */
export const PropertySpacing = {
  // Property card layout
  propertyCard: {
    imageAspectRatio: 16 / 9,      // 16:9 aspect ratio
    contentPadding: Spacing.lg,     // 16px
    pricePadding: Spacing.md,       // 12px
    featureSpacing: Spacing.sm,     // 8px
  },
  
  // Property details layout
  propertyDetails: {
    sectionGap: Spacing['2xl'],     // 24px
    contentGap: Spacing.lg,         // 16px
    imageGalleryGap: Spacing.sm,    // 8px
  },
  
  // Property form spacing
  propertyForm: {
    fieldGap: Spacing.lg,           // 16px
    groupGap: Spacing['2xl'],       // 24px
    buttonGap: Spacing.md,          // 12px
  },
} as const;

/**
 * Utility functions for spacing calculations
 */
export const SpacingUtils = {
  /**
   * Multiply spacing by a factor
   */
  multiply: (spacing: number, factor: number): number => spacing * factor,
  
  /**
   * Add two spacing values
   */
  add: (spacing1: number, spacing2: number): number => spacing1 + spacing2,
  
  /**
   * Get responsive spacing based on screen width
   */
  responsive: (baseSpacing: number, screenWidth: number): number => {
    if (screenWidth <= ResponsiveSpacing.small.maxWidth) {
      return baseSpacing * ResponsiveSpacing.small.multiplier;
    } else if (screenWidth <= ResponsiveSpacing.medium.maxWidth) {
      return baseSpacing * ResponsiveSpacing.medium.multiplier;
    } else {
      return baseSpacing * ResponsiveSpacing.large.multiplier;
    }
  },
  
  /**
   * Convert spacing to string with px unit
   */
  toPx: (spacing: number): string => `${spacing}px`,
  
  /**
   * Get spacing from the scale by key
   */
  get: (key: keyof typeof Spacing): number => Spacing[key],
} as const;

export type SpacingKey = keyof typeof Spacing;
export type SpacingValue = typeof Spacing[SpacingKey];