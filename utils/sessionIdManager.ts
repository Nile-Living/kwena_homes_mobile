// utils/sessionIdManager.ts
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANONYMOUS_SESSION_ID_KEY = "anonymousUserSessionId";

let currentSessionId: string | null = null; // In-memory cache for the current session

/**
 * Retrieves or generates a unique session ID for anonymous users.
 * For logged-in users, this function is not strictly needed if user.id is directly used.
 * However, it's good practice to have a consistent way to get *some* session ID.
 */
export const getAnonymousSessionId = async (): Promise<string> => {
  if (currentSessionId) {
    return currentSessionId;
  }

  try {
    let sessionId = await AsyncStorage.getItem(ANONYMOUS_SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = Crypto.randomUUID();
      await AsyncStorage.setItem(ANONYMOUS_SESSION_ID_KEY, sessionId);
      console.log("Generated new anonymous session ID:", sessionId);
    } else {
      console.log("Retrieved anonymous session ID:", sessionId);
    }
    currentSessionId = sessionId;
    return sessionId;
  } catch (error) {
    console.error("Error managing anonymous session ID:", error);
    // Fallback to a temporary UUID if storage fails, though this won't persist
    const tempId = Crypto.randomUUID();
    currentSessionId = tempId;
    return tempId;
  }
};

/**
 * Clears the in-memory cached session ID.
 * Useful on logout to ensure the next call to getAnonymousSessionId re-evaluates.
 */
export const clearInMemorySessionId = () => {
  currentSessionId = null;
};

// Optional: Function to clear the stored anonymous ID if ever needed (e.g., for testing)
export const clearStoredAnonymousSessionId = async () => {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_SESSION_ID_KEY);
    clearInMemorySessionId();
    console.log("Cleared stored anonymous session ID.");
  } catch (error) {
    console.error("Error clearing stored anonymous session ID:", error);
  }
};
