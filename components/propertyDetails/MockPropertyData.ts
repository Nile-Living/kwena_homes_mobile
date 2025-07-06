// components/propertyDetails/MockPropertyData.ts - Updated to only export utilities
import { DisplayableFeature } from "@/utils/propertyDetailsUtils";
import { Property } from "@/store/useStore";

// Keep only the functions that are actually used, remove mock data
export { generateDisplayableFeatures, getKeyFeaturesForDisplay } from "@/utils/propertyDetailsUtils";

// Remove originalMockProperty export - no longer needed
