import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Section,
  BodyText,
  BulletPoint,
} from "@/components/LegalText"; // Adjust path if needed

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-800">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Privacy Policy
        </Text>
        <Text className="text-lg text-gray-600 dark:text-slate-300 mb-1">
          Kwena Properties by Ngawa Ventures
        </Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Effective Date: 29 April 2025
        </Text>

        <Section title="Introduction">
          <BodyText>
            At Kwena Properties, your privacy matters to us. Operated by Ngawa
            Ventures, our app is designed to help you easily find accommodation
            in Lusaka, Zambia. This Privacy Policy outlines how we collect, use,
            protect, and share your information.
          </BodyText>
        </Section>

        <Section title="What Information We Collect">
          <BodyText>
            We may collect the following types of information:
          </BodyText>
          <BulletPoint text="Personal Data: Your name, email, phone number, and profile photo." />
          <BulletPoint text="Location Data: To help you find nearby listings." />
          <BulletPoint text="Device & Usage Data: Including IP address, device type, pages visited, and time spent on the app." />
          <BulletPoint text="User Content: Listings, messages, and images you upload." />
        </Section>

        <Section title="How We Use Your Data">
          <BodyText>We use your information to:</BodyText>
          <BulletPoint text="Provide, improve, and personalize the app experience" />
          <BulletPoint text="Send updates, alerts, and respond to inquiries" />
          <BulletPoint text="Monitor app performance and troubleshoot issues" />
          <BulletPoint text="Prevent fraud and enforce our terms" />
        </Section>

        <Section title="Contact Us">
          <BodyText>
            If you have questions or concerns about this Privacy Policy:
          </BodyText>
          <Text className="text-gray-700 dark:text-slate-300 mt-2 text-center italic leading-6">
            {`Email: support@ngawaventures.com
Location: Lusaka, Zambia`}
          </Text>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}