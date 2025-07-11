import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { RoleBasedSubscriptionPlans } from '@/components/subscription/RoleBasedSubscriptionPlans';
import { ThemedView } from '@/components/ThemedView';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Subscriptions',
            headerShown: true,
          }}
        />
        <ThemedView style={styles.content}>
          <View style={styles.authRequired}>
            <Ionicons name="lock-closed-outline" size={64} color="#6B7280" />
            <Text style={styles.authTitle}>Authentication Required</Text>
            <Text style={styles.authDescription}>
              Please sign in to manage your subscription and access premium features.
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => {
                Alert.alert(
                  'Sign In Required',
                  'You need to sign in to access subscription management.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Sign In', 
                      onPress: () => router.push('/auth/signin')
                    }
                  ]
                );
              }}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Subscriptions',
          headerShown: true,
        }}
      />
      <ThemedView style={styles.content}>
        <RoleBasedSubscriptionPlans />
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
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  authDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#ED9B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});