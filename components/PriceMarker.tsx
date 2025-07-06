import { View, Text } from "react-native";
import { memo } from "react";

const PriceMarker = memo(({ price }: { price: number }) => {

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return (price / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (price >= 1_000_000) return (price / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (price >= 1_000) return (price / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return price.toString();
  };
  
  return (
    <View className="items-center">
      <View className="bg-[#ED9B6B] rounded-lg px-3 py-1 shadow-md">
        <Text className="text-xs font-bold text-gray-50">
          {formatPrice(price)}
        </Text>
      </View>
      {/* Pin triangle pointer */}
      <View className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white -mt-1"></View>
      {/* Pin stem */}
      <View className="h-3 w-1 bg-gray-700 rounded-b-full"></View>
    </View>
  );
});

export default PriceMarker