// components/propertyDetails/AnimatedDetailHeader.tsx
import React from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles as globalStyles, COLORS } from "@/styles/PropertyDetails.styles";

interface AnimatedDetailHeaderProps {
  title: string;
  isLiked: boolean;
  animatedProperties: {
    backgroundColor?: string;
    borderBottomWidth?: number;
    borderBottomColor?: string;
    contentOpacity?: number;
    zIndex?: number; // Expecting zIndex
  };
  onBackPress: () => void;
  onLikePress: () => void;
  onSharePress: () => void;
}

const AnimatedDetailHeader: React.FC<AnimatedDetailHeaderProps> = ({
  title,
  isLiked,
  animatedProperties,
  onBackPress,
  onLikePress,
  onSharePress,
}) => {
  // Style for the main container (background, border, and zIndex)
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedProperties.backgroundColor,
      borderBottomWidth: animatedProperties.borderBottomWidth,
      borderBottomColor: animatedProperties.borderBottomColor,
      zIndex: animatedProperties.zIndex, // Apply animated zIndex
      // The overall opacity of the container itself is implicitly handled by backgroundColor's alpha
    };
  });

  // Style for the content's opacity
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedProperties.contentOpacity,
    };
  });

  return (
    // Main container: Applies background, border, and zIndex.
    // pointerEvents="box-none" is crucial for when zIndex is high.
    <Animated.View
      style={[globalStyles.animatedHeader, containerAnimatedStyle]}
      pointerEvents="box-none"
    >
      {/* Inner container for content: Handles opacity of buttons/title */}
      {/* This view needs to be touchable for its children when visible */}
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]} pointerEvents="auto">
        <Pressable
          style={globalStyles.headerButton}
          onPress={onBackPress}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>

        {/* Title wrapper still needs to be non-interactive */}
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Actions group allows its children to be hit */}
        <View
          style={globalStyles.headerActions}
          pointerEvents="box-none"
        >
          <Pressable style={globalStyles.headerButton} onPress={onLikePress}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.red : COLORS.text}
            />
          </Pressable>
          <Pressable style={globalStyles.headerButton} onPress={onSharePress}>
            <Ionicons
              name="share-social-outline"
              size={24}
              color={COLORS.text}
            />
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// Local styles (contentContainer, headerTitleContainer, headerTitleText)
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
});

export default AnimatedDetailHeader;
