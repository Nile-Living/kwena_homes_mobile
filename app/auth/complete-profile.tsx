// app/auth/complete-profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function CompleteProfileScreen() {
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserRole>("user");
  const {
    user,
    updateUserProfile, // We'll add this to authStore
    loading: authLoading,
    error: authError,
  } = useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams(); // Get the original redirect path

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleCompleteProfile = async () => {
    if (!phone || !userType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
      Alert.alert(
        "Error",
        "Please enter a valid phone number with the country code (e.g. +260...). It should be linked to your WhatsApp.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    const success = await updateUserProfile({ phone, role: userType });
    setIsLoading(false);

    if (success) {
      const targetPath = (redirectTo as string) || "/";
      router.replace(targetPath as any);
    } else {
      // Error is handled by the authError state from the store, or set local error
      if (!authError) {
        setError("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          title: "Complete Your Profile",
          headerBackVisible: false, // User should complete this step
        }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/icon.png")} // Adjust path if needed
            style={styles.logo}
          />
          <Text style={styles.title}>Almost There!</Text>
          <Text style={styles.subtitle}>
            Please provide a few more details to complete your profile.
          </Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>I am signing up as a...</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              onPress={() => setUserType("user")}
              style={[
                styles.roleButton,
                userType === "user" && styles.roleButtonSelected,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={userType === "user" ? Colors.light.tint : "#4B5563"}
              />
              <Text
                style={[
                  styles.roleText,
                  userType === "user" && styles.roleTextSelected,
                ]}
              >
                Regular User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUserType("agent")}
              style={[
                styles.roleButton,
                userType === "agent" && styles.roleButtonSelected,
              ]}
            >
              <Ionicons
                name="business-outline"
                size={24}
                color={userType === "agent" ? Colors.light.tint : "#4B5563"}
              />
              <Text
                style={[
                  styles.roleText,
                  userType === "agent" && styles.roleTextSelected,
                ]}
              >
                Agent / Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            WhatsApp Phone Number{" "}
            <Text style={styles.tooltipText}>
              (e.g., +260..., used for communication)
            </Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="+260 9..."
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCompleteProfile}
          disabled={isLoading || authLoading}
          style={[
            styles.button,
            (isLoading || authLoading) && styles.buttonDisabled,
          ]}
        >
          {isLoading || authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

// Add some basic styling (adapt from your SignUpScreen or global styles)
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    height: 80,
    width: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 6,
    marginLeft: 4,
  },
  tooltipText: {
    fontSize: 12,
    color: "#718096",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A202C",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10, // For spacing between buttons if using gap
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#F7FAFC",
  },
  roleButtonSelected: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.tint,
  },
  roleText: {
    marginTop: 4,
    fontWeight: "500",
    color: "#4A5568",
  },
  roleTextSelected: {
    color: Colors.light.tint,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#A0AEC0",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    color: "red",
    textAlign: "center",
    fontSize: 14,
  },
});
