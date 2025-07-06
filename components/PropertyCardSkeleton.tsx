import React, { useEffect } from "react";
import { View, Animated, useColorScheme } from "react-native";

const PropertyCardSkeleton = () => {
  const animatedValue = new Animated.Value(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonBackgroundColor =
    colorScheme === "dark" ? "bg-slate-700" : "bg-gray-200";

  return (
    <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4 overflow-hidden">
      <Animated.View
        style={{ opacity }}
        className={`h-48 ${skeletonBackgroundColor}`}
      />
      <View className="p-4 space-y-4">
        <Animated.View
          style={{ opacity }}
          className={`h-6 ${skeletonBackgroundColor} rounded w-3/4`}
        />
        <Animated.View
          style={{ opacity }}
          className={`h-4 ${skeletonBackgroundColor} rounded w-1/2`}
        />
        <View className="flex-row justify-between items-center">
          <Animated.View
            style={{ opacity }}
            className={`h-6 ${skeletonBackgroundColor} rounded w-1/3`}
          />
          <Animated.View
            style={{ opacity }}
            className={`h-8 w-8 ${skeletonBackgroundColor} rounded-full`}
          />
        </View>
      </View>
    </View>
  );
};

export default PropertyCardSkeleton;
