import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/styles/PropertyDetails.styles';

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
  return (
    <View style={styles.contactBar}>
      {agentPhone && (
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton]}
          onPress={onCallAgent}
        >
          <Ionicons name="call" size={20} color="white" style={styles.icon} />
          <Text style={styles.contactButtonText}>Call Agent</Text>
        </TouchableOpacity>
      )}
      {agentWhatsApp && (
        <TouchableOpacity
          style={[
            styles.contactButton,
            styles.whatsappButton,
            !agentPhone ? { flex: 1 } : {}, // Take full width if call button is not there
          ]}
          onPress={onWhatsAppAgent}
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.icon} />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      )}
      {!agentPhone && !agentWhatsApp && (
        <View style={styles.noContactContainer}>
            <Text style={styles.noContactText}>Contact information not available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contactBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background, // Or your theme's bar color
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: COLORS.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp green
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  icon: {
    marginRight: 0, // Adjust if needed
  },
  noContactContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  noContactText: {
    fontSize: 16,
    color: COLORS.mediumGray,
  }
});

export default PropertyContactBar;
