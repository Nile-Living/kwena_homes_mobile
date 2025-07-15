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
            At Kwena Properties, operated by Ngawa Ventures, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, process, and safeguard your information when you use our mobile application to find accommodation in Lusaka, Zambia. By using our app, you consent to the data practices described in this policy.
          </BodyText>
        </Section>

        <Section title="Information We Collect">
          <BodyText>
            We collect information in several ways when you use our app:
          </BodyText>
          
          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            Personal Information You Provide:
          </Text>
          <BulletPoint text="Account Information: Name, email address, phone number, and profile photo when you create an account" />
          <BulletPoint text="Property Listings: Details about properties you list, including descriptions, photos, pricing, and contact information" />
          <BulletPoint text="Communications: Messages you send through our in-app messaging system" />
          <BulletPoint text="Support Requests: Information you provide when contacting customer support" />
          <BulletPoint text="Payment Information: Payment details processed through secure third-party payment processors (we do not store credit card information)" />

          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            Information Automatically Collected:
          </Text>
          <BulletPoint text="Device Information: Device type, operating system, unique device identifiers, mobile network information" />
          <BulletPoint text="Location Data: Precise location data (with your permission) to show nearby properties and improve search results" />
          <BulletPoint text="Usage Data: Pages viewed, time spent in app, search queries, interactions with listings" />
          <BulletPoint text="Log Data: IP address, browser type, access times, and referring website addresses" />
          <BulletPoint text="Cookies and Tracking: Information collected through cookies, web beacons, and similar technologies" />
        </Section>

        <Section title="How We Use Your Information">
          <BodyText>We use your information for the following purposes:</BodyText>
          
          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            Service Provision:
          </Text>
          <BulletPoint text="Create and manage your account" />
          <BulletPoint text="Enable property searching and listing features" />
          <BulletPoint text="Facilitate communication between landlords and tenants" />
          <BulletPoint text="Process transactions and payments" />
          <BulletPoint text="Provide customer support and respond to inquiries" />

          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            App Improvement:
          </Text>
          <BulletPoint text="Analyze usage patterns to improve app functionality" />
          <BulletPoint text="Personalize content and recommendations" />
          <BulletPoint text="Conduct research and analytics" />
          <BulletPoint text="Test new features and improvements" />

          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            Communication:
          </Text>
          <BulletPoint text="Send important updates about our services" />
          <BulletPoint text="Notify you about new listings matching your preferences" />
          <BulletPoint text="Send promotional communications (with your consent)" />

          <Text className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">
            Legal and Security:
          </Text>
          <BulletPoint text="Prevent fraud and ensure platform security" />
          <BulletPoint text="Enforce our Terms of Service" />
          <BulletPoint text="Comply with legal obligations" />
          <BulletPoint text="Protect our rights and the rights of our users" />
        </Section>

        <Section title="How We Share Your Information">
          <BodyText>
            We do not sell your personal information. We may share your information in the following circumstances:
          </BodyText>
          
          <BulletPoint text="With Other Users: When you create a listing, certain information (name, contact details, property information) is visible to potential tenants" />
          <BulletPoint text="Service Providers: With trusted third-party companies that help us operate our app (payment processors, analytics providers, cloud storage)" />
          <BulletPoint text="Legal Requirements: When required by law, court order, or government request" />
          <BulletPoint text="Business Transfers: In connection with any merger, sale, or acquisition of our company" />
          <BulletPoint text="Protection of Rights: To protect our rights, property, or safety, or that of our users" />
          <BulletPoint text="With Consent: When you explicitly consent to sharing with specific third parties" />
        </Section>

        <Section title="Data Retention">
          <BodyText>
            We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
          </BodyText>
          
          <BulletPoint text="Account Information: Retained while your account is active and for 2 years after account deletion" />
          <BulletPoint text="Property Listings: Retained for 1 year after listing expiration or removal" />
          <BulletPoint text="Messages: Retained for 3 years for dispute resolution purposes" />
          <BulletPoint text="Log Data: Retained for 12 months for security and analytics purposes" />
          <BulletPoint text="Payment Information: Processed and retained by our payment partners according to their policies" />
          
          <BodyText>
            You can request deletion of your data at any time by contacting us at support@ngawaventures.com.
          </BodyText>
        </Section>

        <Section title="Your Rights and Choices">
          <BodyText>You have the following rights regarding your personal information:</BodyText>
          
          <BulletPoint text="Access: Request a copy of the personal information we hold about you" />
          <BulletPoint text="Correction: Request correction of inaccurate or incomplete information" />
          <BulletPoint text="Deletion: Request deletion of your personal information (subject to legal requirements)" />
          <BulletPoint text="Portability: Request transfer of your data to another service" />
          <BulletPoint text="Opt-out: Unsubscribe from marketing communications" />
          <BulletPoint text="Location Data: Control location sharing through your device settings" />
          <BulletPoint text="Account Deactivation: Delete your account through app settings or by contacting us" />
          
          <BodyText>
            To exercise these rights, please contact us at support@ngawaventures.com.
          </BodyText>
        </Section>

        <Section title="Data Security">
          <BodyText>
            We implement appropriate technical and organizational measures to protect your personal information:
          </BodyText>
          
          <BulletPoint text="Encryption: Data transmission is encrypted using SSL/TLS protocols" />
          <BulletPoint text="Access Controls: Limited access to personal data on a need-to-know basis" />
          <BulletPoint text="Regular Audits: Periodic security assessments and vulnerability testing" />
          <BulletPoint text="Secure Infrastructure: Data stored on secure, regularly updated servers" />
          <BulletPoint text="Staff Training: Regular privacy and security training for our team" />
          
          <BodyText>
            However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </BodyText>
        </Section>

        <Section title="Third-Party Services">
          <BodyText>
            Our app may integrate with third-party services that have their own privacy policies:
          </BodyText>
          
          <BulletPoint text="Google Maps: For location services and mapping functionality" />
          <BulletPoint text="Payment Processors: For secure payment processing" />
          <BulletPoint text="Analytics Services: For app performance and usage analytics" />
          <BulletPoint text="Cloud Storage: For data backup and storage services" />
          <BulletPoint text="Push Notification Services: For sending app notifications" />
          
          <BodyText>
            We encourage you to review the privacy policies of these third-party services.
          </BodyText>
        </Section>

        <Section title="International Data Transfers">
          <BodyText>
            Your information may be transferred to and processed in countries other than Zambia. When we transfer data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
          </BodyText>
        </Section>

        <Section title="Children's Privacy">
          <BodyText>
            Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately.
          </BodyText>
        </Section>

        <Section title="Marketing Communications">
          <BodyText>
            We may send you promotional emails about new features, properties, or special offers. You can opt out of these communications at any time by:
          </BodyText>
          
          <BulletPoint text="Clicking the unsubscribe link in any email" />
          <BulletPoint text="Updating your preferences in app settings" />
          <BulletPoint text="Contacting us at support@ngawaventures.com" />
          
          <BodyText>
            Note that you cannot opt out of essential service communications related to your account or transactions.
          </BodyText>
        </Section>

        <Section title="Cookies and Tracking Technologies">
          <BodyText>
            We use cookies and similar technologies to enhance your experience:
          </BodyText>
          
          <BulletPoint text="Essential Cookies: Required for basic app functionality" />
          <BulletPoint text="Analytics Cookies: Help us understand how users interact with our app" />
          <BulletPoint text="Preference Cookies: Remember your settings and preferences" />
          
          <BodyText>
            You can control cookie preferences through your device settings, though disabling certain cookies may affect app functionality.
          </BodyText>
        </Section>

        <Section title="Changes to This Privacy Policy">
          <BodyText>
            We may update this Privacy Policy from time to time. When we make changes, we will:
          </BodyText>
          
          <BulletPoint text="Update the 'Effective Date' at the top of this policy" />
          <BulletPoint text="Notify you through the app or via email for significant changes" />
          <BulletPoint text="Post the updated policy in the app" />
          
          <BodyText>
            Your continued use of the app after any changes constitutes acceptance of the updated policy.
          </BodyText>
        </Section>

        <Section title="Legal Basis for Processing">
          <BodyText>
            We process your personal information based on the following legal grounds:
          </BodyText>
          
          <BulletPoint text="Contractual Necessity: To provide our services and fulfill our obligations to you" />
          <BulletPoint text="Legitimate Interests: To improve our services, prevent fraud, and ensure security" />
          <BulletPoint text="Consent: For marketing communications and non-essential features" />
          <BulletPoint text="Legal Compliance: To comply with applicable laws and regulations" />
        </Section>

        <Section title="Contact Information">
          <BodyText>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:
          </BodyText>
          
          <Text className="text-gray-700 dark:text-slate-300 mt-4 mb-2 leading-6">
            <Text className="font-semibold">Email:</Text> ngawaventures@gmail.com
          </Text>
          <Text className="text-gray-700 dark:text-slate-300 mb-2 leading-6">
            <Text className="font-semibold">Address:</Text> Ngawa Ventures, Lusaka, Zambia
          </Text>
          <Text className="text-gray-700 dark:text-slate-300 mb-2 leading-6">
            <Text className="font-semibold">Response Time:</Text> We aim to respond to all privacy-related inquiries within 30 days
          </Text>
          
          <BodyText>
            For urgent privacy concerns, please mark your email with "URGENT PRIVACY REQUEST" in the subject line.
          </BodyText>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}