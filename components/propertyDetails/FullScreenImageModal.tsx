import React from "react";
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ZoomableImageItem from "./ZoomableImageItem";
import { COLORS, styles as globalStyles } from "@/styles/PropertyDetails.styles";

const { width } = Dimensions.get("window");

interface FullScreenImageModalProps {
  visible: boolean;
  images: string[];
  initialIndex: number;
  currentFullScreenIndex: number;
  flatListRef: React.RefObject<FlatList<string>>;
  onClose: () => void;
  onMomentumScrollEnd: (event: any) => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  visible,
  images,
  initialIndex,
  currentFullScreenIndex,
  flatListRef,
  onClose,
  onMomentumScrollEnd,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={modalStyles.modalContainer}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color={COLORS.white} />
          </TouchableOpacity>

          {images && images.length > 0 && (
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => `fullscreen-${idx}-${item}`}
              initialScrollIndex={initialIndex}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => <ZoomableImageItem imageUri={item} />}
              initialNumToRender={1}
              windowSize={3}
            />
          )}

          {images && images.length > 0 && (
            <View style={modalStyles.fullScreenImageCounter}>
              <Text style={globalStyles.imageCounterText}>
                {`${currentFullScreenIndex + 1}/${images.length}`}
              </Text>
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: (StatusBar.currentHeight || 0) + 20,
    right: 20,
    zIndex: 10,
  },
  fullScreenImageCounter: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
});

export default FullScreenImageModal;
