import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import {
  useAppColors,
  createStyles as createGlobalStyles,
} from "@/styles/PropertyDetails.styles";
import { getAmenityIcon } from "@/utils/amenityIconMapping";

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
  const amenityIcon = getAmenityIcon(name);
  const iconColor = amenityIcon && amenityIcon.color ? amenityIcon.color : color;

  switch (library) {
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={name as any}
          size={size}
          color={iconColor}
        />
      );
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={iconColor} />;
    case "Ionicons":
      return <Ionicons name={name as any} size={size} color={iconColor} />;
    case "FontAwesome":
    default:
      return <FontAwesome name={name as any} size={size} color={iconColor} />;
  }
};

interface DisplayableFeature {
  name: string;
  icon: string;
  value: string;
  category: string;
  iconLibrary: IconProps["library"];
}

interface FeatureCategory {
  id: string;
  name: string;
}

interface PropertyDetailsContentProps {
  description: string;
  displayableFeatures: DisplayableFeature[];
  visibleFeatures: DisplayableFeature[];
  showAllFeatures: boolean;
  onShowAllFeaturesToggle: () => void;
  featureCategories: FeatureCategory[];
  groupedFeatures: Record<string, DisplayableFeature[]>;
}

const PropertyDetailsContent: React.FC<PropertyDetailsContentProps> = ({
  description,
  displayableFeatures,
  visibleFeatures,
  showAllFeatures,
  onShowAllFeaturesToggle,
  featureCategories,
  groupedFeatures,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.detailsContainer}>
      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      )}

      {displayableFeatures.length > 0 && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Property Features</Text>
          <View style={styles.featuresGrid}>
            {visibleFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                {getIconComponent({
                  library: feature.iconLibrary,
                  name: feature.icon,
                  size: 18,
                  color: COLORS.primary,
                })}
                <Text style={styles.featureText}>{feature.value}</Text>
              </View>
            ))}
          </View>

          {displayableFeatures.length > 6 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={onShowAllFeaturesToggle}
            >
              <Text style={styles.showMoreText}>
                {showAllFeatures ? "Show Less" : "Show All Features"}
              </Text>
              <Ionicons
                name={showAllFeatures ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {featureCategories.map((category) => {
        const featuresForCategory = groupedFeatures[category.id];
        if (!featuresForCategory || featuresForCategory.length === 0)
          return null;

        return (
          <View key={category.id} style={styles.featureCategory}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.categoryFeaturesGrid}>
              {featuresForCategory.map((feature, index) => (
                <View key={index} style={styles.detailFeatureItem}>
                  {getIconComponent({
                    library: feature.iconLibrary,
                    name: feature.icon,
                    size: 18,
                    color: COLORS.primary,
                  })}
                  <Text style={styles.featureText}>{feature.value}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default PropertyDetailsContent;