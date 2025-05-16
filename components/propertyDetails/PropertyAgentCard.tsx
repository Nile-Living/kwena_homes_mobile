import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";

interface Agent {
  photo: string;
  name: string;
  rating: number;
  reviewCount: number;
}

interface PropertyAgentCardProps {
  agent: Agent;
  onViewProfile: () => void;
}

const PropertyAgentCard: React.FC<PropertyAgentCardProps> = ({
  agent,
  onViewProfile,
}) => {
  return (
    <View style={styles.agentCard}>
      <View style={styles.agentHeader}>
        <Text style={styles.sectionTitle}>Listed by</Text>
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={onViewProfile}
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.agentInfo}>
        <Image source={{ uri: agent.photo }} style={styles.agentPhoto} />
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.yellow} />
            <Text style={styles.ratingText}>
              {agent.rating} ({agent.reviewCount} reviews)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PropertyAgentCard;
