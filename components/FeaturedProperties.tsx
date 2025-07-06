import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Keep Ionicons
import { Property } from '@/store/useStore';

interface FeaturedPropertiesProps {
  properties: Property[];
}

const PLACEHOLDER_IMAGE_URL =
  'https://via.placeholder.com/300x200.png?text=No+Image';

const formatPrice = (price: number): string => {
  return price?.toLocaleString() ?? 'N/A';
};

export default function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  const handleViewAll = () => {
    router.push('../promoted');
  }

  const getFeatures = (property: Property) => {
    const details = property.details || {};
    let features = [];
    if (details.bedrooms) {
      features.push({ icon: 'bed-outline', value: details.bedrooms });
    }
    if (details.bathrooms) {
      // Using Ionicons for consistency now
      features.push({ icon: 'water-outline', value: details.bathrooms });
    }
    if (details.size_sqm) {
      features.push({ icon: 'resize-outline', value: `${details.size_sqm} sqm` });
    } else if (details.square_meters) {
      features.push({ icon: 'resize-outline', value: `${details.square_meters} sqm` });
    }
    return features.slice(0, 2);
  };

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    // Add back bottom margin for divider spacing
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
          Featured Properties
        </Text>
        {/* Restore View all button */}
        <Pressable onPress={() => handleViewAll()}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {properties.map((property) => {
          const features = getFeatures(property);
          const cardBg = isDark ? styles.cardDark : styles.cardLight;
          const textColor = isDark ? styles.textDark : styles.textLight;
          const mutedColor = isDark ? styles.mutedTextDark : styles.mutedTextLight;
          const iconColor = isDark ? '#cbd5e1' : '#64748b';

          return (
            <Pressable
              key={property.id}
              onPress={() => handlePress(property.id)}
              style={[styles.featuredCard, cardBg]}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: property.images?.[0] || PLACEHOLDER_IMAGE_URL }}
                  style={styles.propertyImage}
                />
                <View style={styles.featuredBadge}>
                  <Ionicons name="flash" size={10} color="#FFFFFF" />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={[styles.propertyTitle, textColor]} numberOfLines={1}>
                  {property.title}
                </Text>
                <Text style={[styles.propertyPrice, textColor]}>
                  K{formatPrice(property.price)}
                  {property.property_type === 'rent' && (
                     <Text style={[styles.priceType, mutedColor]}> /mo</Text>
                  )}
                </Text>
                <Text style={[styles.propertyLocation, mutedColor]} numberOfLines={1}>
                  {property.location}
                </Text>
                <View style={styles.featuresRow}>
                  {features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name={feature.icon as any} size={14} color={iconColor} />
                      <Text style={[styles.featureText, mutedColor]}>
                        {feature.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Restore Divider */}
      <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2, // Keep some bottom margin before divider
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContentContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  featuredCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 140,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  contentContainer: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  priceType: {
      fontSize: 10,
      fontWeight: 'normal',
  },
  propertyLocation: {
    fontSize: 12,
    marginBottom: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
  },
  textLight: { color: '#1F2937' },
  textDark: { color: '#F9FAFB' },
  mutedTextLight: { color: '#6B7280' },
  mutedTextDark: { color: '#9CA3AF' },
  divider: { // Restored divider style
    height: 1,
    marginHorizontal: 4, // Match padding
    marginTop: 2,
    marginBottom: 4
  },
  dividerLight: { backgroundColor: '#E5E7EB' }, // gray-200
  dividerDark: { backgroundColor: '#374151' }, // slate-700
});
