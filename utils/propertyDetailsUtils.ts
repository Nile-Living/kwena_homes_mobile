import { Property } from "@/store/useStore";
import { getAmenityIcon } from "./amenityIconMapping";

export interface IconProps {
  library: "MaterialCommunityIcons" | "MaterialIcons" | "Ionicons" | "FontAwesome";
  name: string;
  size: number;
  color: string;
}

export interface DisplayableFeature {
  name: string;
  icon: string;
  value: string;
  category: string;
  iconLibrary: IconProps["library"];
}

export const featureCategories = {
  basic: "Basic Details",
  amenities: "Amenities",
  security: "Security Features", 
  utilities: "Utilities",
  land: "Land Details",
  commercial: "Commercial Details",
} as const;

export const generateDisplayableFeatures = (property: Property): DisplayableFeature[] => {
  const features: DisplayableFeature[] = [];
  
  if (!property) {
    return features;
  }

  if (property.details) {
    const details = property.details;
    
    if (property.category === 'house') {
      if (details.bedrooms) {
        features.push({
          name: 'bedrooms',
          icon: 'bed',
          value: `${details.bedrooms} Bedroom${details.bedrooms > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }
      
      if (details.bathrooms) {
        features.push({
          name: 'bathrooms',
          icon: 'bath',
          value: `${details.bathrooms} Bathroom${details.bathrooms > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }
      
      if (details.garages) {
        features.push({
          name: 'garages',
          icon: 'car',
          value: `${details.garages} Garage${details.garages > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }
      
      if (details.parkings) {
        features.push({
          name: 'parkings',
          icon: 'parking',
          value: `${details.parkings} Parking Space${details.parkings > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }

      if (details.amenities && Array.isArray(details.amenities) && details.amenities.length > 0) {
        details.amenities.forEach((amenity: string) => {
          const amenityIcon = getAmenityIcon(amenity);
          features.push({
            name: `amenity_${amenity.toLowerCase().replace(/\s+/g, '_')}`,
            icon: amenityIcon.name,
            value: amenityIcon.label,
            category: featureCategories.amenities,
            iconLibrary: 'Ionicons'
          });
        });
      }

      if (details.security_features && Array.isArray(details.security_features) && details.security_features.length > 0) {
        details.security_features.forEach((feature: string) => {
          const securityIcon = getAmenityIcon(feature);
          features.push({
            name: `security_${feature.toLowerCase().replace(/\s+/g, '_')}`,
            icon: securityIcon.name,
            value: securityIcon.label,
            category: featureCategories.security,
            iconLibrary: 'Ionicons'
          });
        });
      }
    }
    
    if (property.category === 'land') {
      if (details.size_sqm) {
        features.push({
          name: 'land_size',
          icon: 'texture-box',
          value: `${details.size_sqm.toLocaleString()} m²`,
          category: featureCategories.land,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.legal_status) {
        features.push({
          name: 'legal_status',
          icon: 'file-document-outline',
          value: details.legal_status,
          category: featureCategories.land,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.intended_use) {
        features.push({
          name: 'intended_use',
          icon: 'lightbulb-on-outline',
          value: details.intended_use,
          category: featureCategories.land,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.water_supply) {
        features.push({
          name: 'water_supply',
          icon: 'water',
          value: details.water_supply,
          category: featureCategories.utilities,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.road_access === true) {
        features.push({
          name: 'road_access',
          icon: 'road-variant',
          value: 'Road Access Available',
          category: featureCategories.utilities,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.electricity_available === true) {
        features.push({
          name: 'electricity',
          icon: 'power-plug-outline',
          value: 'Electricity Available',
          category: featureCategories.utilities,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.fenced === true) {
        features.push({
          name: 'fenced',
          icon: 'fence',
          value: 'Property Fenced',
          category: featureCategories.security,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
    }
    
    if (property.category === 'apartment') {
      if (details.bedrooms) {
        features.push({
          name: 'bedrooms',
          icon: 'bed',
          value: `${details.bedrooms} Bedroom${details.bedrooms > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }
      
      if (details.bathrooms) {
        features.push({
          name: 'bathrooms',
          icon: 'bath',
          value: `${details.bathrooms} Bathroom${details.bathrooms > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }
      
      if (details.square_meters) {
        features.push({
          name: 'area',
          icon: 'ruler-combined',
          value: `${details.square_meters} m²`,
          category: featureCategories.basic,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.parking_spaces) {
        features.push({
          name: 'parking',
          icon: 'parking',
          value: `${details.parking_spaces} Parking Space${details.parking_spaces > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }

      if (details.amenities && Array.isArray(details.amenities) && details.amenities.length > 0) {
        details.amenities.forEach((amenity: string) => {
          const amenityIcon = getAmenityIcon(amenity);
          features.push({
            name: `amenity_${amenity.toLowerCase().replace(/\s+/g, '_')}`,
            icon: amenityIcon.name,
            value: amenityIcon.label,
            category: featureCategories.amenities,
            iconLibrary: 'Ionicons'
          });
        });
      }

      if (details.security_features && Array.isArray(details.security_features) && details.security_features.length > 0) {
        details.security_features.forEach((feature: string) => {
          const securityIcon = getAmenityIcon(feature);
          features.push({
            name: `security_${feature.toLowerCase().replace(/\s+/g, '_')}`,
            icon: securityIcon.name,
            value: securityIcon.label,
            category: featureCategories.security,
            iconLibrary: 'Ionicons'
          });
        });
      }
    }
    
    if (property.category === 'commercial') {
      if (details.property_type) {
        features.push({
          name: 'commercial_type',
          icon: 'office-building',
          value: details.property_type,
          category: featureCategories.commercial,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.square_meters) {
        features.push({
          name: 'commercial_area',
          icon: 'ruler-square',
          value: `${details.square_meters} m²`,
          category: featureCategories.commercial,
          iconLibrary: 'MaterialCommunityIcons'
        });
      }
      
      if (details.parking_spaces) {
        features.push({
          name: 'commercial_parking',
          icon: 'parking',
          value: `${details.parking_spaces} Parking Space${details.parking_spaces > 1 ? 's' : ''}`,
          category: featureCategories.basic,
          iconLibrary: 'FontAwesome'
        });
      }

      if (details.amenities && Array.isArray(details.amenities) && details.amenities.length > 0) {
        details.amenities.forEach((amenity: string) => {
          const amenityIcon = getAmenityIcon(amenity);
          features.push({
            name: `amenity_${amenity.toLowerCase().replace(/\s+/g, '_')}`,
            icon: amenityIcon.name,
            value: amenityIcon.label,
            category: featureCategories.amenities,
            iconLibrary: 'Ionicons'
          });
        });
      }

      if (details.security_features && Array.isArray(details.security_features) && details.security_features.length > 0) {
        details.security_features.forEach((feature: string) => {
          const securityIcon = getAmenityIcon(feature);
          features.push({
            name: `security_${feature.toLowerCase().replace(/\s+/g, '_')}`,
            icon: securityIcon.name,
            value: securityIcon.label,
            category: featureCategories.security,
            iconLibrary: 'Ionicons'
          });
        });
      }
    }
  }
  
  return features;
};

export const getKeyFeaturesForDisplay = (
  allFeatures: DisplayableFeature[],
  category?: string
): DisplayableFeature[] => {
  const basicFeatures = allFeatures.filter(f => f.category === featureCategories.basic);
  
  let categorySpecificFeatures: DisplayableFeature[] = [];
  if (category === 'land') {
    categorySpecificFeatures = allFeatures.filter(f => f.category === featureCategories.land);
  } else if (category === 'commercial') {
    categorySpecificFeatures = allFeatures.filter(f => f.category === featureCategories.commercial);
  }
  
  const amenityFeatures = allFeatures.filter(f => 
    f.category === featureCategories.amenities || 
    f.category === featureCategories.utilities ||
    f.category === featureCategories.security
  );
  
  const prioritizedFeatures = [
    ...basicFeatures.slice(0, 2),
    ...categorySpecificFeatures.slice(0, 1),
    ...amenityFeatures.slice(0, 1)
  ].slice(0, 3);
  
  return prioritizedFeatures;
};