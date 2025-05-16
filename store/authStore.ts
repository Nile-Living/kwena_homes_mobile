// store/authStore.ts
import { create } from "zustand";
import { getSupabase, redirectUri, supabase } from "@/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useStore } from "@/store/useStore";
import { API_BASE_URL } from "@/constants/Config";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  checkAuth: async () => {
    set({ loading: true });
    try {
      const {
        data: { session },
        error,
      } = await getSupabase().auth.getSession();
      if (error) throw error;

      const currentUser = session?.user ?? null;
      set({ session, user: currentUser, loading: false, error: null });

      if (currentUser) {
        console.log(
          "checkAuth: User session found, fetching saved properties.",
        );
        useStore.getState().fetchSavedProperties();
      } else {
        console.log("checkAuth: No active session found.");
        useStore.getState().setSavedProperties([]);
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
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
        // Use error message from backend if available, otherwise default
        throw new Error(
          data.message || `Sign in failed (status: ${response.status})`
        );
      }

      const session = constructSession(data);
      const user = data.user as User | null;

      if (!session || !user) {
        throw new Error(
          "Invalid response received from server during sign in."
        );
      }

      // IMPORTANT: Update Supabase client's internal state
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      set({ user, session, loading: false, error: null });
      console.log("signIn: Sign in successful, fetching saved properties.");
      useStore.getState().fetchSavedProperties(); // Fetch saved properties after successful sign in
      return true; // Indicate success
    } catch (error: any) {
      console.error("signIn error:", error);
      set({ error: error.message, loading: false, user: null, session: null });
      return false; // Indicate failure
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
      const user = data.user as User | null;

      if (session && user) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        set({ user, session, loading: false, error: null });
        console.log("signUp: Sign up successful, fetching saved properties.");
        useStore.getState().fetchSavedProperties();
      } else {
        set({ user: null, session: null, loading: false, error: null });
        Alert.alert(
          "Sign Up Pending",
          data.message || "Please check your email to confirm your account.",
        );
      }
      return true;
    } catch (error: any) {
      console.error("signUp error:", error);
      set({ error: error.message, loading: false, user: null, session: null });
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
      useStore.getState().setSavedProperties([]);
    } catch (error: any) {
      console.error("signOut error:", error);
      set({ error: error.message, loading: false });
    }
  },

// store/authStore.ts
// ... (other imports and code remain the same)

// ...
signInWithGoogle: async () => {
  const supabase = getSupabase();
  // ... (your console logs for crypto and redirectUri) ...
  try {
    set({ loading: true, error: null });
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true, // Keep this true for openAuthSessionAsync
      },
    });

    if (oauthError) throw oauthError;

    if (data.url) {
      console.log("[authStore.ts] Opening auth session with URL:", data.url);
      console.log("[authStore.ts] Expecting redirect back to:", redirectUri);
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri, // This is the scheme your app will respond to
      );
      console.log("[authStore.ts] WebBrowser.openAuthSessionAsync result:", JSON.stringify(result, null, 2));

      if (result.type === 'success' && result.url) {
        console.log("[authStore.ts] Auth session success, URL returned:", result.url);

        // Extract the authorization code from the returned URL
        // The code is usually in a query parameter named 'code'
        const { queryParams } = Linking.parse(result.url);
        const code = queryParams?.code;

        if (typeof code === 'string' && code) {
          console.log("[authStore.ts] Authorization code extracted:", code);

          // Exchange the code for a session
          const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("[authStore.ts] Error exchanging code for session:", exchangeError);
            set({ error: exchangeError.message, loading: false });
            return;
          }

          if (sessionData && sessionData.session && sessionData.user) {
            console.log("[authStore.ts] Session successfully obtained after exchange:", JSON.stringify(sessionData.session, null, 2));

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
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUri, // USE THE IMPORTED URI
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange --- Event:", _event);
      console.log("onAuthStateChange --- Received Session:", JSON.stringify(session, null, 2));
      console.log("onAuthStateChange --- Session User:", JSON.stringify(session?.user, null, 2));
      const currentUser = session?.user ?? null;
      const currentSession = session ?? null;

      const previousUserId = get().user?.id;
      const previousAccessToken = get().session?.access_token;

      console.log("onAuthStateChange --- Previous User ID:", previousUserId);
      console.log("onAuthStateChange --- Current User ID:", currentUser?.id);
      console.log("onAuthStateChange --- Previous Access Token (exists):", !!previousAccessToken);
      console.log("onAuthStateChange --- Current Access Token (exists):", !!currentSession?.access_token);

      if (
        currentUser?.id !== previousUserId ||
        currentSession?.access_token !== previousAccessToken
      ) {
        console.log("onAuthStateChange --- State change detected. Updating store.");
        set({ session: currentSession, user: currentUser, error: null, loading: false }); // Ensure loading is also set false here
        if (currentUser) {
          console.log(
            "onAuthStateChange: User detected, fetching saved properties.",
          );
          useStore.getState().fetchSavedProperties();
        } else {
          console.log("onAuthStateChange: No user detected. Clearing saved properties.");
          useStore.getState().setSavedProperties([]);
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
          phone: profileData.phone, // Directly update phone
          user_metadata: {
            ...currentUser.user_metadata,
            role: profileData.role, // Directly update role in metadata
          },
        };
        const updatedSession = {
            ...currentSession,
            user: updatedUser,
        };
        set({ user: updatedUser, session: updatedSession, loading: false, error: null });
      } else {
         set({ loading: false, error: null }); // Should not happen if token exists
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



