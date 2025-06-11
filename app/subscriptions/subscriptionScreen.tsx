import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useSubscriptionStore,
  SubscriptionType,
} from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/constants/Config';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (reference: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<
    | 'idle'
    | 'initiated'
    | 'otp-required'
    | 'processing'
    | 'completed'
    | 'failed'
  >('idle');
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (visible) {
      resetModal();
    }
  }, [visible]);

  const handleInitiateLencoPayment = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    const mobileRegex = /^0[79][567][0-9]{7}$/;
    if (!mobileRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Zambian Mobile Money number.');
      return;
    }

    setLoading(true);
    setPaymentStatus('initiated');

    try {
      const token = useAuthStore.getState().session?.access_token;
      const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: 1,
          phone: phone,
          method: 'momo',
          operator: 'mtn',
          description: 'Monthly Subscription',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const data = await response.json();
      setPaymentReference(data.reference);

      if (data.status === 'otp-required' || data.requiresOtp) {
        setPaymentStatus('otp-required');
        Alert.alert('OTP Required', 'Please enter the OTP sent to your phone.');
      } else if (data.status === 'successful') {
        setPaymentStatus('completed');
        Alert.alert(
          'Success',
          'Payment successful! Your subscription is now active.',
        );
        onPaymentSuccess(data.reference);
        resetModal();
        onClose();
      } else if (data.status === 'pay-offline' || data.status === 'pending') {
        resetModal();
        onClose();
        router.replace({
          pathname: '/subscriptions/payment-status',
          params: {
            paymentReference: data.reference,
            initialStatus: data.status,
          },
        });
      } else {
        setPaymentStatus('failed');
        Alert.alert(
          'Payment Status',
          data.message || `Payment status: ${data.status}`,
        );
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      Alert.alert('Error', error.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLencoOtpSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    if (!paymentReference) {
      Alert.alert('Error', 'Payment reference missing. Please try again.');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const token = useAuthStore.getState().session?.access_token;
      const response = await fetch(`${API_BASE_URL}/payments/submit-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference: paymentReference,
          otp: otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'OTP submission failed');
      }

      const data = await response.json();

      if (data.status === 'successful') {
        setPaymentStatus('completed');
        Alert.alert(
          'Success',
          'Payment successful! Your subscription is now active.',
        );
        onPaymentSuccess(paymentReference);
        resetModal();
        onClose();
      } else if (data.status === 'pay-offline') {
        resetModal();
        onClose();
        router.replace({
          pathname: '/subscriptions/payment-status',
          params: {
            paymentReference: paymentReference,
            initialStatus: data.status,
          },
        });
      } else {
        setPaymentStatus('failed');
        Alert.alert(
          'Payment Status',
          data.message || `Payment status after OTP: ${data.status}`,
        );
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      Alert.alert('Error', error.message || 'OTP processing failed');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setPhone('');
    setOtp('');
    setPaymentReference('');
    setPaymentStatus('idle');
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        resetModal();
        onClose();
      }}
    >
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <TouchableOpacity
            onPress={() => {
              resetModal();
              onClose();
            }}
          >
            <Ionicons
              name="close"
              size={24}
              color={colorScheme === 'dark' ? colors.slate[400] : colors.slate[600]}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Complete Payment
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 p-4">
          {paymentStatus !== 'otp-required' ? (
            <View>
              <View className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                <Text className="text-blue-800 dark:text-blue-200 font-semibold text-lg mb-2">
                  Monthly Subscription
                </Text>
                <Text className="text-blue-600 dark:text-blue-300 text-2xl font-bold">
                  K129.00
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Money Number (Lenco)
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 0977123456"
                  placeholderTextColor={colors.slate[400]}
                  keyboardType="phone-pad"
                  className="border border-gray-300 dark:border-slate-600 rounded-lg p-3 text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  maxLength={10}
                  editable={!loading && paymentStatus !== 'processing'}
                />
              </View>

              <TouchableOpacity
                onPress={handleInitiateLencoPayment}
                disabled={loading || paymentStatus === 'processing'}
                className={`p-4 rounded-lg active:bg-blue-600 ${
                  loading || paymentStatus === 'processing'
                    ? 'bg-gray-300 dark:bg-slate-600'
                    : 'bg-blue-500'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Pay K129.00
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mb-6">
                <Text className="text-green-800 dark:text-green-200 font-semibold text-lg mb-2">
                  Enter OTP
                </Text>
                <Text className="text-green-600 dark:text-green-300">
                  Please enter the OTP sent to {phone}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP Code
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.slate[400]}
                  keyboardType="numeric"
                  maxLength={6}
                  className="border border-gray-300 dark:border-slate-600 rounded-lg p-3 text-base text-center text-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                onPress={handleLencoOtpSubmit}
                disabled={loading}
                className={`p-4 rounded-lg active:bg-green-600 ${
                  loading ? 'bg-gray-300 dark:bg-slate-600' : 'bg-green-500'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Confirm Payment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {paymentStatus === 'processing' && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color={colors.blue[500]} />
              <Text className="text-gray-600 dark:text-gray-400 mt-2">
                Processing payment...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function SubscriptionScreen() {
  const {
    subscription,
    isSubscribed,
    features,
    loading,
    error,
    fetchActiveSubscription,
    cancelSubscription,
    isUserRole,
  } = useSubscriptionStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (isUserRole()) {
      fetchActiveSubscription();
    }
  }, [isUserRole, fetchActiveSubscription]);

  const handlePaymentSuccess = async (paymentReference: string) => {
    setShowPaymentModal(false);
    try {
      await fetchActiveSubscription();
    } catch (error: any) {
      Alert.alert(
        'Warning',
        'Payment processed but unable to refresh subscription status. Please check your subscription status or contact support.',
      );
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(subscription.id);
              Alert.alert('Success', 'Subscription cancelled successfully');
              fetchActiveSubscription();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to cancel subscription',
              );
            }
          },
        },
      ],
    );
  };

  if (!isUserRole()) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons
            name="business-outline"
            size={64}
            color={colorScheme === 'dark' ? colors.slate[500] : colors.slate[400]}
          />
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-50 mt-4 mb-2">
            For Users Only
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            Subscriptions are available for regular users only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.blue[500]} />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">
            Loading subscription details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: 'Subscription' }} />
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            Subscription
          </Text>

          {isSubscribed && subscription ? (
            <View className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Active Subscription
                  </Text>
                  <Text className="text-green-600 dark:text-green-400 font-medium">
                    {subscription.subscription_type.toUpperCase()} PLAN
                  </Text>
                </View>
                <View className="bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-green-800 dark:text-green-300 font-medium text-sm">
                    ACTIVE
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Started
                  </Text>
                  <Text className="text-gray-900 dark:text-gray-100">
                    {new Date(subscription.starts_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Expires
                  </Text>
                  <Text className="text-gray-900 dark:text-gray-100">
                    {new Date(subscription.expires_at).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleCancelSubscription}
                  className="bg-red-600 active:bg-red-700 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-6">
              <View className="items-center mb-6">
                <Ionicons name="star" size={48} color={colors.amber[400]} />
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-4 mb-2">
                  Unlock Premium Features
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  Get notified about new properties and save your searches
                </Text>
              </View>

              <View className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                <Text className="text-blue-800 dark:text-blue-200 font-bold text-3xl text-center mb-2">
                  K129.00
                </Text>
                <Text className="text-blue-600 dark:text-blue-300 text-center">
                  per month
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  What you'll get:
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.green[500]}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 dark:text-gray-100 font-medium">
                        Save Up to 5 Searches
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        Save your favorite search criteria for quick access
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.green[500]}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 dark:text-gray-100 font-medium">
                        Property Alerts
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        Get instant notifications when new properties match your
                        searches
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowPaymentModal(true)}
                className="bg-blue-500 active:bg-blue-600 p-4 rounded-lg"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Subscribe Now - K129/month
                </Text>
              </TouchableOpacity>

              <Text className="text-gray-500 dark:text-gray-400 text-xs text-center mt-3">
                Cancel anytime. No long-term commitments.
              </Text>
            </View>
          )}

          {features && isSubscribed && (
            <View className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Your Benefits
              </Text>

              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Saved Searches
                  </Text>
                  <Text className="text-gray-900 dark:text-gray-100 font-medium">
                    {features.max_saved_searches === -1
                      ? 'Unlimited'
                      : features.max_saved_searches}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Property Alerts
                  </Text>
                  <Ionicons
                    name={
                      features.property_alerts
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={20}
                    color={
                      features.property_alerts
                        ? colors.green[500]
                        : colors.red[500]
                    }
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Priority Notifications
                  </Text>
                  <Ionicons
                    name={
                      features.priority_notifications
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={20}
                    color={
                      features.priority_notifications
                        ? colors.green[500]
                        : colors.red[500]
                    }
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}