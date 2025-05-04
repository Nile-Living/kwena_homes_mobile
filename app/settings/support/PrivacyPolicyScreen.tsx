import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        {/* Title Section */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </Text>
        <Text className="text-lg text-gray-600 mb-1">
          Kwena Homes by Ngawa Ventures
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Effective Date: 29 April 2025
        </Text>
        {/* Content Sections */}
        <Section title="Introduction">
          <BodyText>
            At Kwena Homes, your privacy matters to us. Operated by Ngawa
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
        {/* Other Sections - Follow same pattern */}
        <Section title="Contact Us">
          <BodyText>
            If you have questions or concerns about this Privacy Policy:
          </BodyText>
          <Text className="text-gray-700 mt-2 text-center italic">
            Email: support@ngawaventures.com{"\n"}
            Location: Lusaka, Zambia
          </Text>
        </Section>
        <View className="h-8" /> {/* Bottom spacing */}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable components
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6">
    <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">{title}</Text>
    {children}
  </View>
);

const BodyText = ({ children }: { children: string }) => (
  <Text className="text-gray-700 leading-5 mb-2">{children}</Text>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View className="flex-row items-start mb-1">
    <Text className="text-gray-700">• </Text>
    <Text className="text-gray-700 flex-1">{text}</Text>
  </View>
);
