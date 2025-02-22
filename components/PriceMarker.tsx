import { View, Text, Platform } from 'react-native';

interface PriceMarkerProps {
  price: number;
  isSelected: boolean;
}

export const PriceMarker = ({ price, isSelected }: PriceMarkerProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price/1000000).toFixed(1)}M`;
    if (price >= 1000) return `${Math.round(price/1000)}K`;
    return price.toLocaleString();
  };

  return (
    <View className='' style={{ position: 'relative', height: 40, width: 60 }}>
      {/* Price Bubble */}
      <View
        style={[
          {
            backgroundColor: isSelected ? '#16a34a' : 'white',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          },
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        ]}
      >
        <Text
          style={{
            color: isSelected ? 'white' : '#1f2937',
            fontWeight: '600',
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          ${formatPrice(price)}
        </Text>
      </View>

      {/* Triangle Pointer */}
      <View
        style={{
          position: 'absolute',
          bottom: -6,
          alignSelf: 'center',
          width: 12,
          height: 12,
          backgroundColor: isSelected ? '#16a34a' : 'white',
          borderBottomWidth: 1,
          borderRightWidth: 1,
          borderColor: '#e5e7eb',
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
};