import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSubscriptionStore, SubscriptionStatus as Status } from '@/store/subscriptionStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

export const SubscriptionStatus: React.FC = () => {
  const {
    subscription,
    isSubscribed,
    features,
    savedSearchCount,
    maxSavedSearches,
    fetchActiveSubscription,
    cancelSubscription,
  } = useSubscriptionStore();

  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    fetchActiveSubscription();
  }, []);

  const handleCancelSubscription = () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(subscription.id);
              Alert.alert('Success', 'Your subscription has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (!subscription) return '#6B7280';
    
    switch (subscription.status) {
      case Status.ACTIVE:
        return '#10B981';
      case Status.EXPIRED:
        return '#EF4444';
      case Status.CANCELLED:
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    if (!subscription) return 'No active subscription';
    
    switch (subscription.status) {
      case Status.ACTIVE:
        return 'Active';
      case Status.EXPIRED:
        return 'Expired';
      case Status.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    const expiryDate = new Date(subscription.expires_at);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Subscription Status</ThemedText>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/subscriptions/index')}
        >
          <Ionicons name="arrow-up-outline" size={16} color={primaryColor} />
          <ThemedText style={[styles.upgradeButtonText, { color: primaryColor }]}>
            Upgrade
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </ThemedText>
        </View>

        {subscription ? (
          <View style={styles.subscriptionDetails}>
            <ThemedText style={styles.planName}>
              {subscription.subscription_type.toUpperCase()} Plan
            </ThemedText>
            
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Started:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatDate(subscription.starts_at)}
              </ThemedText>
            </View>
            
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Expires:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatDate(subscription.expires_at)}
              </ThemedText>
            </View>
            
            {subscription.status === Status.ACTIVE && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Days remaining:</ThemedText>
                <ThemedText style={[
                  styles.detailValue,
                  { color: getDaysRemaining() < 7 ? '#EF4444' : getStatusColor() }
                ]}>
                  {getDaysRemaining()} days
                </ThemedText>
              </View>
            )}
            
            {subscription.amount_paid && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Amount paid:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {subscription.currency} {subscription.amount_paid}
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <ThemedText style={styles.noSubscriptionText}>
            You don't have an active subscription. Upgrade to unlock premium features.
          </ThemedText>
        )}
      </View>

      {features && (
        <View style={styles.featuresCard}>
          <ThemedText style={styles.featuresTitle}>Your Features</ThemedText>
          
          <View style={styles.featureItem}>
            <Ionicons name="search-outline" size={20} color={primaryColor} />
            <ThemedText style={styles.featureText}>
              Saved searches: {savedSearchCount}/{features.max_saved_searches === -1 ? '∞' : features.max_saved_searches}
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons 
              name={features.priority_notifications ? "notifications" : "notifications-outline"} 
              size={20} 
              color={features.priority_notifications ? primaryColor : '#9CA3AF'} 
            />
            <ThemedText style={[
              styles.featureText,
              { opacity: features.priority_notifications ? 1 : 0.5 }
            ]}>
              Priority notifications
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons 
              name={features.advanced_filters ? "options" : "options-outline"} 
              size={20} 
              color={features.advanced_filters ? primaryColor : '#9CA3AF'} 
            />
            <ThemedText style={[
              styles.featureText,
              { opacity: features.advanced_filters ? 1 : 0.5 }
            ]}>
              Advanced filters
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons 
              name={features.property_alerts ? "alert-circle" : "alert-circle-outline"} 
              size={20} 
              color={features.property_alerts ? primaryColor : '#9CA3AF'} 
            />
            <ThemedText style={[
              styles.featureText,
              { opacity: features.property_alerts ? 1 : 0.5 }
            ]}>
              Property alerts
            </ThemedText>
          </View>
          
          {features.analytics_access && (
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color={primaryColor} />
              <ThemedText style={styles.featureText}>
                Analytics dashboard
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {subscription && subscription.status === Status.ACTIVE && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelSubscription}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel Subscription</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionDetails: {
    marginTop: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  noSubscriptionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  featuresCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});