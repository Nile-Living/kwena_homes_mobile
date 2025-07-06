import React from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useAppColors,
  createStyles as createGlobalStyles,
  LIGHT_COLORS,
} from "@/styles/PropertyDetails.styles";

interface PropertyImageCarouselProps {
  images: string[];
  isLiked: boolean;
  statusText: string;
  statusColor: string;
  listedDate: string;
  activeIndex: number;
  flatListRef: React.RefObject<FlatList<string>>;
  onImagePress: (params: { imageUri: string; index: number }) => void;
  onLikePress: () => void;
  onSharePress: () => void;
  onBackPress: () => void;
  onScroll: (event: any) => void;
  onDotPress: (params: { index: number }) => void;
}

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  images,
  isLiked,
  statusText,
  statusColor,
  listedDate,
  activeIndex,
  flatListRef,
  onImagePress,
  onLikePress,
  onSharePress,
  onBackPress,
  onScroll,
  onDotPress,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onImagePress({ imageUri: item, index })}
          >
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.4)",
                "transparent",
                "transparent",
                "rgba(0,0,0,0.5)",
              ]}
              style={styles.imageGradient}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <Pressable
        style={[styles.floatingButton, styles.backButton]}
        onPress={onBackPress}
      >
        <Ionicons name="chevron-back" size={24} color={LIGHT_COLORS.white} />
      </Pressable>

      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton} onPress={onLikePress}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? COLORS.red : LIGHT_COLORS.white}
          />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onSharePress}>
          <Ionicons
            name="share-social-outline"
            size={24}
            color={LIGHT_COLORS.white}
          />
        </Pressable>
      </View>

      {statusText && (
        <View style={[styles.statusTag, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}

      <View style={styles.listedDateTag}>
        <Ionicons name="time-outline" size={14} color={LIGHT_COLORS.white} />
        <Text style={styles.listedDateText}>{listedDate}</Text>
      </View>

      <View style={styles.imageCounter}>
        <Text style={styles.imageCounterText}>
          {activeIndex + 1}/{images.length}
        </Text>
      </View>

      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex ? styles.paginationDotActive : {},
            ]}
            onPress={() => onDotPress({ index })}
          />
        ))}
      </View>
    </View>
  );
};

export default PropertyImageCarousel;