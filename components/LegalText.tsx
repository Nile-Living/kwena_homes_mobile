import React from "react";
import { View, Text } from "react-native";

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6">
    <Text className="text-lg font-bold text-gray-900 dark:text-slate-100 mt-4 mb-2">
      {title}
    </Text>
    {children}
  </View>
);

export const BodyText = ({ children }: { children: string }) => (
  <Text className="text-gray-700 dark:text-slate-300 leading-6 mb-2">
    {children}
  </Text>
);

export const BulletPoint = ({ text }: { text: string }) => (
  <View className="flex-row items-start mb-1 pr-2">
    <Text className="text-gray-700 dark:text-slate-300 text-lg leading-6">
      •{" "}
    </Text>
    <Text className="text-gray-700 dark:text-slate-300 flex-1 leading-6">
      {text}
    </Text>
  </View>
);