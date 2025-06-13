import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Section, BodyText, BulletPoint } from "@/components/LegalText"; // Adjust path if needed

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-800">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Terms and Conditions
        </Text>
        <Text className="text-lg text-gray-600 dark:text-slate-300 mb-1">
          Kwena Properties – A Service by Ngawa Ventures
        </Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Effective Date: 29 April 2025
        </Text>

        <Section title="Introduction">
          <BodyText>
            Welcome to Kwena Properties, your trusted platform to find and list
            accommodation in Lusaka. These Terms and Conditions govern your use
            of our app and services. By using the app, you agree to be bound by
            these terms.
          </BodyText>
        </Section>

        <Section title="Who Can Use the App">
          <BodyText>
            Anyone 18 years and older can use Kwena Properties. By registering,
            you confirm that all information you provide is accurate and lawful.
          </BodyText>
        </Section>

        <Section title="User Responsibilities">
          <BodyText>When using Kwena Properties, you agree to:</BodyText>
          <BulletPoint text="Use the app only for lawful purposes" />
          <BulletPoint text="Not misrepresent property listings or contact information" />
          <BulletPoint text="Keep your account credentials confidential" />
          <BulletPoint text="Respect other users and their content" />
        </Section>

        <Section title="Contact Information">
          <BodyText>For questions or feedback:</BodyText>
          <Text className="text-gray-700 dark:text-slate-300 mt-2 text-center italic leading-6">
            {`Email: support@ngawaventures.com
Website: www.kwenaproperties.com
Location: Lusaka, Zambia`}
          </Text>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
