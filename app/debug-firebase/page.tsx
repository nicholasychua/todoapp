"use client";

import { useEffect, useState } from "react";
import { getClientAuth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DebugFirebasePage() {
  const [firebaseStatus, setFirebaseStatus] = useState<{
    initialized: boolean;
    authAvailable: boolean;
    config: {
      apiKey: boolean;
      authDomain: boolean;
      projectId: boolean;
      storageBucket: boolean;
      messagingSenderId: boolean;
      appId: boolean;
    };
  }>({
    initialized: false,
    authAvailable: false,
    config: {
      apiKey: false,
      authDomain: false,
      projectId: false,
      storageBucket: false,
      messagingSenderId: false,
      appId: false,
    },
  });

  useEffect(() => {
    // Check Firebase initialization
    const auth = getClientAuth();

    setFirebaseStatus({
      initialized: typeof window !== "undefined",
      authAvailable: auth !== null,
      config: {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId:
          !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
    });
  }, []);

  const allConfigValid = Object.values(firebaseStatus.config).every(Boolean);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Firebase Debug Panel</h1>
        <p className="text-muted-foreground mb-8">
          Check your Firebase configuration status
        </p>

        {/* Overall Status */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Overall Status</h2>
          <div className="space-y-2">
            <StatusRow
              label="Browser Environment"
              status={firebaseStatus.initialized}
            />
            <StatusRow
              label="Firebase Auth Available"
              status={firebaseStatus.authAvailable}
            />
            <StatusRow
              label="All Config Variables Set"
              status={allConfigValid}
            />
          </div>
        </div>

        {/* Configuration Details */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Check which Firebase config variables are set in your .env.local
            file
          </p>
          <div className="space-y-2">
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_API_KEY"
              status={firebaseStatus.config.apiKey}
            />
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
              status={firebaseStatus.config.authDomain}
            />
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_PROJECT_ID"
              status={firebaseStatus.config.projectId}
            />
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
              status={firebaseStatus.config.storageBucket}
            />
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
              status={firebaseStatus.config.messagingSenderId}
            />
            <StatusRow
              label="NEXT_PUBLIC_FIREBASE_APP_ID"
              status={firebaseStatus.config.appId}
            />
          </div>
        </div>

        {/* Recommendations */}
        {!allConfigValid && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-lg font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
              ⚠️ Configuration Issues Detected
            </h2>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              Some Firebase configuration variables are missing. Follow these
              steps:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              <li>
                Create a .env.local file in your project root (if it doesn't
                exist)
              </li>
              <li>Add all missing Firebase configuration variables</li>
              <li>
                Get these values from Firebase Console → Project Settings →
                General
              </li>
              <li>
                Restart your development server after adding the variables
              </li>
            </ol>
          </div>
        )}

        {!firebaseStatus.authAvailable && allConfigValid && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
              ❌ Firebase Auth Initialization Failed
            </h2>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Config variables are set but Firebase Auth failed to initialize.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
              <li>Verify your API key is correct and not expired</li>
              <li>Check that your Firebase project is active</li>
              <li>
                Ensure Email/Password authentication is enabled in Firebase
                Console
              </li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
        )}

        {firebaseStatus.authAvailable && allConfigValid && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <h2 className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">
              ✅ Firebase Configured Successfully
            </h2>
            <p className="text-sm text-green-800 dark:text-green-200">
              All Firebase configuration checks passed! Your authentication
              should be working.
            </p>
          </div>
        )}

        {/* Email Setup Guide */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For password reset emails to work, you need to configure Firebase
            Console:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Firebase Console → Authentication → Sign-in method</li>
            <li>Enable Email/Password authentication</li>
            <li>Go to Authentication → Templates</li>
            <li>Customize the "Password reset" template</li>
            <li>
              Set the action URL to:{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                http://localhost:3001/reset-password
              </code>{" "}
              (for dev)
            </li>
            <li>
              Add your domain to Authentication → Settings → Authorized domains
            </li>
          </ol>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Firebase Console →
              </Link>
            </Button>
          </div>
        </div>

        {/* Testing */}
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Try these pages to test your authentication:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/forgot-password">Forgot Password</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded bg-muted/30">
      <span className="text-sm font-mono">{label}</span>
      <span
        className={`text-sm font-semibold ${
          status
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {status ? "✓ Set" : "✕ Missing"}
      </span>
    </div>
  );
}
