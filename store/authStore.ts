// store/authStore.ts
import { create } from "zustand";
import { getSupabase, redirectUri, supabase } from "@/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useStore } from "@/store/useStore";
import { API_BASE_URL } from "@/constants/Config";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useNotificationsStore } from "@/store/notificationStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";

export type UserRole = "user" | "agent";

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    phone: string,
    role: UserRole,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initAuthListener: () => () => void;
  updateUserProfile: (profileData: {
    phone: string;
    role: UserRole;
  }) => Promise<boolean>;
  initializeUserStores: (user: User) => void;
  clearUserStores: () => void;
}

const constructSession = (data: any): Session | null => {
  if (!data?.accessToken) return null;

  return {
    access_token: data.accessToken,
    refresh_token: data.refreshToken || "",
    token_type: "bearer",
    expires_in: data.expiresIn || 3600,
    expires_at: data.expiresIn
      ? Date.now() / 1000 + data.expiresIn
      : Date.now() / 1000 + 3600,
    user: data.user as User,
  };
};

// Helper function to create a proper Session object with updated user
const createUpdatedSession = (originalSession: Session | null, updatedUser: User): Session | null => {
  if (!originalSession || !originalSession.access_token) return null;
  
  return {
    access_token: originalSession.access_token,
    refresh_token: originalSession.refresh_token || "",
    token_type: originalSession.token_type || "bearer",
    expires_in: originalSession.expires_in || 3600,
    expires_at: originalSession.expires_at || (Date.now() / 1000 + 3600),
    user: updatedUser,
  } as Session;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  initializeUserStores: (user: User) => {
    console.log("initializeUserStores: Starting store initialization for user:", user.id);
    
    // Always fetch saved properties
    useStore.getState().fetchSavedProperties();
    
    // Get user role
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    console.log("initializeUserStores: User role:", userRole);
    
    const subscriptionStore = useSubscriptionStore.getState();
    const notificationStore = useNotificationsStore.getState();
    
    if (userRole === 'user') {
      console.log("initializeUserStores: Initializing stores for regular user");
      
      // Fetch subscription data for regular users
      subscriptionStore.fetchActiveSubscription().then(() => {
        const { isSubscribed } = useSubscriptionStore.getState();
        if (isSubscribed) {
          console.log("initializeUserStores: User is subscribed, fetching notifications");
          notificationStore.fetchNotifications(true);
        }
      });
      
      // Fetch saved searches for regular users
      notificationStore.fetchSavedSearches();
      
    } else if (userRole === 'agent') {
      console.log("initializeUserStores: Initializing stores for agent");
      
      // Fetch notifications for agents (promotion-related)
      notificationStore.fetchNotifications(true);
    }
  },

  clearUserStores: () => {
    console.log("clearUserStores: Clearing all user-specific store data");
    
    useStore.getState().setSavedProperties([]);
    useSubscriptionStore.getState().clearSubscriptionData();
    
    const notificationStore = useNotificationsStore.getState();
    notificationStore.clearNotifications();
    notificationStore.clearSavedSearches();
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const {
        data: { session },
        error,
      } = await getSupabase().auth.getSession();
      if (error) throw error;
  
      let currentUser = session?.user ?? null;
      let updatedSession = session;
      
      // If we have a user but no role in metadata, fetch it from profiles
      if (currentUser && !currentUser.user_metadata?.role && !currentUser.app_metadata?.role && session?.access_token) {
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/profiles/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            currentUser = {
              ...currentUser,
              user_metadata: {
                ...currentUser.user_metadata,
                role: profileData.role,
              },
            };
            // Create updated session with the new user data
            updatedSession = createUpdatedSession(session, currentUser);
          }
        } catch (profileError) {
          console.warn("Could not fetch user profile during checkAuth:", profileError);
        }
      }
  
      set({
        session: updatedSession,
        user: currentUser,
        loading: false,
        error: null,
      });
  
      if (currentUser) {
        console.log("checkAuth: User session found, initializing stores.");
        get().initializeUserStores(currentUser);
      } else {
        console.log("checkAuth: No active session found, clearing stores.");
        get().clearUserStores();
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      get().clearUserStores();
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(
          data.message || `Sign in failed (status: ${response.status})`
        );
      }
  
      const session = constructSession(data);
      let user = data.user as User | null;
  
      if (!session || !user) {
        throw new Error(
          "Invalid response received from server during sign in."
        );
      }
  
      console.log("signIn --- Initial user metadata:", JSON.stringify(user.user_metadata, null, 2));
  
      // Fetch user profile to get the role
      try {
        console.log("signIn --- Fetching user profile with token:", session.access_token.substring(0, 20) + "...");
        const profileResponse = await fetch(`${API_BASE_URL}/profiles/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        
        console.log("signIn --- Profile response status:", profileResponse.status);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log("signIn --- Profile data received:", JSON.stringify(profileData, null, 2));
          
          if (profileData.role) {
            user = {
              ...user,
              user_metadata: {
                ...user.user_metadata,
                role: profileData.role,
              },
            };
            console.log("signIn --- Updated user metadata:", JSON.stringify(user.user_metadata, null, 2));
          } else {
            console.log("signIn --- No role found in profile data");
          }
        } else {
          const errorText = await profileResponse.text();
          console.error("signIn --- Profile fetch failed:", profileResponse.status, errorText);
        }
      } catch (profileError) {
        console.error("signIn --- Could not fetch user profile:", profileError);
      }
  
      // Update session with modified user
      const updatedSession = createUpdatedSession(session, user);
  
      // IMPORTANT: Update Supabase client's internal state
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
  
      console.log("signIn --- Final user object being set:", JSON.stringify(user, null, 2));
      set({ user, session: updatedSession, loading: false, error: null });
      console.log("signIn: Sign in successful, initializing stores.");
      get().initializeUserStores(user);
      return true;
    } catch (error: any) {
      console.error("signIn error:", error);
      set({ error: error.message, loading: false, user: null, session: null });
      get().clearUserStores();
      return false;
    }
  },

  signUp: async (email, password, phone, role) => {
    const supabase = getSupabase();

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `Sign up failed (status: ${response.status})`,
        );
      }

      const session = constructSession(data);
      let user = data.user as User | null;

      if (session && user) {
        // Update user with role in metadata if available
        if (role) {
          user = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              role: role,
            },
          };
        }

        const updatedSession = createUpdatedSession(session, user);

        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        set({ user, session: updatedSession, loading: false, error: null });
        console.log("signUp: Sign up successful, initializing stores.");
        get().initializeUserStores(user);
      } else {
        set({ user: null, session: null, loading: false, error: null });
        get().clearUserStores();
        Alert.alert(
          "Sign Up Pending",
          data.message || "Please check your email to confirm your account.",
        );
      }
      return true;
    } catch (error: any) {
      console.error("signUp error:", error);
      set({ error: error.message, loading: false, user: null, session: null });
      get().clearUserStores();
      return false;
    }
  },

  signOut: async () => {
    const supabase = getSupabase();

    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, loading: false, error: null });
      get().clearUserStores();
    } catch (error: any) {
      console.error("signOut error:", error);
      set({ error: error.message, loading: false });
    }
  },

  signInWithGoogle: async () => {
    const supabase = getSupabase();
    try {
      set({ loading: true, error: null });
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) throw oauthError;

      if (data.url) {
        console.log("[authStore.ts] Opening auth session with URL:", data.url);
        console.log("[authStore.ts] Expecting redirect back to:", redirectUri);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );
        console.log("[authStore.ts] WebBrowser.openAuthSessionAsync result:", JSON.stringify(result, null, 2));

        if (result.type === 'success' && result.url) {
          console.log("[authStore.ts] Auth session success, URL returned:", result.url);

          const { queryParams } = Linking.parse(result.url);
          const code = queryParams?.code;

          if (typeof code === 'string' && code) {
            console.log("[authStore.ts] Authorization code extracted:", code);

            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error("[authStore.ts] Error exchanging code for session:", exchangeError);
              set({ error: exchangeError.message, loading: false });
              return;
            }

            if (sessionData && sessionData.session && sessionData.user) {
              console.log("[authStore.ts] Session successfully obtained after exchange:", JSON.stringify(sessionData.session, null, 2));
              // The session will be handled by the auth state change listener
            } else {
              console.error("[authStore.ts] No session data returned from exchangeCodeForSession.");
              set({ error: "Failed to obtain session after exchanging code.", loading: false });
            }
          } else {
            console.error("[authStore.ts] Authorization code not found in callback URL.", result.url);
            set({ error: "Authorization code missing in callback.", loading: false });
          }
        } else if (result.type !== 'success') {
          set({ loading: false, error: `Google Sign-In failed or cancelled. Result type: ${result.type}` });
          return;
        }
      } else {
        throw new Error("Could not get Google OAuth URL from Supabase.");
      }

    } catch (error: any) {
      console.error("[authStore.ts] signInWithGoogle error:", error);
      set({ error: error.message || "Google Sign-In failed.", loading: false });
    }
  },

  signInWithFacebook: async () => {
    const supabase = getSupabase();

    set({ loading: true, error: null });
    console.log("signInWithFacebook - Using Redirect URI from supabaseClient:", redirectUri);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );
        if (result.type !== "success") {
          set({ loading: false, error: "Facebook Sign-In cancelled." });
          return;
        }
      } else {
        throw new Error("Could not get Facebook OAuth URL from Supabase.");
      }
      set({ loading: false });
    } catch (error: any) {
      console.error("signInWithFacebook error:", error);
      set({
        error: error.message || "Facebook Sign-In failed.",
        loading: false,
      });
    }
  },

  initAuthListener: () => {
    const supabase = getSupabase();

    set({ loading: true });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("onAuthStateChange --- Event:", _event);
      console.log("onAuthStateChange --- Received Session:", JSON.stringify(session, null, 2));
      console.log("onAuthStateChange --- Session User:", JSON.stringify(session?.user, null, 2));
      
      let currentUser = session?.user ?? null;
      let currentSession = session ?? null;

      const previousUserId = get().user?.id;
      const previousAccessToken = get().session?.access_token;

      console.log("onAuthStateChange --- Previous User ID:", previousUserId);
      console.log("onAuthStateChange --- Current User ID:", currentUser?.id);
      console.log("onAuthStateChange --- Previous Access Token (exists):", !!previousAccessToken);
      console.log("onAuthStateChange --- Current Access Token (exists):", !!currentSession?.access_token);

      // Fetch role if user exists but doesn't have role in metadata
      if (currentUser && !currentUser.user_metadata?.role && !currentUser.app_metadata?.role && currentSession?.access_token) {
        console.log("onAuthStateChange --- User has no role in metadata, fetching from profiles...");
        try {
          console.log("onAuthStateChange --- Making request to /profiles/me with token:", currentSession.access_token.substring(0, 20) + "...");
          
          const profileResponse = await fetch(`${API_BASE_URL}/profiles/me`, {
            headers: { Authorization: `Bearer ${currentSession.access_token}` },
          });
          
          console.log("onAuthStateChange --- Profile response status:", profileResponse.status);
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log("onAuthStateChange --- Profile data received:", JSON.stringify(profileData, null, 2));
            
            if (profileData.role) {
              console.log("onAuthStateChange --- Updating user with role:", profileData.role);
              currentUser = {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  role: profileData.role,
                },
              };
              currentSession = createUpdatedSession(currentSession, currentUser);
              console.log("onAuthStateChange --- Updated user metadata:", JSON.stringify(currentUser.user_metadata, null, 2));
            } else {
              console.log("onAuthStateChange --- No role found in profile data");
            }
          } else {
            const errorText = await profileResponse.text();
            console.error("onAuthStateChange --- Profile fetch failed:", profileResponse.status, errorText);
          }
        } catch (profileError) {
          console.error("onAuthStateChange --- Error fetching user profile:", profileError);
        }
      } else {
        console.log("onAuthStateChange --- User role check:", {
          hasUser: !!currentUser,
          hasRoleInUserMetadata: !!currentUser?.user_metadata?.role,
          hasRoleInAppMetadata: !!currentUser?.app_metadata?.role,
          hasAccessToken: !!currentSession?.access_token,
          userMetadata: currentUser?.user_metadata,
          appMetadata: currentUser?.app_metadata
        });
      }

      if (
        currentUser?.id !== previousUserId ||
        currentSession?.access_token !== previousAccessToken
      ) {
        console.log("onAuthStateChange --- State change detected. Updating store.");
        console.log("onAuthStateChange --- Final user object:", JSON.stringify(currentUser, null, 2));
        set({ session: currentSession, user: currentUser, error: null, loading: false });
        if (currentUser) {
          console.log("onAuthStateChange: User detected, initializing stores.");
          get().initializeUserStores(currentUser);
        } else {
          console.log("onAuthStateChange: No user detected. Clearing stores.");
          get().clearUserStores();
        }
      } else {
        console.log("onAuthStateChange --- No significant state change detected. Not updating store.");
        set({ loading: false });
      }
    });

    get().checkAuth();

    return () => {
      subscription?.unsubscribe();
    };
  },

  updateUserProfile: async (profileData) => {
    set({ loading: true, error: null });
    const token = get().session?.access_token;
    const userId = get().user?.id;

    if (!token || !userId) {
      set({
        error: "Authentication required to update profile.",
        loading: false,
      });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Failed to update profile (status: ${response.status})`,
        );
      }

      const { data: updatedUserData, error: userUpdateError } =
        await supabase.auth.updateUser({
          data: { role: profileData.role },
          phone: profileData.phone,
        });

      if (userUpdateError) {
        console.warn("authStore:updateUserProfile - Failed to update local Supabase user object:", userUpdateError.message);
      }

      const currentUser = get().user;
      const currentSession = get().session;

      if (currentUser && currentSession) {
        const updatedUser = {
          ...currentUser,
          phone: profileData.phone,
          user_metadata: {
            ...currentUser.user_metadata,
            role: profileData.role,
          },
        };
        const updatedSession = createUpdatedSession(currentSession, updatedUser);
        set({ user: updatedUser, session: updatedSession, loading: false, error: null });
        
        // Re-initialize stores with updated user role
        console.log("updateUserProfile: Profile updated, re-initializing stores.");
        get().initializeUserStores(updatedUser);
      } else {
         set({ loading: false, error: null });
      }

      console.log("updateUserProfile: Profile update successful.");
      return true;
    } catch (error: any) {
      console.error("updateUserProfile error:", error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));
