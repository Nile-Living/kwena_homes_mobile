import { create } from "zustand";
import { supabase } from "@/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useStore } from "@/store/useStore";
import { API_BASE_URL } from "@/constants/Config";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

export type UserRole = "user" | "agent";

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = Linking.createURL("auth/callback");
console.log("OAuth Redirect URL:", redirectUrl);

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
    role: UserRole
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const constructSession = (data: any): Session | null => {
  if (!data?.accessToken) return null;

  return {
    access_token: data.accessToken,
    refresh_token: data.refreshToken || "",
    token_type: "bearer",
    expires_in: data.expiresIn || 3600,
    expires_at: data.expriesIn
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
      } = await supabase.auth.getSession();
      if (error) throw error;

      const currentUser = session?.user ?? null;

      set({ session, user: currentUser, loading: false, error: null });

      if (currentUser) {
        console.log(
          "checkAuth: User session found, fetching saved properties."
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
          data.message || `Sign up failed (status: ${response.status})`
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
          data.message || "Please check your email to confirm your account."
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

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type !== "success") {
          set({ loading: false, error: "Google Sign-In cancelled." });
          return;
        }

        await get().checkAuth();
      } else {
        throw new Error("Could not get Google 0Auth URL from Supabase.");
      }

      set({ loading: false });
    } catch (error: any) {
      console.error("signInWithGoogle error:", error);
      set({ error: error.message || "Google Sign-In failed.", loading: false });
    }
  },

  signInWithFacebook: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type !== "success") {
          set({ loading: false, error: "Facebook Sign-In cancelled." });
          return;
        }
        await get().checkAuth();
      } else {
        throw new Error("Could not get Facebook OAuth URL from Supabase.");
      }
    } catch (error: any) {
      console.error("signInWithFacebook error:", error);
      set({
        error: error.message || "Facebook Sign-In failed.",
        loading: false,
      });
    }
  },

  initAuthListener: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange Event:", _event, "Session:", !!session);
      const currentUser = session?.user ?? null;
      const currentSession = session ?? null;

      if (
        currentUser?.id !== get().user?.id ||
        currentSession?.access_token !== get().session?.access_token
      ) {
        set({ session: currentSession, user: currentUser, error: null }); 
        if (currentUser) {
          console.log(
            "onAuthStateChange: User detected, fetching saved properties."
          );
          useStore.getState().fetchSavedProperties();
        } else {
          console.log("onAuthStateChange: No user detected.");
          useStore.getState().setSavedProperties([]); 
        }
      }
      set({ loading: false });
    });

    get().checkAuth();

    return () => {
      subscription?.unsubscribe();
    };
  },
}));
