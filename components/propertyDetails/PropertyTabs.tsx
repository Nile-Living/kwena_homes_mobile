import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  useAppColors,
  createStyles as createGlobalStyles,
} from "@/styles/PropertyDetails.styles";

interface PropertyTabsProps {
  activeTab: string;
  onTabPress: (tabName: "overview" | "details" | "nearby") => void;
}

const PropertyTabs: React.FC<PropertyTabsProps> = ({
  activeTab,
  onTabPress,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "overview" && styles.activeTab]}
        onPress={() => onTabPress("overview")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "overview" && styles.activeTabText,
          ]}
        >
          Overview
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "details" && styles.activeTab]}
        onPress={() => onTabPress("details")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "details" && styles.activeTabText,
          ]}
        >
          Details
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "nearby" && styles.activeTab]}
        onPress={() => onTabPress("nearby")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "nearby" && styles.activeTabText,
          ]}
        >
          Nearby
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PropertyTabs;