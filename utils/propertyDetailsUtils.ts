export interface IconProps {
    library:
      | "MaterialCommunityIcons"
      | "MaterialIcons"
      | "Ionicons"
      | "FontAwesome";
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
  
  export const featureCategories = [
    { id: "basic", name: "Basic Information" },
    { id: "interior", name: "Interior Features" },
    { id: "outdoor", name: "Outdoor Features" },
    { id: "amenities", name: "Amenities" },
    { id: "details", name: "Additional Details" },
  ];
  