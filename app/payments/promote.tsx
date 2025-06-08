import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/Config';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  const [currentLencoReference, setCurrentLencoReference] = useState<
    string | null
  >(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const selectedPlan = useMemo(() => {
    return promotionPlans.find((plan) => plan.id === selectedPlanId) || null;
  }, [selectedPlanId]);

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
    setCurrentLencoReference(null);

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
        setCurrentLencoReference(data.lencoReference);

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

  const renderStepOne = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Promotion Plan</Text>
      <Text style={styles.stepDescription}>
        Select the perfect promotion plan for your property to maximize
        visibility
      </Text>
      <View style={styles.planContainer}>
        {promotionPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlanId(plan.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  isSelected ? ['#4F46E5', '#6366F1'] : ['#F9FAFB', '#F3F4F6']
                }
                style={[
                  styles.planGradient,
                  isSelected && styles.planGradientSelected,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.planHeader}>
                  <Text
                    style={[
                      styles.planDuration,
                      isSelected && styles.planTextSelected,
                    ]}
                  >
                    {plan.duration}
                  </Text>
                  <View
                    style={[
                      styles.badgeContainer,
                      isSelected && styles.badgeContainerSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isSelected && styles.badgeTextSelected,
                      ]}
                    >
                      {plan.description}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.planPrice,
                    isSelected && styles.planTextSelected,
                  ]}
                >
                  {plan.priceLabel}
                </Text>
                <View style={styles.planFeatures}>
                  {plan.features?.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={isSelected ? '#ffffff' : '#4F46E5'}
                        style={styles.featureIcon}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          isSelected && styles.planTextSelected,
                        ]}
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
      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>Continue to Payment</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStepTwo = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.stepContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={handleBackStep}
      >
        <Ionicons name="arrow-back" size={20} color="#4F46E5" />
        <Text style={styles.backButtonText}>Back to Plans</Text>
      </TouchableOpacity>
      <Text style={styles.stepTitle}>Payment Details</Text>
      <Text style={styles.stepDescription}>
        Enter your mobile money number to proceed
      </Text>

      <View style={styles.inputSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Money Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="09XXXXXXXX / 07XXXXXXXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={mobileMoneyNumber}
              onChangeText={setMobileMoneyNumber}
              style={styles.textInput}
              maxLength={10}
              editable={!showOtpInput && !isLoading}
            />
          </View>
          <Text style={styles.inputHelper}>
            We'll send a payment prompt to this number (Lenco Payments)
          </Text>
        </View>

        {showOtpInput && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter OTP</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={20} color="#6B7280" />
              <TextInput
                placeholder="6-digit OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                style={styles.textInput}
                maxLength={6}
                editable={!isLoading}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {selectedPlan?.duration} Promotion
          </Text>
          <Text style={styles.summaryValue}>{selectedPlan?.priceLabel}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>
            {selectedPlan?.priceLabel}
          </Text>
        </View>
      </View>

      {!showOtpInput ? (
        <TouchableOpacity
          style={[styles.payButton, isLoading && styles.payButtonDisabled]}
          onPress={handleInitiatePayment}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                {`Pay ${selectedPlan?.priceLabel}`}
              </Text>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.payButton, isLoading && styles.payButtonDisabled]}
          onPress={handleOtpSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Submit OTP</Text>
              <Ionicons name="key-outline" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.securityContainer}>
        <Ionicons name="lock-closed" size={16} color="#16A34A" />
        <Text style={styles.securityText}>Secured by Lenco Payments</Text>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{ title: 'Promote Listing', headerShown: false }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promote Your Listing</Text>
        <Text style={styles.propertyName} numberOfLines={1}>
          {propertyTitle || `Property #${propertyId}`}
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 ? renderStepOne() : renderStepTwo()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: '#6B7280',
    maxWidth: '90%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  planContainer: {
    marginBottom: 24,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  planCardSelected: {
    elevation: 4,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  planGradient: {
    padding: 20,
    borderRadius: 14,
  },
  planGradientSelected: {},
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  planTextSelected: {
    color: '#FFFFFF',
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
  },
  badgeContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  planFeatures: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginLeft: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1F2937',
  },
  inputHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  payButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
});

export default PromoteScreenEnhanced;