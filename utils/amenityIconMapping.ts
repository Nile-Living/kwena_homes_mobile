// utils/amenityIconMapping.ts
import { Ionicons } from '@expo/vector-icons';

export interface AmenityIcon {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
}

export const AMENITY_ICON_MAP: Record<string, AmenityIcon> = {
  // Security & Access
  'Boundary Wall': { name: 'shield-outline', color: '#10B981', label: 'Boundary Wall' },
  'Security Gate': { name: 'lock-closed-outline', color: '#10B981', label: 'Security Gate' },
  '24hr Security': { name: 'shield-checkmark-outline', color: '#10B981', label: '24hr Security' },
  'Security': { name: 'shield-outline', color: '#10B981', label: 'Security' },
  'Fenced': { name: 'grid-outline', color: '#10B981', label: 'Fenced' },
  
  // Utilities
  'Electricity': { name: 'flash-outline', color: '#F59E0B', label: 'Electricity' },
  'Three Phase Power': { name: 'flash', color: '#F59E0B', label: '3-Phase Power' },
  'Water Connection': { name: 'water-outline', color: '#3B82F6', label: 'Water' },
  'Borehole': { name: 'water', color: '#3B82F6', label: 'Borehole' },
  'Fibre Internet': { name: 'wifi-outline', color: '#8B5CF6', label: 'Fibre Internet' },
  
  // Amenities
  'Pool': { name: 'water-outline', color: '#06B6D4', label: 'Swimming Pool' },
  'Swimming Pool': { name: 'water-outline', color: '#06B6D4', label: 'Swimming Pool' },
  'Garden': { name: 'flower-outline', color: '#10B981', label: 'Garden' },
  'Garage': { name: 'car-outline', color: '#6B7280', label: 'Garage' },
  'Parking': { name: 'car-sport-outline', color: '#6B7280', label: 'Parking' },
  'Air Conditioning': { name: 'snow-outline', color: '#3B82F6', label: 'Air Con' },
  
  // Property Features
  'Road Access': { name: 'car-outline', color: '#6B7280', label: 'Road Access' },
  'Staff Quarters': { name: 'home-outline', color: '#8B5CF6', label: 'Staff Quarters' },
  'Serviced Plot': { name: 'construct-outline', color: '#F59E0B', label: 'Serviced' },
  'Zoned': { name: 'map-outline', color: '#10B981', label: 'Zoned' },
  
  // Commercial
  'Loading Bay': { name: 'cube-outline', color: '#F59E0B', label: 'Loading Bay' },
  'Warehouse Space': { name: 'business-outline', color: '#6B7280', label: 'Warehouse' },
  'Conference Facilities': { name: 'people-outline', color: '#8B5CF6', label: 'Conference' },
  'Restaurant': { name: 'restaurant-outline', color: '#EF4444', label: 'Restaurant' },
  'Fire Safety': { name: 'flame-outline', color: '#EF4444', label: 'Fire Safety' },
  
  // Industrial/Farm
  'Heavy Duty Flooring': { name: 'layers-outline', color: '#6B7280', label: 'Heavy Duty' },
  'Storage Sheds': { name: 'storefront-outline', color: '#8B5CF6', label: 'Storage' },
  'Livestock Facilities': { name: 'paw-outline', color: '#10B981', label: 'Livestock' },
  'Irrigation': { name: 'water-outline', color: '#3B82F6', label: 'Irrigation' },
};

export const getAmenityIcon = (amenity: string): AmenityIcon => {
  return AMENITY_ICON_MAP[amenity] || { 
    name: 'checkmark-circle-outline', 
    color: '#10B981', 
    label: amenity 
  };
};

export const getTopAmenities = (amenities: string[], maxCount: number = 3): AmenityIcon[] => {
  return amenities
    .slice(0, maxCount)
    .map(amenity => getAmenityIcon(amenity));
};
