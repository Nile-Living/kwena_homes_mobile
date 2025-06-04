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
  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<'idle' | 'initiated' | 'otp-required' | 'processing' | 'completed' | 'failed'>(
    'idle',
  );
  const [currentProvider, setCurrentProvider] = useState<string>('');

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const token = useAuthStore.getState().session?.access_token;
        const response = await fetch(`${API_BASE_URL}/payments/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCurrentProvider(data.provider);
      } catch (error) {
        console.error('Error checking provider:', error);
      }
    };

    if (visible) {
      checkProvider();
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
      Alert.alert(
        'Error',
        'Please enter a valid Zambian Mobile Money number.',
      );
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
          operator: 'mtn', // Or dynamically determine
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
        Alert.alert(
          'OTP Required',
          'Please enter the OTP sent to your phone.',
        );
      } else if (data.status === 'successful') {
        setPaymentStatus('completed');
        Alert.alert(
          'Success',
          'Payment successful! Your subscription is now active.',
        );
        onPaymentSuccess(data.reference);
        resetModal();
        onClose();
      } else if (data.status === 'pay-offline') {
        setPaymentStatus('processing');
        Alert.alert(
          'Authorization Required',
          'Please authorize the payment on your mobile phone. We will verify the status.',
        );
        // Optionally start polling here or rely on webhook
      } else if (data.status === 'pending') {
        setPaymentStatus('processing');
        Alert.alert(
          'Payment Pending',
          'Your payment is pending. We will verify the status.',
        );
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
        setPaymentStatus('processing'); // Or a specific status like 'awaiting-auth'
        Alert.alert(
          'Authorization Required',
          'OTP accepted. Please authorize the payment on your mobile phone to complete.',
        );
        // Optionally start polling or inform user to check status later
        resetModal(); // Reset OTP part
        onClose(); // Close modal, user authorizes externally
      } else {
        setPaymentStatus('failed'); // Or back to 'otp-required' if OTP was wrong
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
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => {
              resetModal();
              onClose();
            }}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Complete Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="flex-1 p-4">
          {paymentStatus !== 'otp-required' ? (
            <View>
              <View className="bg-blue-50 p-4 rounded-lg mb-6">
                <Text className="text-blue-800 font-semibold text-lg mb-2">
                  Monthly Subscription
                </Text>
                <Text className="text-blue-600 text-2xl font-bold">
                  K129.00
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Mobile Money Number (Lenco)
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 0977123456"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  maxLength={10}
                  editable={!loading && paymentStatus !== 'processing'}
                />
              </View>

              <TouchableOpacity
                onPress={handleInitiateLencoPayment}
                disabled={loading || paymentStatus === 'processing'}
                className={`p-4 rounded-lg ${
                  loading || paymentStatus === 'processing'
                    ? 'bg-gray-300'
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
              <View className="bg-green-50 p-4 rounded-lg mb-6">
                <Text className="text-green-800 font-semibold text-lg mb-2">
                  Enter OTP
                </Text>
                <Text className="text-green-600">
                  Please enter the OTP sent to {phone}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  keyboardType="numeric"
                  maxLength={6}
                  className="border border-gray-300 rounded-lg p-3 text-base text-center text-xl"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                onPress={handleLencoOtpSubmit}
                disabled={loading}
                className={`p-4 rounded-lg ${
                  loading ? 'bg-gray-300' : 'bg-green-500'
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
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-600 mt-2">Processing payment...</Text>
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
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="business-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            For Users Only
          </Text>
          <Text className="text-gray-600 text-center">
            Subscriptions are available for regular users only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">
            Loading subscription details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Subscription
          </Text>

          {isSubscribed && subscription ? (
            <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Active Subscription
                  </Text>
                  <Text className="text-green-600 font-medium">
                    {subscription.subscription_type.toUpperCase()} PLAN
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-800 font-medium text-sm">
                    ACTIVE
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-200 pt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Started</Text>
                  <Text className="text-gray-900">
                    {new Date(subscription.starts_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-600">Expires</Text>
                  <Text className="text-gray-900">
                    {new Date(subscription.expires_at).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleCancelSubscription}
                  className="bg-red-500 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <View className="items-center mb-6">
                <Ionicons name="star" size={48} color="#F59E0B" />
                <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                  Unlock Premium Features
                </Text>
                <Text className="text-gray-600 text-center">
                  Get notified about new properties and save your searches
                </Text>
              </View>

              <View className="bg-blue-50 p-4 rounded-lg mb-6">
                <Text className="text-blue-800 font-bold text-3xl text-center mb-2">
                  K129.00
                </Text>
                <Text className="text-blue-600 text-center">per month</Text>
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  What you'll get:
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">
                        Save Up to 5 Searches
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        Save your favorite search criteria for quick access
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">
                        Property Alerts
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        Get instant notifications when new properties match your
                        searches
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowPaymentModal(true)}
                className="bg-blue-500 p-4 rounded-lg"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Subscribe Now - K129/month
                </Text>
              </TouchableOpacity>

              <Text className="text-gray-500 text-xs text-center mt-3">
                Cancel anytime. No long-term commitments.
              </Text>
            </View>
          )}

          {features && isSubscribed && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Your Benefits
              </Text>

              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Saved Searches</Text>
                  <Text className="text-gray-900 font-medium">
                    {features.max_saved_searches === -1
                      ? 'Unlimited'
                      : features.max_saved_searches}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Property Alerts</Text>
                  <Ionicons
                    name={
                      features.property_alerts
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={20}
                    color={features.property_alerts ? '#10B981' : '#EF4444'}
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">
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
                      features.priority_notifications ? '#10B981' : '#EF4444'
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