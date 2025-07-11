import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SavedSearches } from '@/components/search/SavedSearches';
import { ThemedView } from '@/components/ThemedView';
import { SavedSearchGuard } from '@/components/subscription/PremiumFeatureGuard';

export default function SavedSearchesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Saved Searches',
          headerShown: true,
        }}
      />
      <ThemedView style={styles.content}>
        <SavedSearchGuard>
          <SavedSearches />
        </SavedSearchGuard>
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