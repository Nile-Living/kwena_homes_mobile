// app/(tabs)/promote/[propertyId]/status.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/Config';
import { useStore as usePropertyStore } from '@/store/useStore';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    paymentReference: string;
    propertyId: string;
    propertyTitle?: string;
    initialStatus?: string;
  }>();

  const refreshProperty = usePropertyStore(
    (state) => state.refreshPropertyPromotionStatus,
  );

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
          "We couldn't confirm the payment status automatically. Please check your listings page later or contact support if the issue persists.",
          [{ text: 'OK', onPress: () => router.back() }],
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/promotions/verify/${params.paymentReference}`,
          { method: 'POST' },
        );
        const data = await response.json();

        setPollCount((prev) => prev + 1);
        setStatus(data.status);

        if (data.status === 'successful') {
          setIsPolling(false);
          await refreshProperty(params.propertyId);
          setTimeout(() => {
            router.replace({
              pathname: '/promoted/success',
              params: {
                propertyId: params.propertyId,
                propertyTitle: params.propertyTitle,
              },
            });
          }, 1500);
        } else if (data.status === 'failed') {
          setIsPolling(false);
          setTimeout(() => {
            router.replace({
              pathname: '/promoted/failed',
              params: {
                propertyId: params.propertyId,
                reason: data.message || 'Payment has failed.',
              },
            });
          }, 1500);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
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
          message: 'Your property promotion is now active. Redirecting...',
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
            "Please check your phone for a USSD prompt to authorize the payment. We're checking the status automatically.",
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
          message: 'Please wait while we confirm your payment status...',
          showSpinner: true,
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.statusIconContainer}>
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

        <Text style={styles.title}>{statusDisplay.title}</Text>
        <Text style={styles.message}>{statusDisplay.message}</Text>

        {isPolling && (
          <Text style={styles.pollCount}>
            Status check: {pollCount} / {maxPolls}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  pollCount: {
    marginTop: 24,
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  closeButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});