import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAppColors,
  createStyles as createGlobalStyles,
} from "@/styles/PropertyDetails.styles";

interface Agent {
  photo: string | null;
  name: string;
  phone: string | null;
}

interface PropertyAgentCardProps {
  agent: Agent;
  onViewProfile: () => void;
}

const PropertyAgentCard: React.FC<PropertyAgentCardProps> = ({
  agent,
  onViewProfile,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  const handleCall = () => {
    if (agent.phone) {
      Linking.openURL(`tel:${agent.phone}`);
    } else {
      Alert.alert(
        "Not Available",
        "Phone number not provided for this contact.",
      );
    }
  };

  return (
    <View style={styles.agentCard}>
      <View style={styles.agentHeader}>
        <Text style={styles.sectionTitle}>Listed by</Text>
      </View>

      <View style={styles.agentInfo}>
        {agent.photo ? (
          <Image source={{ uri: agent.photo }} style={styles.agentPhoto} />
        ) : (
          <View style={styles.agentPhotoIconContainer}>
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={COLORS.mediumGray}
            />
          </View>
        )}
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>{agent.name}</Text>
          {agent.phone ? (
            <TouchableOpacity
              onPress={handleCall}
              style={styles.phoneContainer}
            >
              <Ionicons name="call-outline" size={16} color={COLORS.primary} />
              <Text style={styles.agentPhoneText}>{agent.phone}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.agentPhoneNotAvailableText}>
              Phone not available
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default PropertyAgentCard;