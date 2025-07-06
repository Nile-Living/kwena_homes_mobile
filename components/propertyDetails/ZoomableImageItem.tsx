import React from "react";
import { Dimensions, StyleSheet }
from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

interface ZoomableImageItemProps {
  imageUri: string;
}

const ZoomableImageItem: React.FC<ZoomableImageItemProps> = ({
  imageUri,
}) => {
  const itemScale = useSharedValue(1);
  const itemSavedScale = useSharedValue(1);

  const onPinch = (event: PinchGestureHandlerGestureEvent) => {
    itemScale.value = itemSavedScale.value * event.nativeEvent.scale;
  };

  const onPinchStateChange = (event: PinchGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      itemSavedScale.value = itemScale.value;
      if (itemScale.value < 1) {
        itemScale.value = withTiming(1);
        itemSavedScale.value = 1;
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: itemScale.value }],
    };
  });

  return (
    <PinchGestureHandler
      onGestureEvent={onPinch}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={localStyles.container}>
        <Animated.Image
          source={{ uri: imageUri }}
          style={[localStyles.image, animatedStyle]}
        />
      </Animated.View>
    </PinchGestureHandler>
  );
};

const localStyles = StyleSheet.create({
  container: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default ZoomableImageItem;
