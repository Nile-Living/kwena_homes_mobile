import React from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

const ContactOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white dark:bg-slate-800 p-5 rounded-lg flex-row items-center space-x-4 shadow-sm"
    activeOpacity={0.7}
  >
    <View className="bg-customgreen/10 dark:bg-customgreen/20 p-3 rounded-full">
      <Ionicons
        name={icon}
        size={24}
        className="text-customgreen dark:text-green-300"
      />
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">
        {subtitle}
      </Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={22}
      className="text-gray-400 dark:text-slate-500"
    />
  </TouchableOpacity>
);

export default function ContactUsScreen() {
  const handlePress = async (url: string, fallbackMessage: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", fallbackMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, padding: 24 }}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Get in Touch
          </Text>
          <Text className="text-lg text-gray-500 dark:text-slate-400 mt-1">
            We're here to help. Choose an option below.
          </Text>
        </View>

        <View className="space-y-4">
          <ContactOption
            icon="mail-outline"
            title="Email Us"
            subtitle="For general inquiries & support"
            onPress={() =>
              handlePress(
                "mailto:support@ngawaventures.com",
                "Could not open email app.",
              )
            }
          />
          <ContactOption
            icon="call-outline"
            title="Call Us"
            subtitle="For urgent matters (Mon-Fri, 9-5)"
            onPress={() =>
              handlePress("tel:+260977123456", "Could not open phone app.")
            }
          />
          <ContactOption
            icon="logo-whatsapp"
            title="Chat on WhatsApp"
            subtitle="For quick questions & assistance"
            onPress={() =>
              handlePress(
                "https://wa.me/260966123456",
                "Could not open WhatsApp.",
              )
            }
          />
        </View>

        <View className="mt-12 text-center items-center">
          <Text className="text-base text-gray-600 dark:text-slate-400 mb-4">
            Find us on Social Media
          </Text>
          <View className="flex-row space-x-6">
            <TouchableOpacity
              onPress={() =>
                handlePress(
                  "https://facebook.com",
                  "Could not open Facebook.",
                )
              }
              className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm"
            >
              <Ionicons name="logo-facebook" size={28} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handlePress("https://twitter.com", "Could not open Twitter.")
              }
              className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm"
            >
              <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handlePress(
                  "https://instagram.com",
                  "Could not open Instagram.",
                )
              }
              className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm"
            >
              <Ionicons name="logo-instagram" size={28} color="#E4405F" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}