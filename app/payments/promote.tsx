import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/Config';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';

interface PromotionPlan {
  id: string;
  duration: string;
  price: number;
  description: string;
  priceLabel: string;
  currency: string;
  features?: string[];
}

const promotionPlans: PromotionPlan[] = [
  {
    id: '7days',
    duration: '7 Days',
    price: 1,
    description: 'Standard Boost',
    priceLabel: 'ZMW 50',
    currency: 'ZMW',
    features: ['10x more views', 'Featured listing', 'Priority in search'],
  },
  {
    id: '14days',
    duration: '14 Days',
    price: 2,
    description: 'Extended Reach',
    priceLabel: 'ZMW 90',
    currency: 'ZMW',
    features: [
      '20x more views',
      'Featured listing',
      'Priority in search',
      'Social media promotion',
    ],
  },
  {
    id: '1month',
    duration: '1 Month',
    price: 3,
    description: 'Maximum Visibility',
    priceLabel: 'ZMW 150',
    currency: 'ZMW',
    features: [
      '50x more views',
      'Featured listing',
      'Priority in search',
      'Social media promotion',
      'Email newsletter feature',
    ],
  },
];

const PromoteScreenEnhanced: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId: string; propertyTitle?: string }>();
  const { colorScheme } = useColorScheme();

  const propertyId = params.propertyId;
  const propertyTitle = params.propertyTitle;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    promotionPlans[0].id,
  );
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPaymentReference, setCurrentPaymentReference] = useState<
    string | null
  >(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const selectedPlan = useMemo(() => {
    return promotionPlans.find((plan) => plan.id === selectedPlanId) || null;
  }, [selectedPlanId]);

  // --- Handlers for API calls (unchanged) ---
  const handleInitiatePayment = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a promotion plan.');
      return;
    }
    if (!propertyId) {
      Alert.alert('Error', 'Property ID is missing.');
      return;
    }
    const mobileRegex = /^0[79][567][0-9]{7}$/;
    if (!mobileMoneyNumber || !mobileRegex.test(mobileMoneyNumber)) {
      Alert.alert(
        'Error',
        'Please enter a valid Zambian Mobile Money number (e.g., 09... / 07...).',
      );
      return;
    }

    setIsLoading(true);
    setShowOtpInput(false);
    setOtp('');
    setCurrentPaymentReference(null);

    try {
      const response = await fetch(`${API_BASE_URL}/promotions/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propertyId,
          planId: selectedPlan.id,
          mobileMoneyNumber: mobileMoneyNumber,
          paymentMethod: 'momo',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPaymentReference(data.paymentReference);

        if (data.status === 'otp-required' || data.requiresOtp) {
          setShowOtpInput(true);
          Alert.alert(
            'OTP Required',
            'Please enter the OTP sent to your phone to complete the payment.',
          );
        } else if (data.status === 'successful') {
          router.replace({
            pathname: '/promoted/success',
            params: {
              propertyId: propertyId,
              propertyTitle: propertyTitle,
            },
          });
        } else if (
          data.status === 'pay-offline' ||
          data.status === 'pending'
        ) {
          router.replace({
            pathname: `/promoted/[propertyId]/status`,
            params: {
              paymentReference: data.paymentReference,
              propertyId: propertyId,
              propertyTitle: propertyTitle,
              initialStatus: data.status,
            },
          });
        } else {
          Alert.alert(
            'Payment Status',
            data.message || `Payment status: ${data.status}`,
          );
        }
      } else {
        if (
          data.message &&
          (data.message.includes('pay-offline') ||
            data.message.includes('pending') ||
            data.message.includes('otp-required')) &&
          data.existingPaymentReference
        ) {
          router.replace({
            pathname: `/promoted/[propertyId]/status`,
            params: {
              paymentReference: data.existingPaymentReference,
              propertyId: propertyId,
              propertyTitle: propertyTitle,
              initialStatus: 'pay-offline',
            },
          });
        } else if (
          data.message &&
          data.message.includes('already has an active promotion')
        ) {
          Alert.alert(
            'Already Promoted',
            'This property already has an active promotion. You can view it in your listings.',
            [
              {
                text: 'View Listings',
                onPress: () => {
                  router.push(`/properties`);
                },
              },
              {
                text: 'OK',
                style: 'cancel',
              },
            ],
          );
        } else {
          Alert.alert(
            'Promotion Failed',
            data.message || 'Failed to initiate promotion.',
          );
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please check your internet connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }
    if (!currentPaymentReference) {
      Alert.alert('Error', 'Payment reference is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: currentPaymentReference,
          otp: otp,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setShowOtpInput(false);
        if (data.status === 'successful') {
          router.replace({
            pathname: '/promoted/success',
            params: {
              propertyId: propertyId,
              propertyTitle: propertyTitle,
            },
          });
        } else {
          router.replace({
            pathname: `/promoted/[propertyId]/status`,
            params: {
              paymentReference: currentPaymentReference,
              propertyId: propertyId,
              propertyTitle: propertyTitle,
              initialStatus: data.status,
            },
          });
        }
      } else {
        Alert.alert(
          'OTP Failed',
          data.message || 'Invalid OTP. Please try again.',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please check your internet connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step Navigation ---
  const handleNextStep = () => {
    if (currentStep === 1 && selectedPlanId) {
      setCurrentStep(2);
    } else if (!selectedPlanId) {
      Alert.alert('Selection Required', 'Please select a promotion plan first.');
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setShowOtpInput(false);
      setOtp('');
    }
  };

  // --- Render Functions ---
  const renderStepOne = () => (
    <View className="p-5">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        Choose Your Promotion Plan
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select the perfect promotion plan for your property to maximize
        visibility
      </Text>
      <View className="mb-6">
        {promotionPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              className={`mb-4 rounded-2xl overflow-hidden border-2 ${
                isSelected
                  ? 'border-indigo-500'
                  : 'border-transparent'
              }`}
              onPress={() => setSelectedPlanId(plan.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isSelected
                    ? [colors.indigo[600], colors.indigo[500]]
                    : colorScheme === 'dark'
                      ? [colors.slate[800], colors.slate[700]]
                      : [colors.gray[50], colors.gray[100]]
                }
                className="p-5"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text
                    className={`text-xl font-bold ${
                      isSelected
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {plan.duration}
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      isSelected
                        ? 'bg-white/20'
                        : 'bg-indigo-100 dark:bg-indigo-500/30'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? 'text-white'
                          : 'text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {plan.description}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`text-3xl font-extrabold mb-4 ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.priceLabel}
                </Text>
                <View className="mt-2">
                  {plan.features?.map((feature, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={isSelected ? colors.white : colors.indigo[500]}
                        className="mr-2"
                      />
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        className="bg-indigo-600 flex-row items-center justify-center py-4 rounded-xl mt-4 active:bg-indigo-700"
        onPress={handleNextStep}
      >
        <Text className="text-base font-semibold text-white mr-2">
          Continue to Payment
        </Text>
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderStepTwo = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="p-5"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableOpacity
        className="flex-row items-center mb-5 self-start py-1"
        onPress={handleBackStep}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={colorScheme === 'dark' ? colors.indigo[400] : colors.indigo[600]}
        />
        <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400 ml-1">
          Back to Plans
        </Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        Payment Details
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter your mobile money number to proceed
      </Text>

      <View className="mb-6">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Mobile Money Number
          </Text>
          <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-4 h-12">
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.slate[500]}
            />
            <TextInput
              placeholder="09XXXXXXXX / 07XXXXXXXX"
              placeholderTextColor={colors.slate[400]}
              keyboardType="phone-pad"
              value={mobileMoneyNumber}
              onChangeText={setMobileMoneyNumber}
              className="flex-1 text-base ml-3 text-gray-900 dark:text-white"
              maxLength={10}
              editable={!showOtpInput && !isLoading}
            />
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            We'll send a payment prompt to this number (Lenco Payments)
          </Text>
        </View>

        {showOtpInput && (
          <View>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Enter OTP
            </Text>
            <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-4 h-12">
              <Ionicons
                name="keypad-outline"
                size={20}
                color={colors.slate[500]}
              />
              <TextInput
                placeholder="6-digit OTP"
                placeholderTextColor={colors.slate[400]}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                className="flex-1 text-base ml-3 text-gray-900 dark:text-white"
                maxLength={6}
                editable={!isLoading}
              />
            </View>
          </View>
        )}
      </View>

      <View className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 mb-6">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Order Summary
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {selectedPlan?.duration} Promotion
          </Text>
          <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {selectedPlan?.priceLabel}
          </Text>
        </View>
        <View className="h-px bg-gray-200 dark:bg-slate-700 my-3" />
        <View className="flex-row justify-between">
          <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Total
          </Text>
          <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {selectedPlan?.priceLabel}
          </Text>
        </View>
      </View>

      {!showOtpInput ? (
        <TouchableOpacity
          className={`rounded-xl py-4 flex-row items-center justify-center mb-4 active:bg-indigo-700 ${
            isLoading
              ? 'bg-indigo-400 dark:bg-indigo-500/50'
              : 'bg-indigo-600'
          }`}
          onPress={handleInitiatePayment}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text className="text-base font-semibold text-white mr-2">
                {`Pay ${selectedPlan?.priceLabel}`}
              </Text>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={colors.white}
              />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`rounded-xl py-4 flex-row items-center justify-center mb-4 active:bg-indigo-700 ${
            isLoading
              ? 'bg-indigo-400 dark:bg-indigo-500/50'
              : 'bg-indigo-600'
          }`}
          onPress={handleOtpSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text className="text-base font-semibold text-white mr-2">
                Submit OTP
              </Text>
              <Ionicons name="key-outline" size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      )}

      <View className="flex-row items-center justify-center">
        <Ionicons name="lock-closed" size={16} color={colors.green[600]} />
        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
          Secured by Lenco Payments
        </Text>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen
        options={{ title: 'Promote Listing', headerShown: false }}
      />
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={
          colorScheme === 'dark' ? colors.slate[800] : colors.white
        }
      />
      <View
        className={`px-5 py-4 border-b bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 ${
          Platform.OS === 'android' ? 'pt-12' : 'pt-4'
        }`}
      >
        <TouchableOpacity
          className="p-1 mb-2 self-start"
          onPress={() => router.back()}
        >
          <Ionicons
            name="close"
            size={24}
            color={
              colorScheme === 'dark' ? colors.slate[200] : colors.slate[800]
            }
          />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          Promote Your Listing
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {propertyTitle || `Property #${propertyId}`}
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 ? renderStepOne() : renderStepTwo()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PromoteScreenEnhanced;