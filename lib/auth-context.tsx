"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { auth } from './firebase';
import { setupNewUserDefaults } from './default-setup';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip auth state listener during SSR
    if (typeof window === 'undefined') {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUser(user);
      setLoading(false);
      
      // Set up defaults for new users
      if (user) {
        try {
          await setupNewUserDefaults(user.uid);
        } catch (error) {
          console.error('Error setting up new user defaults:', error);
          // Don't block the user experience if default setup fails
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Skip actual authentication in SSR
  const isBrowser = typeof window !== 'undefined';

  const signIn = async (email: string, password: string) => {
    if (!isBrowser) return;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (error: any) {
      console.log("Sign-in error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isBrowser) return;
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!isBrowser) return;
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Attempting Google sign-in...');
      
      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign-in successful:', result.user.email);
        setError(null);
      } catch (popupError: any) {
        console.error('Popup error:', popupError);
        
        // If popup fails, try redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          console.log('Popup blocked, trying redirect...');
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
      
      setError(null);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = "Please allow popups for this website to sign in with Google.";
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case 'auth/unauthorized-domain':
          errorMessage = "This domain is not authorized for Google sign-in. Please contact support.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Google sign-in is not enabled. Please contact support.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "Invalid API key. Please contact support.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        default:
          errorMessage = `Sign-in failed: ${error.message}`;
      }
      
      setError(errorMessage);
      throw error; // Re-throw to be handled by the component
    }
  };

  const logout = async () => {
    if (!isBrowser) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 