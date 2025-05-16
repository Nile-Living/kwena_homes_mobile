import React from "react";
import { Text, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";

interface AnimatedDetailHeaderProps {
  title: string;
  isLiked: boolean;
  animatedStyle: any;
  onBackPress: () => void;
  onLikePress: () => void;
  onSharePress: () => void;
}

const AnimatedDetailHeader: React.FC<AnimatedDetailHeaderProps> = ({
  title,
  isLiked,
  animatedStyle,
  onBackPress,
  onLikePress,
  onSharePress,
}) => {
  return (
    <Animated.View style={[styles.animatedHeader, animatedStyle]}>
      <Pressable style={styles.headerButton} onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerActions}>
        <Pressable style={styles.headerButton} onPress={onLikePress}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? COLORS.red : COLORS.text}
          />
        </Pressable>
        <Pressable style={styles.headerButton} onPress={onSharePress}>
          <Ionicons
            name="share-social-outline"
            size={24}
            color={COLORS.text}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default AnimatedDetailHeader;
