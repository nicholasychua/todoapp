import { track } from '@vercel/analytics';

// Dual tracking: Send events to both Vercel Analytics and Google Analytics
const trackEvent = (eventName: string, eventParams: Record<string, any>) => {
  // Send to Vercel Analytics
  track(eventName, eventParams);
  
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Task management analytics events
export const analytics = {
  // Task creation and management
  taskCreated: (taskText: string, hasTags: boolean, hasDate: boolean) => {
    trackEvent('task_created', {
      hasTags,
      hasDate,
      textLength: taskText.length,
    });
  },

  taskCompleted: (taskText: string, completionTime: number) => {
    trackEvent('task_completed', {
      textLength: taskText.length,
      completionTime, // time in seconds since creation
    });
  },

  taskDeleted: (taskText: string) => {
    trackEvent('task_deleted', {
      textLength: taskText.length,
    });
  },

  taskEdited: (originalText: string, newText: string) => {
    trackEvent('task_edited', {
      originalLength: originalText.length,
      newLength: newText.length,
      textChanged: originalText !== newText,
    });
  },

  // Voice input analytics
  voiceInputUsed: (inputLength: number, processingTime: number) => {
    trackEvent('voice_input_used', {
      inputLength,
      processingTime,
    });
  },

  voiceInputProcessed: (success: boolean, extractedTags: number, hasDate: boolean) => {
    trackEvent('voice_input_processed', {
      success,
      extractedTags,
      hasDate,
    });
  },

  // AI categorization analytics
  aiCategorizationUsed: (taskText: string, suggestedCategory: string, confidence: string) => {
    trackEvent('ai_categorization_used', {
      textLength: taskText.length,
      suggestedCategory,
      confidence,
    });
  },

  aiCategorizationFallback: (taskText: string, reason: string) => {
    trackEvent('ai_categorization_fallback', {
      textLength: taskText.length,
      reason,
    });
  },

  // View and navigation analytics
  viewChanged: (view: 'todo' | 'backlog' | 'calendar' | 'pomodoro') => {
    trackEvent('view_changed', {
      view,
    });
  },

  pomodoroSessionStarted: (taskCount: number, duration: number) => {
    trackEvent('pomodoro_session_started', {
      taskCount,
      duration, // in minutes
    });
  },

  pomodoroSessionCompleted: (duration: number, tasksCompleted: number) => {
    trackEvent('pomodoro_session_completed', {
      duration,
      tasksCompleted,
    });
  },

  // Category management
  categoryCreated: (categoryName: string, hasDescription: boolean, hasKeywords: boolean) => {
    trackEvent('category_created', {
      categoryName,
      hasDescription,
      hasKeywords,
    });
  },

  categoryUsed: (categoryName: string, taskCount: number) => {
    trackEvent('category_used', {
      categoryName,
      taskCount,
    });
  },

  // User engagement
  sessionStarted: (userType: 'new' | 'returning') => {
    trackEvent('session_started', {
      userType,
    });
  },

  featureUsed: (feature: string, context?: string) => {
    trackEvent('feature_used', {
      feature,
      context,
    });
  },

  // Authentication tracking
  userSignedUp: (method: 'email' | 'google', userId: string) => {
    trackEvent('user_signed_up', {
      method,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  userSignedIn: (method: 'email' | 'google', userId: string) => {
    trackEvent('user_signed_in', {
      method,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  authenticationError: (method: 'email' | 'google', errorCode: string, errorMessage: string) => {
    trackEvent('authentication_error', {
      method,
      errorCode,
      errorMessage: errorMessage.substring(0, 100),
    });
  },

  // Onboarding tracking
  onboardingStarted: (userId: string) => {
    trackEvent('onboarding_started', {
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  onboardingStepCompleted: (userId: string, step: string) => {
    trackEvent('onboarding_step_completed', {
      userId,
      step,
      timestamp: new Date().toISOString(),
    });
  },

  onboardingCompleted: (userId: string, completionTime: number) => {
    trackEvent('onboarding_completed', {
      userId,
      completionTime, // time in seconds from account creation
      timestamp: new Date().toISOString(),
    });
  },

  onboardingSkipped: (userId: string, completedSteps: number, totalSteps: number) => {
    trackEvent('onboarding_skipped', {
      userId,
      completedSteps,
      totalSteps,
      completionRate: (completedSteps / totalSteps) * 100,
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, context?: string) => {
    trackEvent('error_occurred', {
      errorType,
      errorMessage: errorMessage.substring(0, 100), // Limit message length
      context,
    });
  },

  // Performance tracking
  performanceMetric: (metric: string, value: number, unit: string) => {
    trackEvent('performance_metric', {
      metric,
      value,
      unit,
    });
  },
};

// Helper function to track task completion time
export const trackTaskCompletion = (task: { text: string; createdAt: Date }) => {
  const completionTime = (Date.now() - task.createdAt.getTime()) / 1000; // seconds
  analytics.taskCompleted(task.text, completionTime);
};

// Helper function to track AI service usage
export const trackAIServiceUsage = async <T>(
  serviceName: string,
  operation: () => Promise<T>,
  fallback: () => T
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    analytics.performanceMetric(`${serviceName}_success`, duration, 'ms');
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    analytics.performanceMetric(`${serviceName}_error`, duration, 'ms');
    analytics.errorOccurred(
      `${serviceName}_error`,
      error instanceof Error ? error.message : 'Unknown error',
      serviceName
    );
    
    return fallback();
  }
};
