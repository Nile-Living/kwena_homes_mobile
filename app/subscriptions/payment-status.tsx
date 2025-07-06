import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/Config';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';

export default function SubscriptionPaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    paymentReference: string;
    initialStatus?: string;
  }>();

  const { fetchActiveSubscription } = useSubscriptionStore();

  const [status, setStatus] = useState(params.initialStatus || 'pending');
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const maxPolls = status === 'pay-offline' ? 20 : 10;
  const pollInterval = status === 'pay-offline' ? 10000 : 3000;

useEffect(() => {
  if (status === 'successful' || status === 'failed') {
    setIsPolling(false);
    return;
  }

  const pollPaymentStatus = async () => {
    if (pollCount >= maxPolls) {
      setIsPolling(false);
      Alert.alert(
        'Status Check Timeout',
        "We couldn't confirm the payment status automatically. Please check your subscription status later or contact support if the issue persists.",
        [{ text: 'OK', onPress: () => router.back() }],
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/verify/${params.paymentReference}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().session?.access_token}`,
          },
        },
      );
      const data = await response.json();

      setPollCount((prev) => prev + 1);
      setStatus(data.status);

      if (data.status === 'successful') {
        setIsPolling(false);
        
        setTimeout(async () => {
          try {
            await fetchActiveSubscription();
            const subscription = useSubscriptionStore.getState().subscription;
            if (subscription && subscription.payment_reference === params.paymentReference) {
              router.replace('/subscriptions/success');
            } else {
              setTimeout(async () => {
                await fetchActiveSubscription();
                router.replace('/subscriptions/success');
              }, 2000);
            }
          } catch (error) {
            console.error('Error refreshing subscription after successful payment:', error);
            router.replace('/subscriptions/success');
          }
        }, 1500);
      } else if (data.status === 'failed') {
        setIsPolling(false);
        setTimeout(() => {
          router.replace({
            pathname: './failed',
            params: {
              reason: data.message || 'Payment has failed.',
            },
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error polling subscription payment status:', error);
      setPollCount((prev) => prev + 1);
    }
  };

  if (isPolling) {
    const intervalId = setInterval(pollPaymentStatus, pollInterval);
    return () => clearInterval(intervalId);
  }
}, [isPolling, pollCount, status]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'successful':
        return {
          icon: 'checkmark-circle',
          color: '#16A34A',
          title: 'Payment Successful!',
          message: 'Your subscription is now active. Redirecting...',
          showSpinner: false,
        };
      case 'failed':
        return {
          icon: 'close-circle',
          color: '#DC2626',
          title: 'Payment Failed',
          message: 'There was an issue with the payment. Redirecting...',
          showSpinner: false,
        };
      case 'pay-offline':
        return {
          icon: 'phone-portrait-outline',
          color: '#F59E0B',
          title: 'Authorize on Your Phone',
          message:
            "Please check your phone for a USSD prompt to authorize the subscription payment. We're checking the status automatically.",
          showSpinner: true,
        };
      case 'otp-required':
        return {
          icon: 'keypad-outline',
          color: '#3B82F6',
          title: 'OTP Required',
          message: 'Please go back and enter the OTP sent to your phone.',
          showSpinner: false,
        };
      default:
        return {
          icon: 'time-outline',
          color: '#6B7280',
          title: 'Processing Payment',
          message:
            'Please wait while we confirm your subscription payment status...',
          showSpinner: true,
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 justify-center items-center px-6">
        <View className="h-20 w-20 justify-center items-center mb-6">
          {statusDisplay.showSpinner ? (
            <ActivityIndicator size={80} color={statusDisplay.color} />
          ) : (
            <Ionicons
              name={statusDisplay.icon as any}
              size={80}
              color={statusDisplay.color}
            />
          )}
        </View>

        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 text-center">
          {statusDisplay.title}
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mt-3 leading-6">
          {statusDisplay.message}
        </Text>

        {isPolling && (
          <Text className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Status check: {pollCount} / {maxPolls}
          </Text>
        )}
      </View>

      <View className="p-6 pb-12 w-full">
        <TouchableOpacity
          className="bg-gray-200 dark:bg-slate-700 active:bg-gray-300 dark:active:bg-slate-600 py-4 rounded-xl items-center"
          onPress={() => router.back()}
        >
          <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}