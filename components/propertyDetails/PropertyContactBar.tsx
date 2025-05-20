import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

interface PropertyContactBarProps {
  agentPhone?: string;
  onCallAgent: () => void;
  onWhatsAppAgent: () => void;
}

const PropertyContactBar: React.FC<PropertyContactBarProps> = ({
  agentPhone,
  onCallAgent,
  onWhatsAppAgent,
}) => {
  const isPhoneAvailable = !!agentPhone;

  return (
    <View style={styles.contactBarContainer}>
      <TouchableOpacity
        style={[
          styles.callButton,
          !isPhoneAvailable && styles.disabledButton,
        ]}
        onPress={onCallAgent}
        disabled={!isPhoneAvailable}
        accessibilityLabel="Call agent"
        accessibilityRole="button"
      >
        <Ionicons name="call-outline" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>Call Agent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.whatsappButton,
          !isPhoneAvailable && styles.disabledButton,
        ]}
        onPress={onWhatsAppAgent}
        disabled={!isPhoneAvailable}
        accessibilityLabel="Contact agent via WhatsApp"
        accessibilityRole="button"
      >
        <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contactBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#244835", // Primary action color
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366", // WhatsApp brand color
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#AAAAAA",
  },
});

export default PropertyContactBar;