import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ThemedView } from '@/components/ThemedView';
import { PremiumFeatureGuard } from '@/components/subscription/PremiumFeatureGuard';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerShown: true,
        }}
      />
      <ThemedView style={styles.content}>
        <PremiumFeatureGuard feature="analytics_access">
          <AnalyticsDashboard />
        </PremiumFeatureGuard>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});