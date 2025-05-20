import {  COLORS } from "@/styles/PropertyDetails.styles";
import { DisplayableFeature, IconProps } from "@/utils/propertyDetailsUtils";
import { Property, useStore } from "@/store/useStore";

export const originalMockProperty = {
  id: "property-123",
  title: "Luxurious Riverside Villa",
  subtitle: "Executive Home in Exclusive Neighborhood",
  price: 2750000,
  priceUnit: "K",
  location: "30 Leopards Hill, Lusaka",
  coordinates: { latitude: -15.3875, longitude: 28.3228 },
  status: "premium" as keyof typeof COLORS.statusColor,
  listedDate: "3 weeks ago",
  description:
    "This magnificent property offers a perfect blend of luxury and comfort. Nestled in a serene environment with panoramic views of the surrounding landscape, this villa features high-end finishes, spacious living areas, and state-of-the-art amenities. The property includes a large swimming pool, landscaped gardens, and a private gym. The open floor plan creates a seamless flow between indoor and outdoor living spaces, making it ideal for entertaining guests.",
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
  ],
  category: "house",
  details: {
    bedrooms: 5,
    bathrooms: 4.5,
    size_sqm: 450,
    garages: 3,
    pool: true,
    garden: true,
    security_details: "24/7 Security",
    wifi_details: "High-speed Internet",
    ac_details: "Central AC",
    is_furnished: true,
    gym_details: "Private Gym",
    year_built: 2021,
  },
  nearbyPlaces: [
    { name: "International School", distance: "0.5 km", icon: "school" },
    { name: "Shopping Mall", distance: "1.2 km", icon: "shopping-bag" },
    { name: "Hospital", distance: "3.5 km", icon: "hospital-o" },
    { name: "Park", distance: "0.8 km", icon: "tree" },
  ],
  agent: {
    id: "agent-456",
    name: "Sarah Mwanza",
    photo:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 124,
    phone: "+260 97 1234567",
    email: "sarah.mwanza@kwenahomes.com",
  },
  liked: true,
  propertyType: "Villa",
  viewCount: 342,
};

export function generateDisplayableFeatures(
  property: Property | null
): DisplayableFeature[] {
  if (!property) return [];
  const features: DisplayableFeature[] = [];
  const details = property.details || originalMockProperty.details;
  const pCategory = property.category?.toLowerCase();

  const addFeature = (
    name: string,
    icon: string,
    value: any,
    category: string,
    iconLib: IconProps["library"],
    condition: any = value
  ) => {
    if (
      condition !== null &&
      typeof condition !== "undefined" &&
      condition !== ""
    ) {
      features.push({
        name,
        icon,
        value: String(value),
        category,
        iconLibrary: iconLib,
      });
    }
  };
  const addFeatureFromBool = (
    name: string,
    icon: string,
    displayValue: string,
    category: string,
    iconLib: IconProps["library"],
    condition?: boolean
  ) => {
    if (condition === true) {
      features.push({
        name,
        icon,
        value: displayValue,
        category,
        iconLibrary: iconLib,
      });
    }
  };
  const addFeaturesFromArray = (
    key: string,
    icon: string,
    category: string,
    iconLib: IconProps["library"]
  ) => {
    if (details && details[key] && Array.isArray(details[key])) {
      details[key].forEach((item: string) => {
        addFeature(
          `${key}_${item.toLowerCase().replace(/\s/g, "")}`,
          icon,
          item,
          category,
          iconLib
        );
      });
    }
  };

  if (pCategory === "house") {
    addFeature(
      "bedrooms",
      "bed",
      details?.bedrooms ? `${details.bedrooms} Bedrooms` : null,
      "basic",
      "FontAwesome",
      details?.bedrooms
    );
    addFeature(
      "bathrooms",
      "bath",
      details?.bathrooms ? `${details.bathrooms} Bathrooms` : null,
      "basic",
      "FontAwesome",
      details?.bathrooms
    );
    addFeature(
      "garage",
      "car",
      details?.garages ? `${details.garages} Car Garage` : null,
      "outdoor",
      "FontAwesome",
      details?.garages
    );
    addFeature(
      "parking",
      "parking",
      details?.parkings ? `${details.parkings} Parking Spaces` : null,
      "outdoor",
      "FontAwesome",
      details?.parkings
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeatureFromBool(
      "pool",
      "pool",
      "Swimming Pool",
      "outdoor",
      "MaterialIcons",
      originalMockProperty.details.pool
    );
    addFeatureFromBool(
      "garden",
      "leaf",
      "Landscaped Garden",
      "outdoor",
      "FontAwesome",
      originalMockProperty.details.garden
    );
  } else if (pCategory === "land") {
    addFeature(
      "size",
      "texture-box",
      details?.size_sqm ? `${details.size_sqm} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.size_sqm
    );
    addFeature(
      "legalStatus",
      "file-document-outline",
      details?.legal_status,
      "details",
      "MaterialCommunityIcons"
    );
    addFeature(
      "intendedUse",
      "lightbulb-on-outline",
      details?.intended_use,
      "details",
      "MaterialCommunityIcons"
    );
    addFeatureFromBool(
      "roadAccess",
      "road-variant",
      "Road Access",
      "outdoor",
      "MaterialCommunityIcons",
      details?.road_access
    );
    addFeature(
      "waterSupply",
      "water",
      details?.water_supply ? `Water: ${details.water_supply}` : null,
      "amenities",
      "MaterialCommunityIcons",
      details?.water_supply
    );
    addFeatureFromBool(
      "electricity",
      "power-plug-outline",
      "Electricity Available",
      "amenities",
      "MaterialCommunityIcons",
      details?.electricity_available
    );
    addFeatureFromBool(
      "fenced",
      "fence",
      "Fenced",
      "outdoor",
      "MaterialCommunityIcons",
      details?.fenced
    );
  } else if (pCategory === "apartment") {
    addFeature(
      "bedrooms",
      "bed",
      details?.bedrooms ? `${details.bedrooms} Bedrooms` : null,
      "basic",
      "FontAwesome",
      details?.bedrooms
    );
    addFeature(
      "bathrooms",
      "bath",
      details?.bathrooms ? `${details.bathrooms} Bathrooms` : null,
      "basic",
      "FontAwesome",
      details?.bathrooms
    );
    addFeature(
      "size",
      "ruler-combined",
      details?.square_meters ? `${details.square_meters} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.square_meters
    );
    addFeature(
      "parking",
      "parking",
      details?.parking_spaces
        ? `${details.parking_spaces} Parking Spaces`
        : null,
      "outdoor",
      "FontAwesome",
      details?.parking_spaces
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
  } else if (pCategory === "commercial") {
    addFeature(
      "commercialType",
      "office-building",
      details?.property_type,
      "basic",
      "MaterialCommunityIcons",
      details?.property_type
    );
    addFeature(
      "size",
      "ruler-square",
      details?.square_meters ? `${details.square_meters} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.square_meters
    );
    addFeature(
      "parking",
      "parking",
      details?.parking_spaces
        ? `${details.parking_spaces} Parking Spaces`
        : null,
      "outdoor",
      "FontAwesome",
      details?.parking_spaces
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
  }

  if (
    originalMockProperty.details.year_built &&
    !features.some((f) => f.name === "year")
  ) {
    addFeature(
      "year",
      "calendar",
      `Built ${originalMockProperty.details.year_built}`,
      "details",
      "FontAwesome"
    );
  }
  return features;
}

export const getKeyFeaturesForDisplay = (
  allGeneratedFeatures: DisplayableFeature[],
  pCategory: string | undefined
): DisplayableFeature[] => {
  let keys: DisplayableFeature[] = [];
  const categoryLower = pCategory?.toLowerCase();

  if (categoryLower === "house" || categoryLower === "apartment") {
    keys = ["bedrooms", "bathrooms", "size", "parking", "garage"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  } else if (categoryLower === "land") {
    keys = ["size", "roadAccess", "legalStatus"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  } else if (categoryLower === "commercial") {
    keys = ["commercialType", "size", "parking"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  }

  if (keys.length < 3) {
    const basicFeatures = allGeneratedFeatures.filter(
      (f) => f.category === "basic"
    );
    keys = [
      ...keys,
      ...basicFeatures.filter((bf) => !keys.some((k) => k.name === bf.name)),
    ];
  }
  if (keys.length < 3) {
    keys = [
      ...keys,
      ...allGeneratedFeatures.filter(
        (af) => !keys.some((k) => k.name === af.name)
      ),
    ];
  }
  return keys.slice(0, 3);
};