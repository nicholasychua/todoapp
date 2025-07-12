"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Plus, Search, MoreHorizontal, Mic, X, Check, ChevronDown, Settings, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useTaskService } from "@/hooks/useTaskService"
import type { Task } from "@/lib/tasks"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SlidingMenu } from "@/components/ui/sliding-menu"
import { useTabGroupService } from "@/hooks/useTabGroupService"
import { TabGroupManager } from "@/components/ui/tab-group-manager"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TabGroup } from "@/lib/tabgroups"
import {
  Category,
  subscribeToCategories,
  addCategory,
  deleteCategory,
} from "@/lib/categories"
import { processVoiceInput, type ProcessedTask } from "@/lib/ai-service"
import { NavigationSidebar } from "@/components/ui/navigation-sidebar"

// Define a color palette for categories
const categoryColors = [
  'text-orange-500',
  'text-blue-500',
  'text-green-500',
  'text-red-500',
  'text-purple-500',
  'text-yellow-500',
  'text-pink-500',
  'text-cyan-500',
  'text-indigo-500',
  'text-amber-500',
];

// Sound wave animation component
function SoundWave() {
  return (
    <div className="flex items-center gap-0.5 h-3">
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["60%", "100%", "60%"]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0
        }}
      />
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["100%", "60%", "100%"]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["60%", "100%", "60%"]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />
    </div>
  )
}

// Create a custom styled checkbox component
function StyledCheckbox({ checked, onCheckedChange, className }: { 
  checked: boolean; 
  onCheckedChange: () => void;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "h-4 w-4 min-h-4 min-w-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors cursor-pointer",
        checked ? "border-gray-400" : "bg-white",
        className
      )}
      onClick={onCheckedChange}
      data-task-checkbox
    >
      {checked && (
        <div className="h-3.5 w-3.5 rounded-full bg-gray-400" style={{ boxShadow: '0 0 0 1px white inset' }} />
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { createTask, updateTask, deleteTask, subscribeToTasks } = useTaskService();
  const { subscribeToTabGroups } = useTabGroupService();
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Redirect to coming soon page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/coming-soon')
    } else if (!loading && user) {
      // If user is authenticated, stay on the home page
      console.log("User authenticated:", user.uid)
    }
  }, [user, loading, router])

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined)
  const [searchText, setSearchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingComplete, setIsRecordingComplete] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showSearch, setShowSearch] = useState(false)
  const { theme, setTheme } = useTheme()
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([])
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)
  const [voiceRaw, setVoiceRaw] = useState("")
  const [voiceStep, setVoiceStep] = useState<'listening' | 'confirm' | 'manual'>('listening');
  const [activeGroup, setActiveGroup] = useState("master");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategoriesMode, setEditCategoriesMode] = useState(false);
  const [draggedCatIdx, setDraggedCatIdx] = useState<number | null>(null);
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);
  const [processedTask, setProcessedTask] = useState<ProcessedTask | null>(null);
  const [manualTaskText, setManualTaskText] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<Record<string, NodeJS.Timeout>>({});

  // Reset all state when user changes
  useEffect(() => {
    // Only run after initial loading is complete
    if (!loading) {
      setTasks([]);
      setNewTaskText("");
      setNewTaskDate(undefined);
      setSearchText("");
      setIsRecording(false);
      setIsRecordingComplete(false);
      setFilter("all");
      setShowSearch(false);
      setSelectedTaskIds([]);
      setTheme("light");
      setSelectedTags([]);
      setCompletedTaskIds([]);
      setPendingCompletions({});
      console.log("Reset all state for user:", user?.uid);
    }
  }, [user?.uid, loading]);

  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState(40)
  const [speechDraft, setSpeechDraft] = useState("")
  const finalTranscriptRef = useRef("");

  // Subscribe to tasks and tab groups
  useEffect(() => {
    if (loading || !user) return;
    const unsubscribeTasks = subscribeToTasks(setTasks);
    const unsubscribeTabGroups = subscribeToTabGroups(setTabGroups);
    const unsubscribeCategories = subscribeToCategories(user.uid, setCategories);
    return () => {
      unsubscribeTasks();
      unsubscribeTabGroups();
      unsubscribeCategories();
    };
  }, [subscribeToTasks, subscribeToTabGroups, user, loading]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchText("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper function to parse tags from text
  const parseTagsFromText = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  };

  // Helper function to format text with tags
  const formatTextWithTags = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.substring(1);
        return (
          <span key={index} className="inline-flex items-center gap-0.5">
            <span className="text-gray-500">{tag}</span>
            <span className={getTagTextColor(tag)}>#</span>
          </span>
        );
      }
      return part;
    });
  };

  // Add task function
  const addTask = async (text?: string, date?: Date) => {
    const taskText = text || newTaskText;
    if (!taskText.trim() || !user) return;

    const tags = parseTagsFromText(taskText);
    const cleanText = taskText.replace(/#\w+/g, '').trim();

    try {
      await createTask({
        text: taskText,
        completed: false,
        createdAt: date || new Date(),
        tags,
        group: "master" as const,
      });
      
      if (!text) {
        setNewTaskText("");
        setNewTaskDate(undefined);
      }
      
      toast.success("Task added!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  // Toggle task completion with 4-second delay
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If task is currently completed, uncomplete it immediately
    if (task.completed) {
      await updateTask(taskId, { completed: false });
      return;
    }

    // If task is not completed, start the 4-second waiting period
    setCompletedTaskIds(prev => [...prev, taskId]);
    
    // Clear any existing timeout for this task
    if (pendingCompletions[taskId]) {
      clearTimeout(pendingCompletions[taskId]);
    }

    // Set a new timeout
    const timeoutId = setTimeout(async () => {
      try {
        await updateTask(taskId, { completed: true });
        setCompletedTaskIds(prev => prev.filter(id => id !== taskId));
        setPendingCompletions(prev => {
          const newPending = { ...prev };
          delete newPending[taskId];
          return newPending;
        });
      } catch (error) {
        console.error("Failed to complete task:", error);
        // Remove from completed list on error
        setCompletedTaskIds(prev => prev.filter(id => id !== taskId));
        setPendingCompletions(prev => {
          const newPending = { ...prev };
          delete newPending[taskId];
          return newPending;
        });
      }
    }, 4000);

    setPendingCompletions(prev => ({
      ...prev,
      [taskId]: timeoutId
    }));
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Delete task function
  const deleteTaskHandler = async (taskId: string) => {
    if (!user) return;
    
    try {
      await deleteTask(taskId);
      toast.success("Task deleted!");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  // Voice recording functions
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsRecording(true);
      setIsRecordingComplete(false);
      setSpeechDraft("");
      finalTranscriptRef.current = "";
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }
      
      setSpeechDraft(finalTranscriptRef.current + interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast.error("Speech recognition error");
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      setIsRecordingComplete(true);
      setVoiceRaw(finalTranscriptRef.current);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleManualGenerate = async () => {
    if (!manualTaskText.trim()) return;
    
    try {
      const processed = await processVoiceInput(manualTaskText);
      setProcessedTask(processed);
      setVoiceStep('confirm');
    } catch (error) {
      console.error('Error processing manual input:', error);
      toast.error("Failed to process input");
    }
  };

  // Process voice input when recording is complete
  useEffect(() => {
    if (isRecordingComplete && voiceRaw) {
      const processVoice = async () => {
        try {
          const processed = await processVoiceInput(voiceRaw);
          setProcessedTask(processed);
          setVoiceStep('confirm');
        } catch (error) {
          console.error('Error processing voice input:', error);
          setVoiceStep('manual');
          setManualTaskText(voiceRaw);
        }
      };
      
      processVoice();
    }
  }, [isRecordingComplete, voiceRaw]);

  // Filter tasks based on filter, search text, and selected tags
  const filteredTasks = tasks.filter(task => {
    // Check if task is in 4-second waiting period
    const isInWaitingPeriod = completedTaskIds.includes(task.id);
    // Determine effective completion status (local state takes priority)
    const effectivelyCompleted = isInWaitingPeriod || task.completed;
    
    return (
      (activeGroup === "master" ? true : task.group === "today") &&
      (searchText ? task.text.toLowerCase().includes(searchText.toLowerCase()) : true) &&
      (filter === "completed" ? effectivelyCompleted : filter === "active" ? !effectivelyCompleted : true) &&
      (selectedTags.length > 0 ? selectedTags.every(tag => task.tags.includes(tag)) : true) &&
      // Hide completed tasks that are not in waiting period (only on home page)
      !(effectivelyCompleted && !isInWaitingPeriod)
    );
  });

  // Get all unique tags with their counts
  const tagCounts = tasks.reduce((acc, task) => {
    task.tags.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Merge tags from tasks and categories
  const allTags = Array.from(new Set([
    ...Object.keys(tagCounts),
    ...categories.map((cat) => cat.name),
  ]))
    .filter(tag => tag !== 'tag' && tag !== 'shopping')
    .sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));

  // Helper function to get color for a tag
  const getTagColor = (tag: string) => {
    const index = allTags.indexOf(tag) % categoryColors.length;
    return categoryColors[index].split(' ')[0]; // Get just the background color class to use as text color
  };

  // Helper function to convert bg color to text color
  const getTagTextColor = (tag: string) => {
    const index = allTags.indexOf(tag);
    if (index === -1) return "text-gray-500";
    const colorIndex = index % categoryColors.length;
    return categoryColors[colorIndex];
  };

  // Update task with new date
  const updateTaskDate = async (taskId: string, newDate: Date) => {
    if (!user) return
    
    try {
      await updateTask(taskId, { createdAt: newDate });
      toast.success("Task date updated!");
    } catch (error) {
      toast.error("Failed to update task date");
    }
  };

  // Helper to reorder categories
  const moveCategory = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= categories.length || to >= categories.length) return;
    const updated = [...categories];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setCategories(updated);
    // TODO: Optionally update backend order here
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingCompletions).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, [pendingCompletions]);

  // Handle clicks outside of task checkboxes to immediately complete pending tasks
  const handleContainerClick = (e: React.MouseEvent) => {
    // Check if the click target is not a checkbox or its container
    const target = e.target as HTMLElement;
    const isCheckboxClick = target.closest('[data-task-checkbox]') || target.closest('.checkbox-container');
    
    if (!isCheckboxClick && Object.keys(pendingCompletions).length > 0) {
      // Immediately complete all pending tasks
      Object.keys(pendingCompletions).forEach(taskId => {
        clearTimeout(pendingCompletions[taskId]);
        updateTask(taskId, { completed: true });
      });
      setPendingCompletions({});
      setCompletedTaskIds([]);
    }
  };

  // Force light theme on component mount
  useEffect(() => {
    setTheme("light")
  }, [setTheme])

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden" onClick={handleContainerClick}>
      {/* Navigation Sidebar */}
      <NavigationSidebar currentPage="home" />

      {/* Sliding Menu */}
      <SlidingMenu>
        <TabGroupManager />
      </SlidingMenu>

      {/* Main content area */}
      <div className="w-full max-w-2xl flex flex-col justify-center items-center h-full">
        {/* Date Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            {(() => {
              const date = new Date();
              const weekday = date.toLocaleDateString('en-US', { 
                weekday: 'long',
                timeZone: 'America/Los_Angeles'
              });
              const dateString = date.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'long',
                timeZone: 'America/Los_Angeles'
              }).replace(/(\d+)/, (match) => {
                const num = parseInt(match);
                const suffix = num % 10 === 1 && num !== 11 ? 'st' : 
                               num % 10 === 2 && num !== 12 ? 'nd' : 
                               num % 10 === 3 && num !== 13 ? 'rd' : 'th';
                return `${num}${suffix}`;
              });
              
              return (
                <>
                  <span className="text-gray-900">{weekday}, </span>
                  <span className="text-gray-400">{dateString}</span>
                </>
              );
            })()}
          </h1>
        </div>

        {/* Add Task Input */}
        <div className="w-full max-w-md mb-8">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="What needs to be done?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
                className="pr-20 text-base h-12 border-gray-200 focus:border-gray-300 focus:ring-0 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <DatePicker
                  date={newTaskDate}
                  setDate={setNewTaskDate}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startRecording}
                  disabled={isRecording}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => addTask()}
              className="h-12 px-6 rounded-xl"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Voice Recording Modal */}
        {(isRecording || isRecordingComplete || showVoiceMenu) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              {voiceStep === 'listening' && (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {isRecording ? "Listening..." : "Processing..."}
                    </h3>
                    {isRecording && (
                      <div className="flex justify-center mb-4">
                        <SoundWave />
                      </div>
                    )}
                    {speechDraft && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {speechDraft}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (isRecording) {
                          stopRecording();
                        } else {
                          setShowVoiceMenu(false);
                          setIsRecordingComplete(false);
                          setVoiceStep('listening');
                        }
                      }}
                      className="flex-1"
                    >
                      {isRecording ? "Stop" : "Cancel"}
                    </Button>
                  </div>
                </>
              )}

              {voiceStep === 'confirm' && processedTask && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Confirm Task</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Task:</label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{processedTask.taskName}</p>
                      </div>
                      {processedTask.date && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date:</label>
                          <p className="text-sm bg-gray-50 p-2 rounded">
                            {new Date(processedTask.date + 'T00:00:00').toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {processedTask.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Tags:</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {processedTask.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVoiceMenu(false);
                        setIsRecordingComplete(false);
                        setVoiceStep('listening');
                        setProcessedTask(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        const taskText = `${processedTask.taskName} ${processedTask.tags.map(tag => `#${tag}`).join(' ')}`;
                        
                        let taskDate: Date | undefined = undefined;
                        if (processedTask.date) {
                          const timeString = processedTask.time || '00:00';
                          taskDate = new Date(`${processedTask.date}T${timeString}`);
                        }
                        
                        await addTask(taskText, taskDate);
                        setShowVoiceMenu(false);
                        setIsRecordingComplete(false);
                        setVoiceStep('listening');
                        setProcessedTask(null);
                      }}
                      className="flex-1"
                    >
                      Add Task
                    </Button>
                  </div>
                </>
              )}

              {voiceStep === 'manual' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Manual Input</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Speech recognition failed. Please type your task manually:
                    </p>
                    <textarea
                      ref={textareaRef}
                      value={manualTaskText}
                      onChange={(e) => setManualTaskText(e.target.value)}
                      placeholder="Type your task here..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVoiceMenu(false);
                        setIsRecordingComplete(false);
                        setVoiceStep('listening');
                        setManualTaskText("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleManualGenerate}
                      disabled={!manualTaskText.trim()}
                      className="flex-1"
                    >
                      Generate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks... (⌘K)"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-gray-300 focus:ring-0 rounded-lg"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("active")}>
                  Active Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("completed")}>
                  Completed Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border transition-colors",
                    selectedTags.includes(tag)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  #{tag}
                </button>
              ))}
              {allTags.length > 8 && (
                <button
                  onClick={() => setShowTagManager(true)}
                  className="text-xs px-2 py-1 rounded-full border bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                >
                  +{allTags.length - 8} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="w-full max-w-md">
          <Card className="rounded-2xl border border-gray-200 shadow-none">
            <div className="p-0">
              <AnimatePresence initial={false}>
                {filteredTasks.map((task, idx) => {
                  // Date logic
                  const hasDate = task.createdAt instanceof Date;
                  const today = new Date();
                  let isPastOrToday = false;
                  let dateString = '';
                  let timeString = '';
                  if (hasDate) {
                    const d = task.createdAt;
                    dateString = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
                    isPastOrToday = d.setHours(0,0,0,0) <= today.setHours(0,0,0,0);
                    // Only show time if not midnight (00:00 or 12:00 AM)
                    const hours = d.getHours();
                    const minutes = d.getMinutes();
                    if (!(hours === 0 && minutes === 0)) {
                      timeString = d.toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles'
                      });
                    }
                  }
                  
                  // Determine effective completion status using local state
                  const isInWaitingPeriod = completedTaskIds.includes(task.id);
                  const effectivelyCompleted = isInWaitingPeriod || task.completed;
                  
                  return (
                    <motion.div
                      key={task.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ 
                        opacity: 0,
                        transition: { 
                          duration: 0.25, // quick fade
                          ease: "easeInOut"
                        }
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                      className={cn(
                        "flex items-start px-4 py-2 min-h-[40px] group hover:bg-accent/50 transition-colors relative",
                        idx !== filteredTasks.length - 1 && "border-b border-gray-200",
                        effectivelyCompleted ? "bg-muted/30" : ""
                      )}
                    >
                      {/* Checkbox */}
                      <StyledCheckbox
                        checked={effectivelyCompleted}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="flex-shrink-0 mt-0.5"
                      />
                      {/* Main content: flex-1 row, name/date left, tags bottom right */}
                      <div className="flex flex-1 flex-row min-w-0 ml-3 items-end">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn(
                            "text-sm font-normal truncate transition-colors duration-200",
                            effectivelyCompleted ? "text-muted-foreground opacity-70" : "text-gray-900"
                          )}>
                            {formatTextWithTags(task.text)}
                          </span>
                          {hasDate && (
                            <span className={cn(
                              "text-xs font-medium transition-colors duration-200 mt-0.5",
                              isPastOrToday ? "text-red-600" : "text-gray-400"
                            )}>
                              {dateString}{timeString ? `, ${timeString}` : ''}
                            </span>
                          )}
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end items-end ml-3">
                            {task.tags.map((tag) => (
                              <span key={tag} className="text-xs font-medium flex items-center gap-0.5">
                                <span className="text-gray-500">{tag}</span> <span className={getTagTextColor(tag)}>#</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTaskHandler(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No tasks found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 