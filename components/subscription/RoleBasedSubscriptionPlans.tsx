import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscriptionStore, SubscriptionPlan } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { router } from 'expo-router';

// Define role-specific plans
const USER_PLANS: SubscriptionPlan[] = [
  {
    type: 'basic' as any,
    name: 'Basic User',
    description: 'Perfect for casual property searching',
    price_monthly: 50,
    price_yearly: 500,
    features: {
      max_saved_searches: 3,
      priority_notifications: false,
      advanced_filters: false,
      property_alerts: true,
      api_rate_limit: 100,
      analytics_access: false,
    },
  },
  {
    type: 'premium' as any,
    name: 'Premium User',
    description: 'Enhanced features for serious property seekers',
    price_monthly: 120,
    price_yearly: 1200,
    features: {
      max_saved_searches: 15,
      priority_notifications: true,
      advanced_filters: true,
      property_alerts: true,
      api_rate_limit: 500,
      analytics_access: true,
    },
  },
];

const AGENT_PLANS: SubscriptionPlan[] = [
  {
    type: 'basic' as any,
    name: 'Basic Agent',
    description: 'Essential tools for new agents',
    price_monthly: 150,
    price_yearly: 1500,
    features: {
      max_saved_searches: 10,
      priority_notifications: true,
      advanced_filters: true,
      property_alerts: true,
      api_rate_limit: 1000,
      analytics_access: true,
    },
  },
  {
    type: 'premium' as any,
    name: 'Professional Agent',
    description: 'Advanced tools for established agents',
    price_monthly: 300,
    price_yearly: 3000,
    features: {
      max_saved_searches: 50,
      priority_notifications: true,
      advanced_filters: true,
      property_alerts: true,
      api_rate_limit: 2000,
      analytics_access: true,
    },
  },
  {
    type: 'enterprise' as any,
    name: 'Agency Enterprise',
    description: 'Full suite for agencies and top agents',
    price_monthly: 500,
    price_yearly: 5000,
    features: {
      max_saved_searches: -1,
      priority_notifications: true,
      advanced_filters: true,
      property_alerts: true,
      api_rate_limit: 5000,
      analytics_access: true,
    },
  },
];

export const RoleBasedSubscriptionPlans: React.FC = () => {
  const { user } = useAuthStore();
  const {
    subscription,
    loading,
    error,
    fetchActiveSubscription,
  } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Determine user role
  const isAgent = user?.user_metadata?.role === 'agent' || user?.app_metadata?.role === 'agent';
  const plans = isAgent ? AGENT_PLANS : USER_PLANS;

  useEffect(() => {
    fetchActiveSubscription();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (subscription?.subscription_type === plan.type) {
      return;
    }

    setSelectedPlan(plan);
    
    Alert.alert(
      'Confirm Subscription',
      `You're about to subscribe to the ${plan.name} plan for K${plan.price_monthly}/month. Continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedPlan(null),
        },
        {
          text: 'Continue',
          onPress: () => {
            router.push({
              pathname: '/payments/promote',
              params: {
                subscriptionType: plan.type,
                amount: plan.price_monthly,
                planName: plan.name,
              },
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <ThemedText style={styles.loadingText}>Loading subscription plans...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Failed to load subscription plans. Please try again.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>
          {isAgent ? 'Agent Subscription Plans' : 'User Subscription Plans'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isAgent 
            ? 'Professional tools to grow your real estate business'
            : 'Unlock premium features and enhance your property search experience'
          }
        </ThemedText>
      </ThemedView>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.type}
            plan={plan}
            isActive={selectedPlan?.type === plan.type}
            onSelect={handleSelectPlan}
            isCurrentPlan={subscription?.subscription_type === plan.type}
          />
        ))}
      </View>

      {subscription && (
        <ThemedView style={styles.currentSubscriptionContainer}>
          <ThemedText style={styles.currentSubscriptionTitle}>
            Current Subscription
          </ThemedText>
          <ThemedText style={styles.currentSubscriptionText}>
            You're currently on the {subscription.subscription_type.toUpperCase()} plan.
          </ThemedText>
          <ThemedText style={styles.currentSubscriptionExpiry}>
            Expires: {new Date(subscription.expires_at).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.roleInfoContainer}>
        <ThemedText style={styles.roleInfoTitle}>
          {isAgent ? 'Agent Benefits' : 'User Benefits'}
        </ThemedText>
        <ThemedText style={styles.roleInfoText}>
          {isAgent 
            ? 'Agent subscriptions include property analytics, lead tracking, and business insights to help grow your real estate business.'
            : 'User subscriptions focus on enhanced search capabilities, property alerts, and personal activity tracking.'
          }
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF4444',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 16,
  },
  plansContainer: {
    marginBottom: 24,
  },
  currentSubscriptionContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentSubscriptionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentSubscriptionExpiry: {
    fontSize: 12,
    opacity: 0.7,
  },
  roleInfoContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  roleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleInfoText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});