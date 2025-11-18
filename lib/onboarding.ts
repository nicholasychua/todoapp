import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getClientDb } from "./firebase";

export interface OnboardingState {
  completed: boolean;
  completedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}

const ONBOARDING_STEPS = [
  "add-task",
  "try-dictation",
  "explore-subspaces",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/**
 * Get the onboarding state for a user
 */
export async function getOnboardingState(
  userId: string
): Promise<OnboardingState | null> {
  try {
    const db = getClientDb();
    if (!db) {
      console.error("Firestore is not available");
      return null;
    }

    const onboardingRef = doc(db, "onboarding", userId);
    const onboardingDoc = await getDoc(onboardingRef);

    if (!onboardingDoc.exists()) {
      return null;
    }

    const data = onboardingDoc.data();
    return {
      completed: data.completed ?? false,
      completedSteps: data.completedSteps ?? [],
      startedAt: data.startedAt?.toDate() ?? new Date(),
      completedAt: data.completedAt?.toDate(),
    };
  } catch (error) {
    console.error("Error getting onboarding state:", error);
    return null;
  }
}

/**
 * Initialize onboarding for a new user
 */
export async function initializeOnboarding(userId: string): Promise<void> {
  try {
    const db = getClientDb();
    if (!db) {
      console.error("Firestore is not available");
      return;
    }

    // Check if onboarding already exists
    const existingState = await getOnboardingState(userId);
    if (existingState) {
      console.log("Onboarding already initialized for user:", userId);
      return;
    }

    const onboardingRef = doc(db, "onboarding", userId);
    await setDoc(onboardingRef, {
      completed: false,
      completedSteps: [],
      startedAt: new Date(),
    });

    console.log("Onboarding initialized for user:", userId);
  } catch (error) {
    console.error("Error initializing onboarding:", error);
    throw error;
  }
}

/**
 * Mark an onboarding step as completed
 */
export async function completeOnboardingStep(
  userId: string,
  step: OnboardingStep
): Promise<void> {
  try {
    const db = getClientDb();
    if (!db) {
      console.error("Firestore is not available");
      return;
    }

    const onboardingRef = doc(db, "onboarding", userId);
    const state = await getOnboardingState(userId);

    if (!state) {
      // Initialize if it doesn't exist
      await initializeOnboarding(userId);
    }

    const currentSteps = state?.completedSteps ?? [];

    // Don't add duplicate steps
    if (currentSteps.includes(step)) {
      console.log(`Step ${step} already completed`);
      return;
    }

    const updatedSteps = [...currentSteps, step];
    const allCompleted = ONBOARDING_STEPS.every((s) =>
      updatedSteps.includes(s)
    );

    await updateDoc(onboardingRef, {
      completedSteps: updatedSteps,
      completed: allCompleted,
      ...(allCompleted && { completedAt: new Date() }),
    });

    console.log(`Completed onboarding step: ${step}`);
  } catch (error) {
    console.error("Error completing onboarding step:", error);
    throw error;
  }
}

/**
 * Mark the entire onboarding as completed
 */
export async function completeOnboarding(userId: string): Promise<void> {
  try {
    const db = getClientDb();
    if (!db) {
      console.error("Firestore is not available");
      return;
    }

    const onboardingRef = doc(db, "onboarding", userId);

    await updateDoc(onboardingRef, {
      completed: true,
      completedAt: new Date(),
    });

    console.log("Onboarding completed for user:", userId);
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
}

/**
 * Check if user should see onboarding
 */
export async function shouldShowOnboarding(userId: string): Promise<boolean> {
  try {
    const state = await getOnboardingState(userId);

    // Show onboarding if:
    // 1. State doesn't exist (new user)
    // 2. State exists but not completed
    return !state || !state.completed;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}

/**
 * Reset onboarding (for testing purposes)
 */
export async function resetOnboarding(userId: string): Promise<void> {
  try {
    const db = getClientDb();
    if (!db) {
      console.error("Firestore is not available");
      return;
    }

    const onboardingRef = doc(db, "onboarding", userId);
    await setDoc(onboardingRef, {
      completed: false,
      completedSteps: [],
      startedAt: new Date(),
    });

    console.log("Onboarding reset for user:", userId);
  } catch (error) {
    console.error("Error resetting onboarding:", error);
    throw error;
  }
}

