import React from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  useAppColors,
  createStyles as createGlobalStyles,
} from "@/styles/PropertyDetails.styles";

interface AnimatedDetailHeaderProps {
  title: string;
  isLiked: boolean;
  animatedProperties: {
    backgroundColor?: string;
    borderBottomWidth?: number;
    borderBottomColor?: string;
    contentOpacity?: number;
    zIndex?: number;
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
  const COLORS = useAppColors();
  const globalStyles = React.useMemo(
    () => createGlobalStyles(COLORS),
    [COLORS],
  );
  const localStyles = React.useMemo(() => createLocalStyles(COLORS), [COLORS]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedProperties.backgroundColor,
      borderBottomWidth: animatedProperties.borderBottomWidth,
      borderBottomColor: animatedProperties.borderBottomColor,
      zIndex: animatedProperties.zIndex,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedProperties.contentOpacity,
    };
  });

  return (
    <Animated.View
      style={[globalStyles.animatedHeader, containerAnimatedStyle]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[localStyles.contentContainer, contentAnimatedStyle]}
        pointerEvents="auto"
      >
        <Pressable style={globalStyles.headerButton} onPress={onBackPress}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>

        <View style={localStyles.headerTitleContainer} pointerEvents="none">
          <Text style={localStyles.headerTitleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={globalStyles.headerActions} pointerEvents="box-none">
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

const createLocalStyles = (COLORS: ReturnType<typeof useAppColors>) =>
  StyleSheet.create({
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