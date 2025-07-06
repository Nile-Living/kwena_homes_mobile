/**
 * AnalyticsDashboard Component
 * 
 * Displays user engagement analytics for premium subscribers
 * Shows property views, saves, contacts, and other metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  RefreshControl 
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

interface UserEngagementStats {
  total_views: number;
  total_saves: number;
  total_contacts: number;
  total_searches: number;
  unique_properties_viewed: number;
  avg_session_duration: number;
}

interface PropertyStats {
  property_id: string;
  total_views: number;
  total_saves: number;
  total_contacts: number;
  total_shares: number;
  last_viewed: string;
}

interface AnalyticsDashboardProps {
  userStats?: UserEngagementStats;
  topProperties?: PropertyStats[];
  timeRange?: 'last_7_days' | 'last_30_days' | 'last_90_days';
  onTimeRangeChange?: (range: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  theme?: DesignSystemTheme;
}

export function AnalyticsDashboard({
  userStats,
  topProperties = [],
  timeRange = 'last_30_days',
  onTimeRangeChange,
  onRefresh,
  isLoading = false,
  theme: customTheme,
}: AnalyticsDashboardProps) {
  const colorScheme = useColorScheme();
  const theme = customTheme || createTheme(colorScheme === 'dark');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case 'last_7_days':
        return 'Last 7 Days';
      case 'last_90_days':
        return 'Last 90 Days';
      default:
        return 'Last 30 Days';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const headerStyle: ViewStyle = {
    ...CommonStyles.card(theme),
    margin: Spacing.md,
    marginBottom: Spacing.sm,
  };

  const headerTitleStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  };

  const titleStyle: TextStyle = {
    ...Typography.heading.h2,
    color: theme.colors.text,
    flex: 1,
  };

  const timeRangeContainerStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs / 2,
  };

  const timeRangeButtonStyle = (isActive: boolean): ViewStyle => ({
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: isActive ? Colors.primary[500] : 'transparent',
  });

  const timeRangeTextStyle = (isActive: boolean): TextStyle => ({
    ...Typography.caption.large,
    color: isActive ? '#FFFFFF' : theme.colors.textSecondary,
    fontWeight: '500',
  });

  const statsGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  };

  const statCardStyle: ViewStyle = {
    ...CommonStyles.card(theme),
    width: '48%',
    marginBottom: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  };

  const statValueStyle: TextStyle = {
    ...Typography.heading.h1,
    color: Colors.primary[600],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  };

  const statLabelStyle: TextStyle = {
    ...Typography.label.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  };

  const sectionTitleStyle: TextStyle = {
    ...Typography.heading.h3,
    color: theme.colors.text,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  };

  const propertyItemStyle: ViewStyle = {
    ...CommonStyles.card(theme),
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const propertyStatsStyle: ViewStyle = {
    flex: 1,
  };

  const propertyTitleStyle: TextStyle = {
    ...Typography.label.large,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  };

  const propertyMetricsStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
  };

  const metricStyle: TextStyle = {
    ...Typography.caption.medium,
    color: theme.colors.textSecondary,
  };

  const emptyStateStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  };

  const emptyTextStyle: TextStyle = {
    ...Typography.body.large,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  };

  const timeRangeOptions = ['last_7_days', 'last_30_days', 'last_90_days'];

  if (isLoading && !userStats) {
    return (
      <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={[Typography.body.medium, { color: theme.colors.textSecondary, marginTop: Spacing.md }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={containerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={headerStyle}>
        <View style={headerTitleStyle}>
          <Text style={titleStyle}>Analytics Dashboard</Text>
          <PremiumBadge variant="premium" size="small" theme={theme} />
        </View>

        {/* Time Range Selector */}
        <View style={timeRangeContainerStyle}>
          {timeRangeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={timeRangeButtonStyle(option === timeRange)}
              onPress={() => onTimeRangeChange?.(option)}
            >
              <Text style={timeRangeTextStyle(option === timeRange)}>
                {getTimeRangeLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Grid */}
      {userStats ? (
        <View style={statsGridStyle}>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatNumber(userStats.total_views)}</Text>
            <Text style={statLabelStyle}>Property Views</Text>
          </View>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatNumber(userStats.unique_properties_viewed)}</Text>
            <Text style={statLabelStyle}>Unique Properties</Text>
          </View>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatNumber(userStats.total_saves)}</Text>
            <Text style={statLabelStyle}>Properties Saved</Text>
          </View>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatNumber(userStats.total_contacts)}</Text>
            <Text style={statLabelStyle}>Agent Contacts</Text>
          </View>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatNumber(userStats.total_searches)}</Text>
            <Text style={statLabelStyle}>Searches Made</Text>
          </View>
          <View style={statCardStyle}>
            <Text style={statValueStyle}>{formatDuration(userStats.avg_session_duration)}</Text>
            <Text style={statLabelStyle}>Avg. Session</Text>
          </View>
        </View>
      ) : (
        <View style={emptyStateStyle}>
          <Text style={{ fontSize: 48 }}>📊</Text>
          <Text style={emptyTextStyle}>
            Start exploring properties to see your analytics!
          </Text>
        </View>
      )}

      {/* Top Properties */}
      {topProperties.length > 0 && (
        <>
          <Text style={sectionTitleStyle}>Most Viewed Properties</Text>
          {topProperties.map((property, index) => (
            <View key={property.property_id} style={propertyItemStyle}>
              <View style={propertyStatsStyle}>
                <Text style={propertyTitleStyle}>
                  Property #{property.property_id.slice(-6).toUpperCase()}
                </Text>
                <View style={propertyMetricsStyle}>
                  <Text style={metricStyle}>👀 {property.total_views} views</Text>
                  <Text style={metricStyle}>💾 {property.total_saves} saves</Text>
                  <Text style={metricStyle}>📞 {property.total_contacts} contacts</Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
                <Text style={[Typography.heading.h2, { color: Colors.primary[500] }]}>
                  #{index + 1}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

export default AnalyticsDashboard;