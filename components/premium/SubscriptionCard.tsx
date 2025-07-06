/**
 * SubscriptionCard Component
 * 
 * Displays subscription plan information and features
 * Used in subscription selection screens
 */

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
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

interface SubscriptionFeature {
  name: string;
  included: boolean;
  isHighlight?: boolean;
}

interface SubscriptionPlan {
  type: 'basic' | 'premium' | 'enterprise';
  name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  description: string;
  features: {
    max_saved_searches: number;
    priority_notifications: boolean;
    advanced_filters: boolean;
    property_alerts: boolean;
    analytics_access: boolean;
    verified_contact: boolean;
    priority_support: boolean;
    bulk_operations: boolean;
    premium_badge: boolean;
  };
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  onSelect?: (plan: SubscriptionPlan) => void;
  style?: ViewStyle;
  theme?: DesignSystemTheme;
}

export function SubscriptionCard({
  plan,
  isSelected = false,
  isCurrentPlan = false,
  isPopular = false,
  billingCycle = 'monthly',
  onSelect,
  style,
  theme: customTheme,
}: SubscriptionCardProps) {
  const colorScheme = useColorScheme();
  const theme = customTheme || createTheme(colorScheme === 'dark');

  const getFeatureList = (): SubscriptionFeature[] => {
    const { features } = plan;
    
    return [
      {
        name: features.max_saved_searches === -1 
          ? 'Unlimited saved searches' 
          : `${features.max_saved_searches} saved searches`,
        included: features.max_saved_searches > 0,
        isHighlight: features.max_saved_searches === -1,
      },
      {
        name: 'Property alerts',
        included: features.property_alerts,
      },
      {
        name: 'Priority notifications',
        included: features.priority_notifications,
        isHighlight: features.priority_notifications,
      },
      {
        name: 'Advanced filters',
        included: features.advanced_filters,
        isHighlight: features.advanced_filters,
      },
      {
        name: 'Analytics access',
        included: features.analytics_access,
        isHighlight: features.analytics_access,
      },
      {
        name: 'Verified contact',
        included: features.verified_contact,
        isHighlight: features.verified_contact,
      },
      {
        name: 'Priority support',
        included: features.priority_support,
        isHighlight: features.priority_support,
      },
      {
        name: 'Bulk operations',
        included: features.bulk_operations,
        isHighlight: features.bulk_operations,
      },
      {
        name: 'Premium badge',
        included: features.premium_badge,
        isHighlight: features.premium_badge,
      },
    ];
  };

  const getCurrentPrice = () => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getMonthlySavings = () => {
    if (billingCycle === 'yearly') {
      const monthlyCost = plan.price_yearly / 12;
      const savings = plan.price_monthly - monthlyCost;
      return Math.round(savings);
    }
    return 0;
  };

  const getPlanVariant = () => {
    switch (plan.type) {
      case 'premium':
        return 'premium';
      case 'enterprise':
        return 'enterprise';
      default:
        return 'verified';
    }
  };

  const cardStyle: ViewStyle = {
    ...CommonStyles.card(theme),
    borderWidth: 2,
    borderColor: isSelected 
      ? Colors.primary[500] 
      : isCurrentPlan 
        ? Colors.success[500] 
        : 'transparent',
    position: 'relative',
    marginBottom: Spacing.md,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  };

  const titleStyle: TextStyle = {
    ...Typography.heading.h3,
    color: theme.colors.text,
    marginBottom: Spacing.xs,
  };

  const descriptionStyle: TextStyle = {
    ...Typography.body.medium,
    color: theme.colors.textSecondary,
    marginBottom: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  };

  const priceContainerStyle: ViewStyle = {
    alignItems: 'flex-end',
  };

  const priceStyle: TextStyle = {
    ...Typography.heading.h2,
    color: Colors.primary[600],
    fontWeight: '700',
  };

  const pricePeriodStyle: TextStyle = {
    ...Typography.label.medium,
    color: theme.colors.textSecondary,
  };

  const savingsStyle: TextStyle = {
    ...Typography.caption.large,
    color: Colors.success[600],
    fontWeight: '600',
    marginTop: Spacing.xs / 2,
  };

  const featuresContainerStyle: ViewStyle = {
    marginTop: Spacing.md,
  };

  const featureTitleStyle: TextStyle = {
    ...Typography.label.large,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  };

  const featureItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  };

  const featureIconStyle: TextStyle = {
    fontSize: 16,
    marginRight: Spacing.sm,
    width: 20,
    textAlign: 'center',
  };

  const featureTextStyle: TextStyle = {
    ...Typography.body.medium,
    flex: 1,
  };

  const buttonStyle: ViewStyle = {
    ...CommonStyles.button(theme, isCurrentPlan ? 'secondary' : 'primary'),
    marginTop: Spacing.lg,
    opacity: isCurrentPlan ? 0.6 : 1,
  };

  const buttonTextStyle: TextStyle = {
    ...Typography.label.large,
    color: isCurrentPlan ? theme.colors.text : '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  };

  const features = getFeatureList();
  const currentPrice = getCurrentPrice();
  const savings = getMonthlySavings();

  return (
    <TouchableOpacity 
      style={[cardStyle, style]}
      onPress={() => !isCurrentPlan && onSelect?.(plan)}
      disabled={isCurrentPlan}
      activeOpacity={0.7}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={headerStyle}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
            <Text style={titleStyle}>{plan.name}</Text>
            {plan.type !== 'basic' && (
              <View style={{ marginLeft: Spacing.sm }}>
                <PremiumBadge 
                  variant={getPlanVariant()} 
                  size="small"
                  theme={theme}
                />
              </View>
            )}
          </View>
          <Text style={descriptionStyle}>{plan.description}</Text>
        </View>

        <View style={priceContainerStyle}>
          <Text style={priceStyle}>
            {plan.currency}{currentPrice}
          </Text>
          <Text style={pricePeriodStyle}>
            /{billingCycle === 'yearly' ? 'year' : 'month'}
          </Text>
          {savings > 0 && (
            <Text style={savingsStyle}>
              Save {plan.currency}{savings}/month
            </Text>
          )}
        </View>
      </View>

      <View style={featuresContainerStyle}>
        <Text style={featureTitleStyle}>Features included:</Text>
        {features.map((feature, index) => (
          <View key={index} style={featureItemStyle}>
            <Text style={[
              featureIconStyle,
              { color: feature.included ? Colors.success[600] : Colors.error[500] }
            ]}>
              {feature.included ? '✓' : '✗'}
            </Text>
            <Text style={[
              featureTextStyle,
              { 
                color: feature.included 
                  ? feature.isHighlight 
                    ? Colors.primary[600] 
                    : theme.colors.text
                  : theme.colors.textSecondary,
                fontWeight: feature.isHighlight ? '600' : 'normal',
              }
            ]}>
              {feature.name}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={buttonStyle}
        onPress={() => !isCurrentPlan && onSelect?.(plan)}
        disabled={isCurrentPlan}
      >
        <Text style={buttonTextStyle}>
          {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: Colors.warning[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  popularText: {
    ...Typography.caption.large,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SubscriptionCard;