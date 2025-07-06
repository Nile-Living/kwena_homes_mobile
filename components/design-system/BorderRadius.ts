/**
 * Design System Border Radius
 * 
 * Consistent border radius system for rounded corners
 * Based on 4px increments for visual harmony
 */

/**
 * Base border radius unit (4px)
 */
export const BASE_RADIUS = 4;

/**
 * Border radius scale
 */
export const BorderRadius = {
  // No radius
  none: 0,
  
  // Small radius (2-8px)
  xs: BASE_RADIUS * 0.5,  // 2px
  sm: BASE_RADIUS * 1,    // 4px
  md: BASE_RADIUS * 2,    // 8px
  
  // Medium radius (12-20px)
  lg: BASE_RADIUS * 3,    // 12px
  xl: BASE_RADIUS * 4,    // 16px
  '2xl': BASE_RADIUS * 5, // 20px
  
  // Large radius (24-32px)
  '3xl': BASE_RADIUS * 6, // 24px
  '4xl': BASE_RADIUS * 8, // 32px
  
  // Full radius (circular)
  full: 9999,             // Circular/pill shape
} as const;

/**
 * Component-specific border radius
 */
export const ComponentRadius = {
  // Button radius
  button: {
    small: BorderRadius.sm,        // 4px for small buttons
    medium: BorderRadius.md,       // 8px for medium buttons
    large: BorderRadius.lg,        // 12px for large buttons
    pill: BorderRadius.full,       // Pill-shaped buttons
  },
  
  // Card radius
  card: {
    small: BorderRadius.md,        // 8px for small cards
    medium: BorderRadius.lg,       // 12px for medium cards
    large: BorderRadius.xl,        // 16px for large cards
    featured: BorderRadius['2xl'], // 20px for featured cards
  },
  
  // Input radius
  input: {
    default: BorderRadius.md,      // 8px for inputs
    rounded: BorderRadius.lg,      // 12px for rounded inputs
    pill: BorderRadius.full,       // Pill-shaped inputs
  },
  
  // Modal radius
  modal: {
    small: BorderRadius.lg,        // 12px for small modals
    medium: BorderRadius.xl,       // 16px for medium modals
    large: BorderRadius['2xl'],    // 20px for large modals
    sheet: BorderRadius['3xl'],    // 24px for bottom sheets
  },
  
  // Image radius
  image: {
    thumbnail: BorderRadius.sm,    // 4px for thumbnails
    card: BorderRadius.md,         // 8px for card images
    avatar: BorderRadius.full,     // Circular avatars
    hero: BorderRadius.lg,         // 12px for hero images
  },
  
  // Badge radius
  badge: {
    default: BorderRadius.sm,      // 4px for badges
    pill: BorderRadius.full,       // Pill-shaped badges
  },
  
  // Tag radius
  tag: {
    default: BorderRadius.xs,      // 2px for tags
    rounded: BorderRadius.sm,      // 4px for rounded tags
    pill: BorderRadius.full,       // Pill-shaped tags
  },
  
  // Navigation radius
  navigation: {
    tab: BorderRadius.md,          // 8px for tabs
    drawer: BorderRadius.none,     // No radius for drawers
    header: BorderRadius.none,     // No radius for headers
  },
  
  // Property-specific radius
  property: {
    card: BorderRadius.lg,         // 12px for property cards
    image: BorderRadius.md,        // 8px for property images
    badge: BorderRadius.sm,        // 4px for property badges
    featured: BorderRadius.xl,     // 16px for featured properties
  },
} as const;

/**
 * Corner-specific radius for asymmetric designs
 */
export const CornerRadius = {
  // Top corners only
  topLeft: (radius: number) => ({
    borderTopLeftRadius: radius,
  }),
  
  topRight: (radius: number) => ({
    borderTopRightRadius: radius,
  }),
  
  top: (radius: number) => ({
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
  }),
  
  // Bottom corners only
  bottomLeft: (radius: number) => ({
    borderBottomLeftRadius: radius,
  }),
  
  bottomRight: (radius: number) => ({
    borderBottomRightRadius: radius,
  }),
  
  bottom: (radius: number) => ({
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  }),
  
  // Left corners only
  left: (radius: number) => ({
    borderTopLeftRadius: radius,
    borderBottomLeftRadius: radius,
  }),
  
  // Right corners only
  right: (radius: number) => ({
    borderTopRightRadius: radius,
    borderBottomRightRadius: radius,
  }),
  
  // All corners
  all: (radius: number) => ({
    borderRadius: radius,
  }),
  
  // Diagonal corners
  topLeftBottomRight: (radius: number) => ({
    borderTopLeftRadius: radius,
    borderBottomRightRadius: radius,
  }),
  
  topRightBottomLeft: (radius: number) => ({
    borderTopRightRadius: radius,
    borderBottomLeftRadius: radius,
  }),
} as const;

/**
 * Layout-specific radius patterns
 */
export const LayoutRadius = {
  // Screen containers
  screen: {
    default: BorderRadius.none,    // No radius for full screens
    modal: BorderRadius['2xl'],    // 20px for modal screens
    card: BorderRadius.xl,         // 16px for card-style screens
  },
  
  // Section containers
  section: {
    default: BorderRadius.lg,      // 12px for sections
    highlighted: BorderRadius.xl,  // 16px for highlighted sections
    nested: BorderRadius.md,       // 8px for nested sections
  },
  
  // List items
  listItem: {
    first: (radius: number) => CornerRadius.top(radius),
    last: (radius: number) => CornerRadius.bottom(radius),
    middle: BorderRadius.none,
    single: (radius: number) => CornerRadius.all(radius),
  },
  
  // Content areas
  content: {
    article: BorderRadius.lg,      // 12px for article content
    sidebar: BorderRadius.md,      // 8px for sidebars
    widget: BorderRadius.lg,       // 12px for widgets
  },
} as const;

/**
 * Responsive radius for different screen sizes
 */
export const ResponsiveRadius = {
  // Breakpoint-based radius adjustments
  small: {
    multiplier: 0.75,              // 75% of base radius
    maxRadius: BorderRadius.lg,    // Maximum 12px on small screens
  },
  medium: {
    multiplier: 1,                 // 100% of base radius
    maxRadius: BorderRadius['2xl'], // Maximum 20px on medium screens
  },
  large: {
    multiplier: 1.25,              // 125% of base radius
    maxRadius: BorderRadius['4xl'], // Maximum 32px on large screens
  },
} as const;

/**
 * Animation-friendly radius values
 */
export const AnimatedRadius = {
  // Smooth transitions between states
  transitions: {
    none: BorderRadius.none,
    subtle: BorderRadius.xs,
    moderate: BorderRadius.md,
    dramatic: BorderRadius.xl,
    full: BorderRadius.full,
  },
  
  // Animation duration for radius changes
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing for radius animations
  easing: 'ease-in-out',
} as const;

/**
 * Accessibility considerations for radius
 */
export const AccessibilityRadius = {
  // Minimum radius for touch targets
  minimumTouch: BorderRadius.sm,   // 4px minimum for touch elements
  
  // Focus indicators
  focus: {
    inner: BorderRadius.md,        // 8px for inner focus ring
    outer: BorderRadius.lg,        // 12px for outer focus ring
  },
  
  // High contrast mode adjustments
  highContrast: {
    reduce: 0.5,                   // Reduce radius by 50% in high contrast
    minimum: BorderRadius.xs,      // Minimum radius in high contrast
  },
} as const;

/**
 * Property-specific radius patterns
 */
export const PropertyRadius = {
  // Property cards
  propertyCard: {
    container: BorderRadius.lg,    // 12px for card container
    image: BorderRadius.md,        // 8px for property images
    overlay: BorderRadius.md,      // 8px for image overlays
  },
  
  // Property badges
  propertyBadge: {
    status: BorderRadius.sm,       // 4px for status badges
    type: BorderRadius.xs,         // 2px for type badges
    feature: BorderRadius.full,    // Pill shape for feature badges
  },
  
  // Property details
  propertyDetails: {
    gallery: BorderRadius.lg,      // 12px for image gallery
    section: BorderRadius.md,      // 8px for detail sections
    button: BorderRadius.md,       // 8px for action buttons
  },
  
  // Property forms
  propertyForm: {
    field: BorderRadius.md,        // 8px for form fields
    upload: BorderRadius.lg,       // 12px for upload areas
    preview: BorderRadius.sm,      // 4px for image previews
  },
} as const;

/**
 * Utility functions for radius calculations
 */
export const RadiusUtils = {
  /**
   * Scale radius by a factor
   */
  scale: (radius: number, factor: number): number => radius * factor,
  
  /**
   * Clamp radius between min and max values
   */
  clamp: (radius: number, min: number, max: number): number => {
    return Math.min(Math.max(radius, min), max);
  },
  
  /**
   * Get responsive radius based on screen width
   */
  responsive: (baseRadius: number, screenWidth: number): number => {
    if (screenWidth <= 480) {
      return RadiusUtils.clamp(
        baseRadius * ResponsiveRadius.small.multiplier,
        BorderRadius.none,
        ResponsiveRadius.small.maxRadius
      );
    } else if (screenWidth <= 768) {
      return RadiusUtils.clamp(
        baseRadius * ResponsiveRadius.medium.multiplier,
        BorderRadius.none,
        ResponsiveRadius.medium.maxRadius
      );
    } else {
      return RadiusUtils.clamp(
        baseRadius * ResponsiveRadius.large.multiplier,
        BorderRadius.none,
        ResponsiveRadius.large.maxRadius
      );
    }
  },
  
  /**
   * Create radius style object
   */
  createStyle: (radius: number) => ({ borderRadius: radius }),
  
  /**
   * Create corner-specific radius style
   */
  createCornerStyle: (
    topLeft: number,
    topRight?: number,
    bottomRight?: number,
    bottomLeft?: number
  ) => ({
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight ?? topLeft,
    borderBottomRightRadius: bottomRight ?? topRight ?? topLeft,
    borderBottomLeftRadius: bottomLeft ?? bottomRight ?? topRight ?? topLeft,
  }),
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;
export type BorderRadiusValue = typeof BorderRadius[BorderRadiusKey];