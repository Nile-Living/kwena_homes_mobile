import React from "react";
import { View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";

interface IconProps {
  library:
    | "MaterialCommunityIcons"
    | "MaterialIcons"
    | "Ionicons"
    | "FontAwesome";
  name: string;
  size: number;
  color: string;
}

const getIconComponent = ({ library, name, size, color }: IconProps) => {
  switch (library) {
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
      );
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case "Ionicons":
      return <Ionicons name={name as any} size={size} color={color} />;
    case "FontAwesome":
    default:
      return <FontAwesome name={name as any} size={size} color={color} />;
  }
};


interface DisplayableFeature {
  name: string;
  icon: string;
  value: string;
  category: string;
  iconLibrary: IconProps["library"];
}

interface PropertyOverviewContentProps {
  keyFeaturesToDisplay: DisplayableFeature[];
}

const PropertyOverviewContent: React.FC<PropertyOverviewContentProps> = ({
  keyFeaturesToDisplay,
}) => {
  return (
    <View style={styles.overviewContainer}>
      {keyFeaturesToDisplay.length > 0 && (
        <View style={styles.keyFeaturesContainer}>
          {keyFeaturesToDisplay.map((feature, index) => (
            <View key={index} style={styles.keyFeatureCard}>
              {getIconComponent({
                library: feature.iconLibrary,
                name: feature.icon,
                size: 24,
                color: COLORS.primary,
              })}
              <Text style={styles.keyFeatureValue}>{feature.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PropertyOverviewContent;
