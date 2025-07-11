import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscriptionStore, SubscriptionPlan } from '@/store/subscriptionStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { router } from 'expo-router';

export const SubscriptionPlans: React.FC = () => {
  const {
    plans,
    subscription,
    loadingPlans,
    error,
    fetchSubscriptionPlans,
    fetchActiveSubscription,
  } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchSubscriptionPlans();
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

  if (loadingPlans) {
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
        <ThemedText style={styles.title}>Choose Your Plan</ThemedText>
        <ThemedText style={styles.subtitle}>
          Unlock premium features and enhance your property search experience
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
});