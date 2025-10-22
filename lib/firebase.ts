import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, addDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

// Validate Firebase configuration
function validateFirebaseConfig() {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    console.error('Current config:', firebaseConfig);
    return false;
  }
  
  console.log('Firebase configuration validated successfully');
  return true;
}
  
// Initialize Firebase safely for SSR
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check if we're in a browser environment and not in SSR
if (typeof window !== 'undefined') {
  // Validate config before initialization
  if (validateFirebaseConfig()) {
    // Only initialize Firebase on the client side
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase app');
    }
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase services initialized');
  } else {
    console.error('Firebase configuration validation failed');
    // Create mock objects to prevent crashes
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
  }
} else {
  // Mock implementations for SSR
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db }; 

// Safe, client-only accessors to avoid SSR using mocked instances
export function getClientAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!getApps().length) {
      if (!validateFirebaseConfig()) return null;
      initializeApp(firebaseConfig);
    }
    return getAuth();
  } catch (error) {
    console.error('Failed to get client Auth:', error);
    return null;
  }
}

export function getClientDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!getApps().length) {
      if (!validateFirebaseConfig()) return null;
      initializeApp(firebaseConfig);
    }
    return getFirestore();
  } catch (error) {
    console.error('Failed to get client Firestore:', error);
    return null;
  }
}