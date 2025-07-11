import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PremiumFeatureGuard } from '@/components/subscription/PremiumFeatureGuard';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AnalyticsData {
  userStats: {
    totalViews: number;
    totalSaves: number;
    totalContacts: number;
    totalSearches: number;
    uniquePropertiesViewed: number;
  };
  recentActivity: {
    date: string;
    event_type: string;
    property_id?: string;
    metadata?: any;
  }[];
  topProperties: {
    property_id: string;
    property_title: string;
    views: number;
    saves: number;
    contacts: number;
  }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const { session, user } = useAuthStore();
  const { isSubscribed, features } = useSubscriptionStore();
  const primaryColor = useThemeColor({}, 'tint');
  
  // Determine if user is an agent
  const isAgent = user?.user_metadata?.role === 'agent' || user?.app_metadata?.role === 'agent';
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    if (!session?.access_token) return;

    try {
      // Use different endpoints based on user role
      const endpoint = isAgent ? '/analytics/agent-stats' : '/analytics/user-stats';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isSubscribed && features?.analytics_access) {
      fetchAnalyticsData();
    }
  }, [isSubscribed, features?.analytics_access]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
    </View>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getActivityIcon = () => {
      switch (activity.event_type) {
        case 'PROPERTY_VIEW':
          return 'eye';
        case 'PROPERTY_SAVE':
          return 'bookmark';
        case 'PROPERTY_CONTACT':
          return 'call';
        case 'PROPERTY_SHARE':
          return 'share';
        case 'SEARCH_PERFORMED':
          return 'search';
        case 'PROFILE_UPDATE':
          return 'person';
        default:
          return 'analytics';
      }
    };

    const getActivityText = () => {
      switch (activity.event_type) {
        case 'PROPERTY_VIEW':
          return 'Viewed a property';
        case 'PROPERTY_SAVE':
          return 'Saved a property';
        case 'PROPERTY_CONTACT':
          return 'Contacted about a property';
        case 'PROPERTY_SHARE':
          return 'Shared a property';
        case 'SEARCH_PERFORMED':
          return 'Performed a search';
        case 'PROFILE_UPDATE':
          return 'Updated profile';
        default:
          return 'Unknown activity';
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Ionicons name={getActivityIcon() as any} size={16} color={primaryColor} />
        </View>
        <View style={styles.activityContent}>
          <ThemedText style={styles.activityText}>{getActivityText()}</ThemedText>
          <ThemedText style={styles.activityDate}>
            {new Date(activity.date).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
    );
  };

  const PropertyItem = ({ property }: { property: any }) => (
    <View style={styles.propertyItem}>
      <ThemedText style={styles.propertyTitle} numberOfLines={1}>
        {property.property_title}
      </ThemedText>
      <View style={styles.propertyStats}>
        <View style={styles.propertyStat}>
          <Ionicons name="eye" size={14} color="#6B7280" />
          <ThemedText style={styles.propertyStatText}>{property.views}</ThemedText>
        </View>
        <View style={styles.propertyStat}>
          <Ionicons name="bookmark" size={14} color="#6B7280" />
          <ThemedText style={styles.propertyStatText}>{property.saves}</ThemedText>
        </View>
        <View style={styles.propertyStat}>
          <Ionicons name="call" size={14} color="#6B7280" />
          <ThemedText style={styles.propertyStatText}>{property.contacts}</ThemedText>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <ThemedText style={styles.loadingText}>Loading analytics...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <PremiumFeatureGuard feature="analytics_access">
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>
            {isAgent ? 'Property Analytics' : 'My Activity Analytics'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isAgent 
              ? 'Track your property performance and leads'
              : 'Track your property search activity and insights'
            }
          </ThemedText>
        </ThemedView>

        {data && (
          <>
            <View style={styles.statsContainer}>
              <StatCard
                title={isAgent ? "Property Views" : "Properties Viewed"}
                value={data.userStats.totalViews}
                icon="eye"
                color="#3B82F6"
              />
              <StatCard
                title={isAgent ? "Properties Saved" : "Saved Properties"}
                value={data.userStats.totalSaves}
                icon="bookmark"
                color="#10B981"
              />
              <StatCard
                title={isAgent ? "Leads Generated" : "Contacts Made"}
                value={data.userStats.totalContacts}
                icon="call"
                color="#F59E0B"
              />
              <StatCard
                title={isAgent ? "Property Listings" : "Searches"}
                value={data.userStats.totalSearches}
                icon={isAgent ? "home" : "search"}
                color="#8B5CF6"
              />
            </View>

            <View style={styles.uniquePropertiesCard}>
              <ThemedText style={styles.uniquePropertiesTitle}>
                {isAgent ? 'Total Active Listings' : 'Unique Properties Viewed'}
              </ThemedText>
              <ThemedText style={[styles.uniquePropertiesValue, { color: primaryColor }]}>
                {data.userStats.uniquePropertiesViewed}
              </ThemedText>
            </View>

            {data.recentActivity.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {isAgent ? 'Recent Property Activity' : 'Recent Activity'}
                </ThemedText>
                <View style={styles.activityContainer}>
                  {data.recentActivity.slice(0, 10).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </View>
              </View>
            )}

            {data.topProperties.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {isAgent ? 'Top Performing Properties' : 'Top Properties'}
                </ThemedText>
                <View style={styles.propertiesContainer}>
                  {data.topProperties.map((property, index) => (
                    <PropertyItem key={index} property={property} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </PremiumFeatureGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  uniquePropertiesCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  uniquePropertiesTitle: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  uniquePropertiesValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  activityContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  propertiesContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
  },
  propertyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  propertyStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyStatText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
});