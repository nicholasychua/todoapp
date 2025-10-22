import { track } from '@vercel/analytics';

// Task management analytics events
export const analytics = {
  // Task creation and management
  taskCreated: (taskText: string, hasTags: boolean, hasDate: boolean) => {
    track('task_created', {
      hasTags,
      hasDate,
      textLength: taskText.length,
    });
  },

  taskCompleted: (taskText: string, completionTime: number) => {
    track('task_completed', {
      textLength: taskText.length,
      completionTime, // time in seconds since creation
    });
  },

  taskDeleted: (taskText: string) => {
    track('task_deleted', {
      textLength: taskText.length,
    });
  },

  taskEdited: (originalText: string, newText: string) => {
    track('task_edited', {
      originalLength: originalText.length,
      newLength: newText.length,
      textChanged: originalText !== newText,
    });
  },

  // Voice input analytics
  voiceInputUsed: (inputLength: number, processingTime: number) => {
    track('voice_input_used', {
      inputLength,
      processingTime,
    });
  },

  voiceInputProcessed: (success: boolean, extractedTags: number, hasDate: boolean) => {
    track('voice_input_processed', {
      success,
      extractedTags,
      hasDate,
    });
  },

  // AI categorization analytics
  aiCategorizationUsed: (taskText: string, suggestedCategory: string, confidence: string) => {
    track('ai_categorization_used', {
      textLength: taskText.length,
      suggestedCategory,
      confidence,
    });
  },

  aiCategorizationFallback: (taskText: string, reason: string) => {
    track('ai_categorization_fallback', {
      textLength: taskText.length,
      reason,
    });
  },

  // View and navigation analytics
  viewChanged: (view: 'todo' | 'backlog' | 'calendar' | 'pomodoro') => {
    track('view_changed', {
      view,
    });
  },

  pomodoroSessionStarted: (taskCount: number, duration: number) => {
    track('pomodoro_session_started', {
      taskCount,
      duration, // in minutes
    });
  },

  pomodoroSessionCompleted: (duration: number, tasksCompleted: number) => {
    track('pomodoro_session_completed', {
      duration,
      tasksCompleted,
    });
  },

  // Category management
  categoryCreated: (categoryName: string, hasDescription: boolean, hasKeywords: boolean) => {
    track('category_created', {
      categoryName,
      hasDescription,
      hasKeywords,
    });
  },

  categoryUsed: (categoryName: string, taskCount: number) => {
    track('category_used', {
      categoryName,
      taskCount,
    });
  },

  // User engagement
  sessionStarted: (userType: 'new' | 'returning') => {
    track('session_started', {
      userType,
    });
  },

  featureUsed: (feature: string, context?: string) => {
    track('feature_used', {
      feature,
      context,
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, context?: string) => {
    track('error_occurred', {
      errorType,
      errorMessage: errorMessage.substring(0, 100), // Limit message length
      context,
    });
  },

  // Performance tracking
  performanceMetric: (metric: string, value: number, unit: string) => {
    track('performance_metric', {
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
