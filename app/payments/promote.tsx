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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
// Removed Reanimated imports

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
    price: 50,
    description: 'Standard Boost',
    priceLabel: 'ZMW 50',
    currency: 'ZMW',
    features: ['10x more views', 'Featured listing', 'Priority in search'],
  },
  {
    id: '14days',
    duration: '14 Days',
    price: 90,
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
    price: 150,
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

type PaymentMethod = 'mobileMoney' | 'card';

const PromoteScreenEnhanced: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId: string; propertyTitle?: string }>();
  const propertyId = params.propertyId;
  const propertyTitle = params.propertyTitle;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    promotionPlans[0].id,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('mobileMoney');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [currentPaymentReference, setCurrentPaymentReference] = useState<
    string | null
  >(null);

  const [currentStep, setCurrentStep] = useState(1);

  const selectedPlan = useMemo(() => {
    return promotionPlans.find((plan) => plan.id === selectedPlanId) || null;
  }, [selectedPlanId]);

  const handleInitiatePayment = async () => {
    console.log('handleInitiatePayment called');

    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a promotion plan.');
      console.log('Validation failed: No plan selected');
      return;
    }
    if (!propertyId) {
      Alert.alert('Error', 'Property ID is missing.');
      console.log('Validation failed: No propertyId');
      return;
    }

    if (paymentMethod === 'mobileMoney') {
      const mobileRegex = /^0[79][567][0-9]{7}$/;
      if (!mobileMoneyNumber || !mobileRegex.test(mobileMoneyNumber)) {
        Alert.alert(
          'Error',
          'Please enter a valid Zambian Mobile Money number (e.g., 09... / 07...).',
        );
        console.log('Validation failed: Invalid mobile money number');
        return;
      }
    } else if (paymentMethod === 'card') {
      Alert.alert(
        'Not Implemented',
        'Card payment is not yet connected. Please use Mobile Money.',
      );
      return;
    }

    console.log('Validation passed. Initiating payment...');
    setIsLoading(true);
    setCurrentPaymentReference(null);

    try {
      const response = await fetch(`${API_BASE_URL}/promotions/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propertyId,
          planId: selectedPlan.id,
          mobileMoneyNumber: mobileMoneyNumber,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        // Use backend message if available, handle specific errors like Conflict
        if (response.status === 409) { // Conflict
           throw new Error(data.message || 'Promotion conflict detected.');
        }
        throw new Error(data.message || 'Failed to initiate promotion.');
      }

      setCurrentPaymentReference(data.paymentReference);

      // --- Handle final status from backend ---
      if (data.status === 'success') {
        Alert.alert(
          'Promotion Activated!',
          data.message || 'Your listing promotion is now active.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else if (data.status === 'success_activation_failed') {
         Alert.alert(
           'Payment Successful (Activation Issue)',
           data.message || 'Payment confirmed, but activation needs review. Contact support.',
           [{ text: 'OK', onPress: () => router.back() }], // Still go back
         );
      } else if (
        data.status === 'pending' ||
        data.status === 'pay-offline' ||
        data.status === 'otp-required' // Should be handled by backend now, but just in case
      ) {
        // This case is less likely now with backend polling, but keep for robustness
        Alert.alert(
          'Payment Pending',
          data.message ||
            'Payment initiated. Please authorize on your phone. Status will update automatically.',
          [{ text: 'OK' }],
        );
      } else {
        // Handle 'failed', 'timed_out', or other non-successful statuses
        Alert.alert(
          'Payment Failed',
          data.message || `The payment could not be completed (Status: ${data.status}).`,
          [{ text: 'OK' }],
        );
      }
      // --- End Handle final status ---

    } catch (error: any) {
      console.error('Initiation error:', error);
      Alert.alert(
        'Initiation Failed',
        error.message || 'Could not start the payment process.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    setCardNumber(formatted);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setExpiryDate(formatted);
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
    }
  };

  const getCardType = (cardNum: string) => {
    const cleanedNum = cardNum.replace(/\s+/g, '');
    if (/^4/.test(cleanedNum)) return 'Visa';
    if (/^5[1-5]/.test(cleanedNum)) return 'Mastercard';
    if (/^3[47]/.test(cleanedNum)) return 'American Express';
    return '';
  };

  const renderCardIcon = () => {
    const cardType = getCardType(cardNumber);
    if (cardType === 'Visa') {
      return <Ionicons name="card" size={24} color="#1A56DB" />;
    } else if (cardType === 'Mastercard') {
      return <Ionicons name="card" size={24} color="#E53E3E" />;
    } else if (cardType === 'American Express') {
      return <Ionicons name="card" size={24} color="#2D3748" />;
    }
    return <Ionicons name="card-outline" size={24} color="#6B7280" />;
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
        Choose your preferred payment method and complete your purchase
      </Text>
      <View style={styles.paymentMethodsContainer}>
        <TouchableOpacity
          style={[
            styles.paymentMethodTab,
            paymentMethod === 'mobileMoney' && styles.paymentMethodTabActive,
          ]}
          onPress={() => setPaymentMethod('mobileMoney')}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={22}
            color={paymentMethod === 'mobileMoney' ? '#4F46E5' : '#6B7280'}
          />
          <Text
            style={[
              styles.paymentMethodText,
              paymentMethod === 'mobileMoney' && styles.paymentMethodTextActive,
            ]}
          >
            Mobile Money
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethodTab,
            paymentMethod === 'card' && styles.paymentMethodTabActive,
          ]}
          onPress={() => setPaymentMethod('card')}
        >
          <Ionicons
            name="card-outline"
            size={22}
            color={paymentMethod === 'card' ? '#4F46E5' : '#6B7280'}
          />
          <Text
            style={[
              styles.paymentMethodText,
              paymentMethod === 'card' && styles.paymentMethodTextActive,
            ]}
          >
            Credit/Debit Card
          </Text>
        </TouchableOpacity>
      </View>
      {paymentMethod === 'mobileMoney' ? (
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
                editable={true}
              />
            </View>
            <Text style={styles.inputHelper}>
              We'll send a payment prompt to this number
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.inputSection}>
          <View style={styles.cardPreview}>
            <LinearGradient
              colors={['#4F46E5', '#6366F1', '#818CF8']}
              style={styles.cardBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardLabel}>Credit/Debit Card</Text>
                <Ionicons name="wifi-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.cardNumberRow}>
                <Text style={styles.cardNumberText}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
              </View>
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardHolderLabel}>Card Holder</Text>
                  <Text style={styles.cardHolderName}>
                    {cardholderName || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardExpiryLabel}>Expires</Text>
                  <Text style={styles.cardExpiryDate}>
                    {expiryDate || 'MM/YY'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputContainer}>
              {renderCardIcon()}
              <TextInput
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={formatCardNumber}
                style={styles.textInput}
                maxLength={19}
                editable={true}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                placeholder="Name as it appears on card"
                placeholderTextColor="#9CA3AF"
                value={cardholderName}
                onChangeText={setCardholderName}
                style={styles.textInput}
                autoCapitalize="words"
                editable={true}
              />
            </View>
          </View>
          <View style={styles.rowInputContainer}>
            <View style={styles.flexInput}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                  style={styles.textInput}
                  maxLength={5}
                  editable={true}
                />
              </View>
            </View>
            <View style={styles.flexInput}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="123"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={setCvv}
                  style={styles.textInput}
                  maxLength={4}
                  secureTextEntry
                  editable={true}
                />
              </View>
            </View>
          </View>
        </View>
      )}
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
      <View style={styles.securityContainer}>
        <Ionicons name="lock-closed" size={16} color="#16A34A" />
        <Text style={styles.securityText}>Secured by 256-bit encryption</Text>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
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

// Paste the full StyleSheet from the previous response here
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
  paymentMethodsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 4,
  },
  paymentMethodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  paymentMethodTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentMethodTextActive: {
    color: '#4F46E5',
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
  rowInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flexInput: {
    flex: 1,
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
    backgroundColor: '#818CF8',
    opacity: 0.8,
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
  cardPreview: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardBackground: {
    padding: 20,
    minHeight: 180,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cardNumberRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  cardHolderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardExpiryLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  cardExpiryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default PromoteScreenEnhanced;
