import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SubscriptionPlan, SubscriptionType } from '@/store/subscriptionStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isActive?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  isActive = false,
  onSelect,
  isCurrentPlan = false,
}) => {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const getPlanColor = () => {
    switch (plan.type) {
      case SubscriptionType.BASIC:
        return '#3B82F6';
      case SubscriptionType.PREMIUM:
        return '#F59E0B';
      case SubscriptionType.ENTERPRISE:
        return '#10B981';
      default:
        return primaryColor;
    }
  };

  const getPlanIcon = () => {
    switch (plan.type) {
      case SubscriptionType.BASIC:
        return 'person-outline';
      case SubscriptionType.PREMIUM:
        return 'star-outline';
      case SubscriptionType.ENTERPRISE:
        return 'business-outline';
      default:
        return 'person-outline';
    }
  };

  return (
    <ThemedView style={[
      styles.container,
      { 
        borderColor: isActive ? getPlanColor() : '#E5E7EB',
        backgroundColor: isActive ? `${getPlanColor()}10` : backgroundColor,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={getPlanIcon() as any} 
            size={24} 
            color={getPlanColor()} 
          />
          <ThemedText style={[styles.title, { color: getPlanColor() }]}>
            {plan.name}
          </ThemedText>
        </View>
        {isCurrentPlan && (
          <View style={[styles.currentBadge, { backgroundColor: getPlanColor() }]}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}
      </View>

      <ThemedText style={styles.description}>
        {plan.description}
      </ThemedText>

      <View style={styles.priceContainer}>
        <ThemedText style={[styles.price, { color: getPlanColor() }]}>
          K{plan.price_monthly}
        </ThemedText>
        <ThemedText style={styles.priceUnit}>
          /month
        </ThemedText>
      </View>

      <View style={styles.featuresContainer}>
        <FeatureItem
          icon="search-outline"
          text={`${plan.features.max_saved_searches === -1 ? 'Unlimited' : plan.features.max_saved_searches} saved searches`}
          included={true}
        />
        <FeatureItem
          icon="notifications-outline"
          text="Priority notifications"
          included={plan.features.priority_notifications}
        />
        <FeatureItem
          icon="options-outline"
          text="Advanced filters"
          included={plan.features.advanced_filters}
        />
        <FeatureItem
          icon="alert-circle-outline"
          text="Property alerts"
          included={plan.features.property_alerts}
        />
        {plan.features.analytics_access && (
          <FeatureItem
            icon="analytics-outline"
            text="Analytics dashboard"
            included={true}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          { 
            backgroundColor: isActive ? getPlanColor() : 'transparent',
            borderColor: getPlanColor(),
          }
        ]}
        onPress={() => onSelect(plan)}
        disabled={isCurrentPlan}
      >
        <ThemedText style={[
          styles.selectButtonText,
          { 
            color: isActive ? 'white' : getPlanColor(),
            opacity: isCurrentPlan ? 0.6 : 1
          }
        ]}>
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

interface FeatureItemProps {
  icon: string;
  text: string;
  included: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, included }) => {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.featureItem}>
      <Ionicons
        name={included ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={included ? '#10B981' : '#EF4444'}
      />
      <ThemedText style={[
        styles.featureText,
        { 
          color: included ? textColor : '#9CA3AF',
          opacity: included ? 1 : 0.7
        }
      ]}>
        {text}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceUnit: {
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.7,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  selectButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});