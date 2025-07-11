import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSubscriptionStore, SubscriptionType } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  feature: 'priority_notifications' | 'advanced_filters' | 'property_alerts' | 'analytics_access';
  requiredPlan?: SubscriptionType;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  feature,
  requiredPlan = SubscriptionType.PREMIUM,
  fallback,
  showUpgrade = true,
}) => {
  const { subscription, features, isSubscribed } = useSubscriptionStore();
  const primaryColor = useThemeColor({}, 'tint');
  
  // Check if user is an agent - agents have access to analytics with basic plans
  const { user } = useAuthStore();
  const isAgent = user?.user_metadata?.role === 'agent' || user?.app_metadata?.role === 'agent';

  const hasFeatureAccess = () => {
    if (!isSubscribed || !features) {
      // Special case: agents have access to analytics even without subscription
      if (feature === 'analytics_access' && isAgent) {
        return true;
      }
      return false;
    }
    
    switch (feature) {
      case 'priority_notifications':
        return features.priority_notifications;
      case 'advanced_filters':
        return features.advanced_filters;
      case 'property_alerts':
        return features.property_alerts;
      case 'analytics_access':
        // Agents get analytics access with any subscription, users need premium
        return isAgent ? true : (features.analytics_access || false);
      default:
        return false;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'priority_notifications':
        return 'Priority Notifications';
      case 'advanced_filters':
        return 'Advanced Filters';
      case 'property_alerts':
        return 'Property Alerts';
      case 'analytics_access':
        return 'Analytics Dashboard';
      default:
        return 'Premium Feature';
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'priority_notifications':
        return 'Get notified first about new properties that match your criteria';
      case 'advanced_filters':
        return 'Filter properties by detailed criteria like amenities, property age, and more';
      case 'property_alerts':
        return 'Set up automated alerts for properties matching your requirements';
      case 'analytics_access':
        return 'View detailed analytics and insights about your property search activity';
      default:
        return 'This feature requires a premium subscription';
    }
  };

  const getRequiredPlanName = () => {
    switch (requiredPlan) {
      case SubscriptionType.PREMIUM:
        return 'Premium';
      case SubscriptionType.ENTERPRISE:
        return 'Enterprise';
      default:
        return 'Premium';
    }
  };

  const handleUpgradePress = () => {
    Alert.alert(
      'Upgrade Required',
      `This feature requires a ${getRequiredPlanName()} subscription. Would you like to view our plans?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'View Plans',
          onPress: () => router.push('/subscriptions'),
        },
      ]
    );
  };

  if (hasFeatureAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={32} color={primaryColor} />
      </View>
      
      <ThemedText style={styles.title}>
        {getFeatureTitle()}
      </ThemedText>
      
      <ThemedText style={styles.description}>
        {getFeatureDescription()}
      </ThemedText>
      
      <View style={styles.planRequirement}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <ThemedText style={styles.planRequirementText}>
          Requires {getRequiredPlanName()} Plan
        </ThemedText>
      </View>
      
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
        onPress={handleUpgradePress}
      >
        <ThemedText style={styles.upgradeButtonText}>
          Upgrade Now
        </ThemedText>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
};

export const SavedSearchGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { savedSearchCount, maxSavedSearches } = useSubscriptionStore();
  const primaryColor = useThemeColor({}, 'tint');

  const canSaveMore = maxSavedSearches === -1 || savedSearchCount < maxSavedSearches;

  if (canSaveMore) {
    return <>{children}</>;
  }

  const handleUpgradePress = () => {
    Alert.alert(
      'Saved Search Limit Reached',
      `You've reached your limit of ${maxSavedSearches} saved searches. Upgrade to save more searches.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upgrade',
          onPress: () => router.push('/subscriptions'),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="bookmark" size={32} color={primaryColor} />
      </View>
      
      <ThemedText style={styles.title}>
        Saved Search Limit Reached
      </ThemedText>
      
      <ThemedText style={styles.description}>
        You've used {savedSearchCount} of {maxSavedSearches} saved searches.
        Upgrade to save more searches and never miss a property.
      </ThemedText>
      
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
        onPress={handleUpgradePress}
      >
        <ThemedText style={styles.upgradeButtonText}>
          Upgrade Plan
        </ThemedText>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  planRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
  },
  planRequirementText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#D97706',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});