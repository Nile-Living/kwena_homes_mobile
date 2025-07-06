// utils/propertyUtils.ts
import { Property } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

export type Feature = {
  icon: string;
  value: string;
  iconLibrary: 'Ionicons' | 'FontAwesome';
};

export const getPropertyFeatures = (property: Property): Feature[] => {
  const features: Feature[] = [];
  const details = property.details || {};

  switch (property.category) {
    case 'house':
    case 'apartment':
    case 'lodge':
      features.push(
        { icon: 'bed-outline', value: details.bedrooms ?? '-', iconLibrary: 'Ionicons' },
        { icon: 'bathtub', value: details.bathrooms ?? '-', iconLibrary: 'FontAwesome' }
      );
      break;
    case 'land':
    case 'farm':
      features.push(
        { icon: 'resize-outline', value: details.size_sqm ? `${details.size_sqm} sqm` : '-', iconLibrary: 'Ionicons' },
        { icon: 'car-outline', value: details.road_access ? 'Road Access' : '-', iconLibrary: 'Ionicons' }
      );
      break;
    case 'commercial':
    case 'industrial':
      features.push(
        { icon: 'business-outline', value: details.property_type || property.category, iconLibrary: 'Ionicons' },
        { icon: 'resize-outline', value: details.square_meters ? `${details.square_meters} sqm` : '-', iconLibrary: 'Ionicons' }
      );
      break;
    default:
      features.push(
        { icon: 'information-circle-outline', value: property.category, iconLibrary: 'Ionicons' }
      );
  }

  return features.slice(0, 2); // Return max 2 features
};