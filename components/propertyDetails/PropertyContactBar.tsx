import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAppColors,
  LIGHT_COLORS,
} from "@/styles/PropertyDetails.styles";

interface PropertyContactBarProps {
  agentPhone: string | null | undefined;
  agentWhatsApp: string | null | undefined;
  onCallAgent: () => void;
  onWhatsAppAgent: () => void;
}

const PropertyContactBar: React.FC<PropertyContactBarProps> = ({
  agentPhone,
  agentWhatsApp,
  onCallAgent,
  onWhatsAppAgent,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createLocalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.contactBar}>
      {agentPhone && (
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton]}
          onPress={onCallAgent}
        >
          <Ionicons
            name="call"
            size={20}
            // CHANGED: Icon color now uses the theme's main text color to be visible
            color={COLORS.text}
            style={styles.icon}
          />
          <Text style={[styles.contactButtonText, styles.callButtonText]}>
            Call Agent
          </Text>
        </TouchableOpacity>
      )}
      {agentWhatsApp && (
        <TouchableOpacity
          style={[
            styles.contactButton,
            styles.whatsappButton,
            !agentPhone ? { flex: 1 } : {},
          ]}
          onPress={onWhatsAppAgent}
        >
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color={LIGHT_COLORS.white}
            style={styles.icon}
          />
          <Text style={[styles.contactButtonText, styles.whatsappButtonText]}>
            WhatsApp
          </Text>
        </TouchableOpacity>
      )}
      {!agentPhone && !agentWhatsApp && (
        <View style={styles.noContactContainer}>
          <Text style={styles.noContactText}>
            Contact information not available.
          </Text>
        </View>
      )}
    </View>
  );
};

const createLocalStyles = (COLORS: ReturnType<typeof useAppColors>) =>
  StyleSheet.create({
    contactBar: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: COLORS.cardBackground,
      borderTopWidth: 1,
      borderTopColor: COLORS.borderColor,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    contactButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    // CHANGED: Styles for the "Call Agent" button to match your example
    callButton: {
      backgroundColor: COLORS.lightGray, // Translates bg-gray-100 / dark:bg-slate-800
      paddingVertical: 16, // Translates py-4
      borderRadius: 12, // Translates rounded-xl
    },
    whatsappButton: {
      backgroundColor: "#25D366",
      borderColor: "#25D366",
      borderWidth: 1.5,
    },
    contactButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    // CHANGED: Styles for the "Call Agent" text
    callButtonText: {
      color: COLORS.text, // Translates text-gray-800 / dark:text-gray-200
      fontWeight: "600", // Translates font-semibold
    },
    whatsappButtonText: {
      color: LIGHT_COLORS.white,
    },
    icon: {
      marginRight: 0,
    },
    noContactContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    noContactText: {
      fontSize: 16,
      color: COLORS.mediumGray,
    },
  });

export default PropertyContactBar;