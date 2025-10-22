"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getClientAuth } from "./firebase";
import { setupNewUserDefaults } from "./default-setup";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip auth state listener during SSR
    if (typeof window === "undefined") {
      return;
    }

    const clientAuth = getClientAuth();
    if (
      !clientAuth ||
      typeof (clientAuth as any).onAuthStateChanged !== "function"
    ) {
      console.error(
        "Firebase Auth not initialized; skipping auth state listener."
      );
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      clientAuth,
      async (user: User | null) => {
        setUser(user);
        setLoading(false);

        // Set up defaults for new users
        if (user) {
          try {
            await setupNewUserDefaults(user.uid);
          } catch (error) {
            console.error("Error setting up new user defaults:", error);
            // Don't block the user experience if default setup fails
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Skip actual authentication in SSR
  const isBrowser = typeof window !== "undefined";

  const signIn = async (email: string, password: string) => {
    if (!isBrowser) return;

    const clientAuth = getClientAuth();
    if (!clientAuth) {
      const errorMsg =
        "Authentication is not available. Please check your Firebase configuration.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await signInWithEmailAndPassword(clientAuth, email, password);
      setError(null);
    } catch (error: any) {
      console.log("Sign-in error:", error);
      let errorMsg = "Failed to sign in. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMsg = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMsg = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address.";
      } else if (error.code === "auth/invalid-credential") {
        errorMsg = "Invalid email or password.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isBrowser) return;

    const clientAuth = getClientAuth();
    if (!clientAuth) {
      const errorMsg =
        "Authentication is not available. Please check your Firebase configuration.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await createUserWithEmailAndPassword(clientAuth, email, password);
      setError(null);
    } catch (error: any) {
      console.log("Sign-up error:", error);
      let errorMsg = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMsg = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signInWithGoogle = async () => {
    if (!isBrowser) return;

    const clientAuth = getClientAuth();
    if (!clientAuth) {
      const errorMsg =
        "Authentication is not available. Please check your Firebase configuration.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      console.log("Attempting Google sign-in...");
      const result = await signInWithPopup(clientAuth, provider);
      console.log("Google sign-in successful:", result.user.email);
      setError(null);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      switch (error.code) {
        case "auth/popup-blocked":
          errorMessage =
            "Please allow popups for this website to sign in with Google.";
          break;
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case "auth/unauthorized-domain":
          errorMessage =
            "This domain is not authorized for Google sign-in. Please contact support.";
          break;
        case "auth/operation-not-allowed":
          errorMessage =
            "Google sign-in is not enabled. Please contact support.";
          break;
        case "auth/invalid-api-key":
          errorMessage = "Invalid API key. Please contact support.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your connection and try again.";
          break;
        default:
          errorMessage = `Sign-in failed: ${error.message}`;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isBrowser) return;

    const clientAuth = getClientAuth();
    if (!clientAuth) {
      const errorMsg =
        "Authentication is not available. Please check your Firebase configuration.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await sendPasswordResetEmail(clientAuth, email);
      setError(null);
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMsg = "Failed to send password reset email. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMsg = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg = "Too many requests. Please try again later.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    if (!isBrowser) return;

    const clientAuth = getClientAuth();
    if (!clientAuth) {
      console.error("Authentication is not available.");
      return;
    }

    await signOut(clientAuth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
