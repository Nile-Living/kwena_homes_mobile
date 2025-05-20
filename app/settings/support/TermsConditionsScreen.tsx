import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        {/* Title Section */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Terms and Conditions
        </Text>
        <Text className="text-lg text-gray-600 mb-1">
          Kwena Properties – A Service by Ngawa Ventures
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          Effective Date: 29 April 2025
        </Text>
        {/* Content Sections */}
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
            Anyone 18 years and older can use Kwena Properties. By registering, you
            confirm that all information you provide is accurate and lawful.
          </BodyText>
        </Section>
        <Section title="User Responsibilities">
          <BodyText>When using Kwena Properties, you agree to:</BodyText>
          <BulletPoint text="Use the app only for lawful purposes" />
          <BulletPoint text="Not misrepresent property listings or contact information" />
          <BulletPoint text="Keep your account credentials confidential" />
          <BulletPoint text="Respect other users and their content" />
        </Section>
        <Section title="Listings and Transactions">
          <BodyText>
            Kwena Properties provides a platform for connecting renters and property
            owners. Ngawa Ventures is not a real estate agent and is not
            responsible for the accuracy of listings or the outcome of any
            transaction.
          </BodyText>
        </Section>
        <Section title="Intellectual Property">
          <BodyText>
            All app content, branding, logos, and software are the property of
            Ngawa Ventures. You may not copy, distribute, or reuse any content
            without permission.
          </BodyText>
        </Section>
        <Section title="Third-Party Links">
          <BodyText>
            We may provide links to external sites for your convenience. We are
            not responsible for their content or privacy policies.
          </BodyText>
        </Section>
        <Section title="Termination of Access">
          <BodyText>
            We reserve the right to suspend or terminate your account if you
            violate these terms or misuse the platform.
          </BodyText>
        </Section>
        <Section title="Limitation of Liability">
          <BodyText>Ngawa Ventures is not liable for:</BodyText>
          <BulletPoint text="Any loss, damages, or disputes arising from property transactions" />
          <BulletPoint text="Service interruptions or technical issues" />
          <BulletPoint text="User-generated content or misconduct" />
        </Section>
        <Section title="Updates to Terms">
          <BodyText>
            We may revise these terms as the app evolves. Continued use after
            updates means you accept the new terms.
          </BodyText>
        </Section>
        <Section title="Governing Law">
          <BodyText>
            These terms are governed by the laws of the Republic of Zambia. Any
            disputes will be handled in accordance with Zambian law.
          </BodyText>
        </Section>
        <Section title="Contact Information">
          <BodyText>For questions or feedback:</BodyText>
          <Text className="text-gray-700 mt-2 text-center italic">
            Email: {"\n"}
            Website: {"\n"}
            Location: Lusaka, Zambia
          </Text>
        </Section>
        <View className="h-8" /> {/* Bottom spacing */}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reuse components from Privacy Policy
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
