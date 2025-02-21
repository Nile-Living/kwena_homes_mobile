import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';

const PropertyCardSkeleton = () => {
  const animatedValue = new Animated.Value(0);

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
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <Animated.View 
        style={{ opacity }}
        className="h-48 bg-gray-200"
      />
      <View className="p-4 space-y-4">
        <Animated.View 
          style={{ opacity }}
          className="h-6 bg-gray-200 rounded w-3/4"
        />
        <Animated.View 
          style={{ opacity }}
          className="h-4 bg-gray-200 rounded w-1/2"
        />
        <View className="flex-row justify-between items-center">
          <Animated.View 
            style={{ opacity }}
            className="h-6 bg-gray-200 rounded w-1/3"
          />
          <Animated.View 
            style={{ opacity }}
            className="h-8 w-8 bg-gray-200 rounded-full"
          />
        </View>
      </View>
    </View>
  );
};

export default PropertyCardSkeleton;