import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";

interface PropertyContactBarProps {
  agentPhone?: string;
  onMessageAgent: () => void;
  onCallAgent: () => void;
  onWhatsAppAgent: () => void;
}

const PropertyContactBar: React.FC<PropertyContactBarProps> = ({
  agentPhone,
  onMessageAgent,
  onCallAgent,
  onWhatsAppAgent,
}) => {
  return (
    <View style={styles.contactBar}>
      <TouchableOpacity style={styles.contactButton} onPress={onMessageAgent}>
        <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
        <Text style={styles.contactButtonText}>Message</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.contactButton,
          styles.callButton,
          !agentPhone && styles.disabledButton,
        ]}
        onPress={onCallAgent}
        disabled={!agentPhone}
      >
        <Ionicons name="call-outline" size={20} color={COLORS.white} />
        <Text style={styles.callButtonText}>Call Agent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.contactButton,
          styles.whatsappButton,
          !agentPhone && styles.disabledButton,
        ]}
        onPress={onWhatsAppAgent}
        disabled={!agentPhone}
      >
        <Ionicons name="logo-whatsapp" size={22} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

export default PropertyContactBar;
