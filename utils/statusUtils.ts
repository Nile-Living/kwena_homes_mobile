// src/utils/statusUtils.ts

import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon library

// Define the possible status values
export type PropertyStatus =
  | "available"
  | "occupied"
  | "rented"
  | "off-market"
  | "under-maintenance"
  | "pending-approval";

// Define the structure for status display options
export interface StatusOption {
  value: PropertyStatus;
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name']; // Use Ionicons names
}

// Define the actual status options
export const statusOptions: StatusOption[] = [
  { value: "available", label: "Available", color: "#4CAF50", icon: "checkmark-circle-outline" }, // Changed icon slightly
  { value: "occupied", label: "Occupied", color: "#FF9800", icon: "home" },
  { value: "rented", label: "Rented", color: "#2196F3", icon: "cash" }, // Shortened label
  { value: "off-market", label: "Off Market", color: "#9E9E9E", icon: "eye-off" },
  { value: "under-maintenance", label: "Maintenance", color: "#FFC107", icon: "construct" }, // Shortened label
  { value: "pending-approval", label: "Pending", color: "#673AB7", icon: "time" }, // Shortened label
];

// Helper function to get details for a specific status
export const getStatusDetails = (status?: string | null): StatusOption | null => {
  if (!status) return null;
  // Find the option, default to null if not found or if status is 'available' (we might not want to show 'available' badge everywhere)
  const found = statusOptions.find((option) => option.value === status);
  // Optionally: return null for 'available' to hide it on general cards
  // if (found?.value === 'available') return null;
  return found || null;
};

export const DEFAULT_PROPERTY_STATUS: PropertyStatus = "available";
