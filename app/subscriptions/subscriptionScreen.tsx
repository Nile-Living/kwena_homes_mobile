import React, { useState, useEffect, useCallback } from "react";
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
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useSubscriptionStore,
  SubscriptionType,
} from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/constants/Config";
import { useRouter, Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import colors from "tailwindcss/colors";
import { usePaymentRequestDeduplication } from "@/hooks/useRequestDeduplication";
import { useSubscriptionOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

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
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    | "idle"
    | "initiated"
    | "otp-required"
    | "processing"
    | "completed"
    | "failed"
  >("idle");

  // Use race condition prevention hooks
  const paymentRequest = usePaymentRequestDeduplication();
  const subscriptionUpdate = useSubscriptionOptimisticUpdate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (visible) {
      resetModal();
    }
  }, [visible]);

  const handleInitiateLencoPayment = useCallback(async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    const mobileRegex = /^0[79][567][0-9]{7}$/;
    if (!mobileRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid Zambian Mobile Money number.");
      return;
    }

    // Prevent duplicate payment requests
    if (paymentRequest.isLoading) {
      Alert.alert("Please wait", "Payment is already being processed...");
      return;
    }

    setPaymentStatus("initiated");

    try {
      const result = await paymentRequest.executeRequest(
        async () => {
          const token = useAuthStore.getState().session?.access_token;
          const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: 1,
              phone: phone,
              method: "momo",
              operator: "mtn",
              description: "Monthly Subscription",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Payment initiation failed");
          }

          return await response.json();
        },
        {
          params: { phone, amount: 1, method: "momo", operator: "mtn" },
        }
      );

      setPaymentReference(result.reference);

      if (result.status === "otp-required" || result.requiresOtp) {
        setPaymentStatus("otp-required");
        setCurrentStep(2);
      } else if (result.status === "successful") {
        setPaymentStatus("completed");
        Alert.alert(
          "Success",
          "Payment successful! Your subscription is now active."
        );
        onPaymentSuccess(result.reference);
        resetModal();
        onClose();
      } else if (result.status === "pay-offline" || result.status === "pending") {
        resetModal();
        onClose();
        router.replace({
          pathname: "/subscriptions/payment-status",
          params: {
            paymentReference: result.reference,
            initialStatus: result.status,
          },
        });
      } else {
        setPaymentStatus("failed");
        Alert.alert(
          "Payment Status",
          result.message || `Payment status: ${result.status}`
        );
      }
    } catch (error: any) {
      // Skip error handling for deduplicated requests
      if (error.message === 'Request skipped due to deduplication') {
        return;
      }
      
      setPaymentStatus("failed");
      Alert.alert("Error", error.message || "Payment initiation failed");
    }
  }, [phone, paymentRequest, onPaymentSuccess, onClose, router]);

  const handleLencoOtpSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }
    if (!paymentReference) {
      Alert.alert("Error", "Payment reference missing. Please try again.");
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");

    try {
      const token = useAuthStore.getState().session?.access_token;
      const response = await fetch(`${API_BASE_URL}/payments/submit-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference: paymentReference,
          otp: otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "OTP submission failed");
      }

      const data = await response.json();

      if (data.status === "successful") {
        setPaymentStatus("completed");
        Alert.alert(
          "Success",
          "Payment successful! Your subscription is now active."
        );
        onPaymentSuccess(paymentReference);
        resetModal();
        onClose();
      } else if (data.status === "pay-offline") {
        resetModal();
        onClose();
        router.replace({
          pathname: "/subscriptions/payment-status",
          params: {
            paymentReference: paymentReference,
            initialStatus: data.status,
          },
        });
      } else {
        setPaymentStatus("failed");
        Alert.alert(
          "Payment Status",
          data.message || `Payment status after OTP: ${data.status}`
        );
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      Alert.alert("Error", error.message || "OTP processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setPaymentStatus("idle");
      setOtp("");
    }
  };

  const resetModal = () => {
    setPhone("");
    setOtp("");
    setPaymentReference("");
    setPaymentStatus("idle");
    setCurrentStep(1);
    setLoading(false);
  };

  const renderStepOne = () => (
    <View className="p-5">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        Payment Details
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter your mobile money number to proceed with subscription
      </Text>

      <View className="mb-6">
        <LinearGradient
          colors={[colors.blue[600], colors.blue[500]]}
          className="p-5 rounded-2xl mb-6"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-white">
              Monthly Subscription
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-white">PREMIUM</Text>
            </View>
          </View>
          <Text className="text-3xl font-extrabold text-white mb-4">
            K39.00
          </Text>
          <View className="mt-2">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.white}
              />
              <Text className="text-sm text-white ml-2">
                Save up to 5 searches
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.white}
              />
              <Text className="text-sm text-white ml-2">
                Instant property alerts
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.white}
              />
              <Text className="text-sm text-white ml-2">
                Priority notifications
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Mobile Money Number
          </Text>
          <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-4 h-12">
            <Ionicons name="call-outline" size={20} color={colors.slate[500]} />
            <TextInput
              placeholder="09XXXXXXXX / 07XXXXXXXX"
              placeholderTextColor={colors.slate[400]}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              className="flex-1 text-base ml-3 text-gray-900 dark:text-white"
              maxLength={10}
              editable={!paymentRequest.isLoading}
            />
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            We'll send a payment prompt to this number (Lenco Payments)
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-xl py-4 flex-row items-center justify-center mb-4 active:bg-blue-700 ${
          paymentRequest.isLoading ? "bg-blue-400 dark:bg-blue-500/50" : "bg-blue-600"
        }`}
        onPress={handleInitiateLencoPayment}
        disabled={paymentRequest.isLoading}
        activeOpacity={0.8}
      >
        {paymentRequest.isLoading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            <Text className="text-base font-semibold text-white mr-2">
              Pay K39.00
            </Text>
            <Ionicons name="shield-checkmark" size={20} color={colors.white} />
          </>
        )}
      </TouchableOpacity>

      <View className="flex-row items-center justify-center">
        <Ionicons name="lock-closed" size={16} color={colors.green[600]} />
        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
          Secured by Lenco Payments
        </Text>
      </View>
    </View>
  );

  const renderStepTwo = () => (
    <View className="p-5">
      <TouchableOpacity
        className="flex-row items-center mb-5 self-start py-1"
        onPress={handleBackStep}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={colorScheme === "dark" ? colors.blue[400] : colors.blue[600]}
        />
        <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 ml-1">
          Back to Payment
        </Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        Enter OTP
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Please enter the OTP sent to {phone}
      </Text>

      <View className="bg-green-100 dark:bg-green-950 p-4 rounded-xl mb-6">
        <View className="flex-row items-center">
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.green[600]}
          />
          <Text className="text-green-800 dark:text-green-200 font-medium ml-2">
            Payment request sent to your phone
          </Text>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          OTP Code
        </Text>
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-4 h-12">
          <Ionicons name="keypad-outline" size={20} color={colors.slate[500]} />
          <TextInput
            placeholder="6-digit OTP"
            placeholderTextColor={colors.slate[400]}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            className="flex-1 text-base ml-3 text-gray-900 dark:text-white text-center"
            maxLength={6}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-xl py-4 flex-row items-center justify-center mb-4 active:bg-green-700 ${
          loading ? "bg-green-400 dark:bg-green-500/50" : "bg-green-600"
        }`}
        onPress={handleLencoOtpSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            <Text className="text-base font-semibold text-white mr-2">
              Confirm Payment
            </Text>
            <Ionicons name="key-outline" size={20} color={colors.white} />
          </>
        )}
      </TouchableOpacity>

      {paymentStatus === "processing" && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" color={colors.blue[500]} />
          <Text className="text-gray-600 dark:text-gray-400 mt-2">
            Processing payment...
          </Text>
        </View>
      )}
    </View>
  );

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
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={
            colorScheme === "dark" ? colors.slate[800] : colors.white
          }
        />

        <View className="px-5 py-4 border-b bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <TouchableOpacity
            className="p-1 mb-2 self-start"
            onPress={() => {
              resetModal();
              onClose();
            }}
          >
            <Ionicons
              name="close"
              size={24}
              color={
                colorScheme === "dark" ? colors.slate[200] : colors.slate[800]
              }
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Subscribe to Premium
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Get instant notifications and save your searches
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 1 ? renderStepOne() : renderStepTwo()}
          </ScrollView>
        </KeyboardAvoidingView>
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

  const handleRefreshSubscription = async () => {
    try {
      await fetchActiveSubscription();
      Alert.alert("Success", "Subscription status refreshed");
    } catch (err) {
      Alert.alert("Error", "Failed to refresh subscription status");
    }
  };

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
        "Warning",
        "Payment processed but unable to refresh subscription status. Please check your subscription status or contact support."
      );
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription(subscription.id);
              Alert.alert("Success", "Subscription cancelled successfully");
              fetchActiveSubscription();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to cancel subscription"
              );
            }
          },
        },
      ]
    );
  };

  if (!isUserRole()) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-full items-center justify-center mb-6 shadow-lg">
            <Ionicons
              name="business-outline"
              size={36}
              color={
                colorScheme === "dark" ? colors.blue[400] : colors.blue[600]
              }
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 text-center">
            For Users Only
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-300 text-center">
            Subscriptions are available for regular users only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
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
      <Stack.Screen options={{ title: "Subscription", headerShown: false }} />

      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={
          colorScheme === "dark" ? colors.slate[800] : colors.white
        }
      />

      <View
        className={`px-5 py-4 border-b bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 ${
          Platform.OS === "android" ? "pt-12" : "pt-4"
        }`}
      >
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          Subscription
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Manage your premium subscription
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-5">
          {isSubscribed && subscription ? (
            <View>
              {/* Active Subscription Card */}
              <LinearGradient
                colors={[colors.green[600], colors.green[500]]}
                className="rounded-2xl p-5 mb-6 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-xl font-bold text-white mb-1">
                      Premium Active
                    </Text>
                    <Text className="text-green-100 font-medium">
                      {subscription.subscription_type.toUpperCase()} PLAN
                    </Text>
                  </View>
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white font-semibold text-sm">
                      ACTIVE
                    </Text>
                  </View>
                </View>

                <View className="mt-4 pt-4 border-t border-white/20">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-green-100">Started</Text>
                    <Text className="text-white font-medium">
                      {new Date(subscription.starts_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-green-100">Expires</Text>
                    <Text className="text-white font-medium">
                      {new Date(subscription.expires_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Benefits Card */}
              <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm mb-6">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  Your Premium Benefits
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="search"
                        size={20}
                        color={colors.blue[500]}
                      />
                      <Text className="text-gray-700 dark:text-gray-300 ml-3">
                        Saved Searches
                      </Text>
                    </View>
                    <Text className="text-gray-900 dark:text-gray-100 font-medium">
                      {features?.max_saved_searches === -1
                        ? "Unlimited"
                        : features?.max_saved_searches || "5"}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="notifications"
                        size={20}
                        color={colors.green[500]}
                      />
                      <Text className="text-gray-700 dark:text-gray-300 ml-3">
                        Property Alerts
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.green[500]}
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="flash"
                        size={20}
                        color={colors.amber[500]}
                      />
                      <Text className="text-gray-700 dark:text-gray-300 ml-3">
                        Priority Notifications
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.green[500]}
                    />
                  </View>
                </View>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancelSubscription}
                className="bg-red-600 active:bg-red-700 p-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold text-base">
                  Cancel Subscription
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRefreshSubscription}
                className="bg-gray-200 dark:bg-slate-700 p-3 rounded-lg mt-4"
              >
                <Text className="text-center font-medium">Refresh Status</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Premium Subscription Card */}
              <LinearGradient
                colors={[colors.blue[600], colors.indigo[600]]}
                className="rounded-2xl p-6 mb-6 shadow-lg"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="items-center mb-6">
                  <Ionicons name="star" size={48} color={colors.white} />
                  <Text className="text-2xl font-bold text-white mt-4 mb-2">
                    Unlock Premium Features
                  </Text>
                  <Text className="text-blue-100 text-center">
                    Get notified about new properties and save your searches
                  </Text>
                </View>

                <View className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-6">
                  <Text className="text-white font-bold text-4xl text-center mb-2">
                    K39.00
                  </Text>
                  <Text className="text-blue-100 text-center font-medium">
                    per month
                  </Text>
                </View>

                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.white}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-medium">
                        Save Up to 5 Searches
                      </Text>
                      <Text className="text-blue-100 text-sm">
                        Save your favorite search criteria for quick access
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.white}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-medium">
                        Property Alerts
                      </Text>
                      <Text className="text-blue-100 text-sm">
                        Get instant notifications when new properties match your
                        searches
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.white}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-white font-medium">
                        Priority Support
                      </Text>
                      <Text className="text-blue-100 text-sm">
                        Get priority customer support and assistance
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <TouchableOpacity
                onPress={() => setShowPaymentModal(true)}
                className="bg-blue-600 active:bg-blue-700 p-4 rounded-xl flex-row items-center justify-center"
              >
                <Text className="text-white font-bold text-lg mr-2">
                  Subscribe Now - K39/month
                </Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>

              <Text className="text-gray-500 dark:text-gray-400 text-xs text-center mt-3">
                Cancel anytime. No long-term commitments.
              </Text>
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

