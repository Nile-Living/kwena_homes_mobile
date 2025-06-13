import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    question: "How do I list my property?",
    answer:
      "To list a property, tap the (+) icon on the home screen or go to the 'My Properties' tab and select 'Add New'. Fill in all the required details, upload high-quality photos, and submit for review.",
  },
  {
    question: "What are the fees for listing a property?",
    answer:
      "Basic listings on Kwena Properties are free! We offer optional premium promotion packages to increase your listing's visibility. You can find these options in the 'Promote' section of your property details.",
  },
  {
    question: "How can I edit my profile information?",
    answer:
      "You can edit your profile by navigating to the 'Profile' tab and tapping the 'Edit Profile' button. Here you can update your name, contact details, and profile picture.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes, absolutely. All payments for promotions are handled by a secure, PCI-compliant third-party payment processor. We do not store your credit card details on our servers.",
  },
];

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View className="border-b border-gray-200 dark:border-slate-700">
      <TouchableOpacity
        onPress={toggleOpen}
        className="flex-row justify-between items-center py-4"
        activeOpacity={0.8}
      >
        <Text className="text-base font-medium text-gray-800 dark:text-slate-200 flex-1 pr-2">
          {question}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          className="text-gray-500 dark:text-slate-400"
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="pb-4">
          <Text className="text-base text-gray-600 dark:text-slate-300 leading-6">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function HelpCenterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-6 bg-white dark:bg-slate-800">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Help Center
          </Text>
          <Text className="text-lg text-gray-500 dark:text-slate-400 mt-1">
            How can we help you today?
          </Text>
          <View className="mt-6 flex-row items-center bg-gray-100 dark:bg-slate-700 rounded-lg px-4">
            <Ionicons
              name="search"
              size={20}
              className="text-gray-400 dark:text-slate-400"
            />
            <TextInput
              placeholder="Search for answers..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-12 text-base text-gray-900 dark:text-white ml-2"
            />
          </View>
        </View>

        <View className="p-6">
          <Text className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">
            Frequently Asked Questions
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-lg p-2">
            {FAQ_DATA.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </View>
        </View>

        <View className="px-6 mt-4">
          <View className="bg-blue-100 dark:bg-blue-900/50 p-6 rounded-lg flex-col items-center text-center">
            <Ionicons
              name="help-buoy-outline"
              size={40}
              className="text-blue-600 dark:text-blue-400"
            />
            <Text className="text-xl font-bold text-blue-900 dark:text-white mt-3">
              Still need help?
            </Text>
            <Text className="text-base text-blue-800/80 dark:text-blue-300/80 mt-1 mb-4 text-center">
              If you can't find the answer you're looking for, please get in
              touch.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings/support/contact-us")}
              className="bg-customgreen dark:bg-dark-tint px-8 py-3 rounded-full shadow"
            >
              <Text className="text-white font-bold text-base">Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}