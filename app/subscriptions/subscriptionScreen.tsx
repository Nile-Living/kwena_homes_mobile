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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore, SubscriptionType } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/constants/Config';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (reference: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, onPaymentSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'processing' | 'completed' | 'failed'>('idle');
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('');

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
    }
  }, [visible]);
  
  const handlePayment = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
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
          amount: 129,
          phone: phone,
          method: 'momo', // or 'card'
          operator: 'mtn',
          description: 'Monthly Subscription',
          // Card fields if needed
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const data = await response.json();
      setPaymentReference(data.reference);
      
      if (data.provider === 'ZYNLE') {
        if (data.redirect_url) {
          // Handle card payment redirect
          setRedirectUrl(data.redirect_url);
          setPaymentStatus('processing');
          Alert.alert(
            'Complete Payment',
            'You will be redirected to complete your card payment. Please complete the payment and return to the app.',
            [
              { text: 'Open Payment Page', onPress: () => openRedirectUrl(data.redirect_url) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          // Mobile money - wait for USSD prompt completion
          setPaymentStatus('processing');
          Alert.alert(
            'Complete Payment',
            'Please check your phone for the mobile money prompt and authorize the payment.',
            [{ text: 'OK' }]
          );
          // Start polling for payment status
          startStatusPolling(data.reference);
        }
      } else if (data.provider === 'LENCO') {
        // Handle Lenco OTP flow (existing logic)
        setPaymentStatus('processing');
        // Show OTP input
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const openRedirectUrl = (url: string) => {
    // Use Expo WebBrowser or Linking to open the payment URL
    // You might want to use an in-app browser
    Linking.canOpenURL(url).then((canOpen) => {
      if (canOpen) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the URL');
      }
    }).catch(() => {
      Alert.alert('Error', 'An unexpected error occurred while trying to open the URL');
    });
  };

  const startStatusPolling = (reference: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = useAuthStore.getState().session?.access_token;
        const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'successful') {
            clearInterval(pollInterval);
            setPaymentStatus('completed');
            Alert.alert('Success', 'Payment successful! Your subscription is now active.');
            onPaymentSuccess(reference);
            resetModal();
            onClose();
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setPaymentStatus('failed');
            Alert.alert('Payment Failed', 'Your payment could not be completed.');
          }
          // Continue polling for pending status
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('failed');
        Alert.alert('Timeout', 'Payment verification timed out. Please check your subscription status.');
      }
    }, 300000);
  };

  const resetModal = () => {
    setPhone('');
    setPaymentReference('');
    setPaymentStatus('idle');
    setRedirectUrl('');
    setLoading(false);
  };


  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => { resetModal(); onClose(); }}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Complete Payment</Text>
          <View style={{ width: 24 }} />
        </View>
{/* 
        <View className="flex-1 p-4">
          {!otpRequired ? (
            <View>
              <View className="bg-blue-50 p-4 rounded-lg mb-6">
                <Text className="text-blue-800 font-semibold text-lg mb-2">
                  Monthly Subscription
                </Text>
                <Text className="text-blue-600 text-2xl font-bold">K129.00</Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 0977123456"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg p-3 text-base"
                />
              </View>

              <TouchableOpacity
                onPress={handlePayment}
                disabled={loading}
                className={`p-4 rounded-lg ${loading ? 'bg-gray-300' : 'bg-blue-500'}`}
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
                />
              </View>

              <TouchableOpacity
                onPress={handleOtpSubmit}
                disabled={loading}
                className={`p-4 rounded-lg ${loading ? 'bg-gray-300' : 'bg-green-500'}`}
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
        </View> */}
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
    createSubscription,
    cancelSubscription,
    isUserRole,
  } = useSubscriptionStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isUserRole()) {
      fetchActiveSubscription();
    }
  }, []);

  const handlePaymentSuccess = async (paymentReference: string) => {
    try {
      // Subscription is now automatically created on backend
      // Just refresh the subscription status
      await fetchActiveSubscription();
      Alert.alert('Success', 'Subscription activated successfully!');
    } catch (error: any) {

      try {
        const token = useAuthStore.getState().session?.access_token;
        await fetch(`${API_BASE_URL}/payments/verify/${paymentReference}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchActiveSubscription();
      } catch (verifyError) {
        Alert.alert('Warning', 'Payment processed but unable to verify subscription status. Please contact support if your subscription is not active.');
      }
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to saved searches and notifications.',
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
              Alert.alert('Error', error.message || 'Failed to cancel subscription');
            }
          },
        },
      ]
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
          <Text className="text-gray-600 mt-4">Loading subscription details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Subscription</Text>

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
                  <Text className="text-green-800 font-medium text-sm">ACTIVE</Text>
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
              <View className="text-center mb-6">
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
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">Save Up to 5 Searches</Text>
                      <Text className="text-gray-600 text-sm">
                        Save your favorite search criteria for quick access
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">Property Alerts</Text>
                      <Text className="text-gray-600 text-sm">
                        Get instant notifications when new properties match your searches
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">Priority Support</Text>
                      <Text className="text-gray-600 text-sm">
                        Get faster responses and dedicated customer support
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-900 font-medium">No Ads</Text>
                      <Text className="text-gray-600 text-sm">
                        Enjoy an ad-free browsing experience
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

          {features && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Your Benefits
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Saved Searches</Text>
                  <Text className="text-gray-900 font-medium">
                    {features.max_saved_searches === -1 ? 'Unlimited' : features.max_saved_searches}
                  </Text>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Property Alerts</Text>
                  <Ionicons 
                    name={features.property_alerts ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={features.property_alerts ? "#10B981" : "#EF4444"} 
                  />
                </View>
                
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Priority Notifications</Text>
                  <Ionicons 
                    name={features.priority_notifications ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={features.priority_notifications ? "#10B981" : "#EF4444"} 
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
