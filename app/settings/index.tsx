import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors'; // Import tailwind colors

const SettingsPage = () => {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleDarkModeToggle = (isEnabled: boolean) => {
    setColorScheme(isEnabled ? 'dark' : 'light');
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
      router.replace('/'); // Use replace to prevent going back
    } else {
      router.push('/auth/signin');
    }
  };

  // Setting sections with items
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Profile',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/profile'),
        },
        // {
        //   icon: 'wallet-outline',
        //   label: 'Payment Methods',
        //   type: 'navigation',
        //   onPress: () => console.log('Navigate to Payment Methods'),
        // },
      ],
    },
    // {
    //   title: 'Appearance',
    //   items: [
    //     {
    //       icon: 'contrast-outline',
    //       label: 'Dark Mode',
    //       type: 'toggle',
    //       value: colorScheme === 'dark',
    //       onToggle: handleDarkModeToggle,
    //     },
    //   ],
    // },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          type: 'navigation',
          onPress: () => router.push('/settings/support/help-center'),
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          type: 'navigation',
          onPress: () => router.push('/settings/support/contact-us'),
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          type: 'navigation',
          onPress: () => router.push('/settings/support/TermsConditionsScreen'),
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          type: 'navigation',
          onPress: () => router.push('/settings/support/PrivacyPolicyScreen'),
        },
      ],
    },
  ];

  // Setting item component
  const SettingItem = ({ item }: { item: any }) => {
    // THE FIX: Determine icon colors based on the current color scheme
    const iconColor =
      colorScheme === 'dark' ? colors.slate[300] : colors.slate[600];
    const chevronColor =
      colorScheme === 'dark' ? colors.slate[500] : colors.slate[400];

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 last:border-b-0 ${
          item.type === 'navigation'
            ? 'active:bg-gray-50 dark:active:bg-slate-700'
            : ''
        }`}
        onPress={item.type === 'navigation' ? item.onPress : undefined}
        activeOpacity={item.type === 'navigation' ? 0.7 : 1}
      >
        <View className="flex-row items-center">
          <Ionicons name={item.icon} size={22} color={iconColor} />
          <Text className="ml-4 text-base text-gray-800 dark:text-gray-50">
            {item.label}
          </Text>
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: colors.slate[300],
              true: colors.indigo[500],
            }}
            thumbColor={colors.white}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={chevronColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      {settingsSections.map((section, index) => (
        <View key={index} className="mb-4">
          <Text className="px-4 pt-5 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {section.title}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-lg mx-4 border border-gray-200 dark:border-slate-700 overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <SettingItem key={itemIndex} item={item} />
            ))}
          </View>
        </View>
      ))}

      <View className="px-4 mt-4 mb-8">
        <TouchableOpacity
          className="p-3 rounded-lg bg-red-500 active:bg-red-600 items-center"
          onPress={handleAuthAction}
        >
          <Text className="text-white font-semibold text-base">
            {user ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsPage;