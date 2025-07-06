/**
 * PremiumBadge Component
 * 
 * Displays premium status indicators throughout the app
 * Supports different variants and themes
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { 
  Colors, 
  Typography, 
  Spacing, 
  BorderRadius,
  LightTheme,
  DarkTheme,
  createTheme,
  DesignSystemTheme 
} from '../design-system';
import { useColorScheme } from '../../hooks/useColorScheme';

interface PremiumBadgeProps {
  variant?: 'premium' | 'verified' | 'enterprise' | 'priority';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  theme?: DesignSystemTheme;
}

export function PremiumBadge({
  variant = 'premium',
  size = 'medium',
  showIcon = true,
  style,
  textStyle,
  theme: customTheme,
}: PremiumBadgeProps) {
  const colorScheme = useColorScheme();
  const theme = customTheme || createTheme(colorScheme === 'dark');

  const getVariantConfig = () => {
    switch (variant) {
      case 'premium':
        return {
          backgroundColor: Colors.premium[500],
          textColor: '#FFFFFF',
          icon: '⭐',
          text: 'Premium',
        };
      case 'verified':
        return {
          backgroundColor: Colors.success[500],
          textColor: '#FFFFFF',
          icon: '✓',
          text: 'Verified',
        };
      case 'enterprise':
        return {
          backgroundColor: Colors.business[600],
          textColor: '#FFFFFF',
          icon: '🏢',
          text: 'Business',
        };
      case 'priority':
        return {
          backgroundColor: Colors.warning[500],
          textColor: '#FFFFFF',
          icon: '⚡',
          text: 'Priority',
        };
      default:
        return {
          backgroundColor: Colors.premium[500],
          textColor: '#FFFFFF',
          icon: '⭐',
          text: 'Premium',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.xs,
          paddingVertical: Spacing.xs / 2,
          borderRadius: BorderRadius.sm,
          fontSize: Typography.caption.large.fontSize,
          iconSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.md,
          fontSize: Typography.label.large.fontSize,
          iconSize: 16,
        };
      default: // medium
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: BorderRadius.sm,
          fontSize: Typography.label.medium.fontSize,
          iconSize: 12,
        };
    }
  };

  const variantConfig = getVariantConfig();
  const sizeConfig = getSizeConfig();

  const badgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantConfig.backgroundColor,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    paddingVertical: sizeConfig.paddingVertical,
    borderRadius: sizeConfig.borderRadius,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  };

  const badgeTextStyle: TextStyle = {
    color: variantConfig.textColor,
    fontSize: sizeConfig.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    ...(showIcon && { marginLeft: Spacing.xs / 2 }),
  };

  const iconStyle: TextStyle = {
    fontSize: sizeConfig.iconSize,
  };

  return (
    <View style={[badgeStyle, style]}>
      {showIcon && (
        <Text style={iconStyle}>
          {variantConfig.icon}
        </Text>
      )}
      <Text style={[badgeTextStyle, textStyle]}>
        {variantConfig.text}
      </Text>
    </View>
  );
}

export default PremiumBadge;