/**
 * FeatureAccessPrompt Component
 * 
 * Displays upgrade prompts when users try to access premium features
 * Provides contextual information about premium benefits
 */

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Dimensions 
} from 'react-native';
import { 
  Colors, 
  Typography, 
  Spacing, 
  BorderRadius,
  createTheme,
  DesignSystemTheme,
  CommonStyles 
} from '../design-system';
import { useColorScheme } from '../../hooks/useColorScheme';
import PremiumBadge from './PremiumBadge';

interface FeatureAccessPromptProps {
  visible: boolean;
  feature: string;
  featureDescription: string;
  benefitsList: string[];
  currentPlan?: string;
  onUpgrade: () => void;
  onClose: () => void;
  theme?: DesignSystemTheme;
}

const { width: screenWidth } = Dimensions.get('window');

export function FeatureAccessPrompt({
  visible,
  feature,
  featureDescription,
  benefitsList,
  currentPlan = 'free',
  onUpgrade,
  onClose,
  theme: customTheme,
}: FeatureAccessPromptProps) {
  const colorScheme = useColorScheme();
  const theme = customTheme || createTheme(colorScheme === 'dark');

  const getFeatureIcon = (feature: string): string => {
    const iconMap: Record<string, string> = {
      'saved_search': '🔍',
      'priority_notifications': '🔔',
      'advanced_filters': '⚙️',
      'analytics_access': '📊',
      'verified_contact': '✅',
      'bulk_operations': '📋',
      'premium_badge': '⭐',
      'priority_support': '🚀',
    };
    return iconMap[feature] || '⭐';
  };

  const getRecommendedPlan = (): { name: string; price: string; variant: any } => {
    // Recommend plan based on feature
    const premiumFeatures = ['priority_notifications', 'advanced_filters', 'analytics_access', 'verified_contact'];
    const enterpriseFeatures = ['bulk_operations'];

    if (enterpriseFeatures.includes(feature)) {
      return { name: 'Business Plan', price: 'K250/month', variant: 'enterprise' };
    } else if (premiumFeatures.includes(feature)) {
      return { name: 'Premium Plan', price: 'K120/month', variant: 'premium' };
    }
    return { name: 'Premium Plan', price: 'K120/month', variant: 'premium' };
  };

  const modalStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  };

  const contentStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: Math.min(screenWidth - (Spacing.lg * 2), 400),
    maxHeight: '80%',
  };

  const headerStyle: ViewStyle = {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  };

  const iconStyle: TextStyle = {
    fontSize: 48,
    marginBottom: Spacing.md,
  };

  const titleStyle: TextStyle = {
    ...Typography.heading.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  };

  const descriptionStyle: TextStyle = {
    ...Typography.body.large,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  };

  const benefitsContainerStyle: ViewStyle = {
    marginBottom: Spacing.lg,
  };

  const benefitsTitleStyle: TextStyle = {
    ...Typography.label.large,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  };

  const benefitItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  };

  const benefitIconStyle: TextStyle = {
    fontSize: 16,
    color: Colors.success[600],
    marginRight: Spacing.sm,
    marginTop: 2,
  };

  const benefitTextStyle: TextStyle = {
    ...Typography.body.medium,
    color: theme.colors.text,
    flex: 1,
  };

  const planRecommendationStyle: ViewStyle = {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  };

  const planHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  };

  const planNameStyle: TextStyle = {
    ...Typography.label.large,
    color: Colors.primary[700],
    fontWeight: '600',
  };

  const planPriceStyle: TextStyle = {
    ...Typography.label.medium,
    color: Colors.primary[600],
    fontWeight: '500',
  };

  const buttonsContainerStyle: ViewStyle = {
    flexDirection: 'row',
    gap: Spacing.md,
  };

  const upgradeButtonStyle: ViewStyle = {
    ...CommonStyles.button(theme, 'primary'),
    flex: 1,
  };

  const cancelButtonStyle: ViewStyle = {
    ...CommonStyles.button(theme, 'secondary'),
    flex: 1,
  };

  const buttonTextStyle: TextStyle = {
    ...Typography.label.large,
    fontWeight: '600',
    textAlign: 'center',
  };

  const upgradeTextStyle: TextStyle = {
    ...buttonTextStyle,
    color: '#FFFFFF',
  };

  const cancelTextStyle: TextStyle = {
    ...buttonTextStyle,
    color: theme.colors.text,
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyle}>
        <View style={contentStyle}>
          <View style={headerStyle}>
            <Text style={iconStyle}>{getFeatureIcon(feature)}</Text>
            <Text style={titleStyle}>Unlock Premium Feature</Text>
            <Text style={descriptionStyle}>{featureDescription}</Text>
          </View>

          <View style={benefitsContainerStyle}>
            <Text style={benefitsTitleStyle}>With premium access, you get:</Text>
            {benefitsList.map((benefit, index) => (
              <View key={index} style={benefitItemStyle}>
                <Text style={benefitIconStyle}>✓</Text>
                <Text style={benefitTextStyle}>{benefit}</Text>
              </View>
            ))}
          </View>

          <View style={planRecommendationStyle}>
            <View style={planHeaderStyle}>
              <Text style={planNameStyle}>{recommendedPlan.name}</Text>
              <PremiumBadge 
                variant={recommendedPlan.variant} 
                size="small" 
                theme={theme}
              />
            </View>
            <Text style={planPriceStyle}>
              Starting at {recommendedPlan.price}
            </Text>
          </View>

          <View style={buttonsContainerStyle}>
            <TouchableOpacity style={cancelButtonStyle} onPress={onClose}>
              <Text style={cancelTextStyle}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={upgradeButtonStyle} onPress={onUpgrade}>
              <Text style={upgradeTextStyle}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default FeatureAccessPrompt;