import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsPage = () => {
  // Example state for toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // Setting sections with items
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Profile',
          type: 'navigation',
          onPress: () => console.log('Navigate to Profile'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Security',
          type: 'navigation',
          onPress: () => console.log('Navigate to Security'),
        },
        {
          icon: 'wallet-outline',
          label: 'Payment Methods',
          type: 'navigation',
          onPress: () => console.log('Navigate to Payment Methods'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'toggle',
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          icon: 'location-outline',
          label: 'Location Services',
          type: 'toggle',
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          icon: 'finger-print-outline',
          label: 'Biometric Authentication',
          type: 'toggle',
          value: biometricsEnabled,
          onToggle: setBiometricsEnabled,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          type: 'navigation',
          onPress: () => console.log('Navigate to Help Center'),
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          type: 'navigation',
          onPress: () => console.log('Navigate to Contact Us'),
        },
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          type: 'navigation',
          onPress: () => console.log('Navigate to Terms of Service'),
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          type: 'navigation',
          onPress: () => console.log('Navigate to Privacy Policy'),
        },
      ],
    },
  ];

  // Setting item component
  const SettingItem = ({ item }: { item: any}) => {
    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 ${
          item.type === 'navigation' ? 'active:bg-gray-50' : ''
        }`}
        onPress={item.type === 'navigation' ? item.onPress : null}
        activeOpacity={item.type === 'navigation' ? 0.7 : 1}
      >
        <View className="flex-row items-center">
          <Ionicons name={item.icon} size={22} className="text-gray-600" />
          <Text className="ml-3 text-base font-medium text-gray-800">{item.label}</Text>
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#d1d5db', true: '#4f46e5' }}
            thumbColor="#ffffff"
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} className="text-gray-400" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* <View className="pt-12 pb-4 px-4 bg-indigo-600">
        <Text className="text-2xl font-bold text-white">Settings</Text>
      </View> */}

      {settingsSections.map((section, index) => (
        <View key={index} className="mb-6">
          <Text className="px-4 pt-6 pb-2 text-sm font-semibold text-gray-500 uppercase">
            {section.title}
          </Text>
          <View className="bg-white rounded-lg mx-4 shadow-sm">
            {section.items.map((item, itemIndex) => (
              <SettingItem key={itemIndex} item={item} />
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        className="mx-4 mb-8 p-3 rounded-lg bg-red-500 items-center"
        onPress={() => console.log('Log out pressed')}
      >
        <Text className="text-white font-semibold">Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsPage;