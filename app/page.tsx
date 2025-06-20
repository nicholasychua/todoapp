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

export default function TaskManager() {
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
      // If user is authenticated, stay on the main page
      console.log("User authenticated:", user.uid)
    }
  }, [user, loading, router])

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(new Date())
  const [searchText, setSearchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingComplete, setIsRecordingComplete] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showSearch, setShowSearch] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
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

  // Reset all state when user changes
  useEffect(() => {
    // Only run after initial loading is complete
    if (!loading) {
      setTasks([]);
      setNewTaskText("");
      setNewTaskDate(new Date());
      setSearchText("");
      setIsRecording(false);
      setIsRecordingComplete(false);
      setFilter("all");
      setShowSearch(false);
      setShowPomodoro(false);
      setTheme("light");
      setSelectedTags([]);
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

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Handle keyboard events for voice control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !isRecording) {
        startRecording()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' && isRecording) {
        stopRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRecording])

  // Parse tags from text (words starting with #)
  const parseTagsFromText = (text: string): string[] => {
    const tagRegex = /#(\w+)/g
    const matches = text.match(tagRegex) || []
    return matches.map((tag) => tag.substring(1))
  }

  // Format text with colored tags
  const formatTextWithTags = (text: string) => {
    const parts = text.split(/(#\w+)/)
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Badge
            key={index}
            variant="secondary"
            className="mx-1 font-normal bg-transparent text-gray-500 hover:bg-gray-100"
          >
            {part}
          </Badge>
        )
      }
      return part
    })
  }

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks((newTasks: Task[]) => {
      setTasks(newTasks)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to tab groups
  useEffect(() => {
    if (!user) return

    console.log("Setting up tab groups subscription in main component");
    try {
      const unsubscribe = subscribeToTabGroups((newTabGroups) => {
        console.log("Tab groups updated in main component:", newTabGroups.length);
        setTabGroups(newTabGroups);
      });

      return () => {
        console.log("Cleaning up tab groups subscription in main component");
        unsubscribe();
      }
    } catch (error) {
      console.error("Error subscribing to tab groups in main component:", error);
    }
  }, [user, subscribeToTabGroups]);

  // Subscribe to categories
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCategories(user.uid, (cats) => setCategories(cats));
    return () => unsubscribe();
  }, [user]);

  // Add a new task
  const addTask = async (text?: string, date?: Date) => {
    if (!user) return
    
    const value = isRecording ? speechDraft : (typeof text === "string" ? text : newTaskText);
    if (!value.trim()) return;
    
    try {
      const tags = parseTagsFromText(value);
      await createTask({
        text: value,
        completed: false,
        tags,
        createdAt: date ?? (newTaskDate || new Date()),
        group: "master"
      });
      setNewTaskText("");
      setSpeechDraft("");
      setNewTaskDate(new Date());
      toast.success("Task added successfully!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return
    
    try {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        await updateTask(taskId, { completed: !task.completed })
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  }

  // Delete a task
  const deleteTaskHandler = async (taskId: string) => {
    if (!user) return
    
    try {
      await deleteTask(taskId)
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  }

  // Start voice recording and transcription
  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(true);
    setIsRecordingComplete(false);
    setSpeechDraft("");
    finalTranscriptRef.current = "";
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support Speech Recognition.");
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      const combined = finalTranscript + (interimTranscript ? " " + interimTranscript : "");
      setSpeechDraft(combined);
      finalTranscriptRef.current = combined;
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setIsRecordingComplete(false);
      recognition.stop();
    };
    recognition.onend = async () => {
      setIsRecording(false);
      setIsRecordingComplete(true);
      setVoiceRaw(finalTranscriptRef.current);
      setShowVoiceMenu(true);

      if (!finalTranscriptRef.current.trim()) {
        setVoiceStep('manual');
        setManualTaskText('');
        return;
      }

      try {
        const result = await processVoiceInput(finalTranscriptRef.current);
        setProcessedTask(result);
        setVoiceStep('confirm');
      } catch (error) {
        console.error("Failed to process voice input, switching to manual mode.", error);
        setManualTaskText(finalTranscriptRef.current);
        setVoiceStep('manual');
      }
    };
    recognition.start();
    setVoiceStep('listening');
  };

  // Stop voice recording
  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  const handleManualGenerate = async () => {
    if (!manualTaskText.trim()) return;

    try {
      const result = await processVoiceInput(manualTaskText);
      setProcessedTask(result);
      setVoiceRaw(manualTaskText);
      setVoiceStep('confirm');
    } catch (error) {
      console.error("Failed to process manual input:", error);
      toast.error("Failed to generate task. Please try again.");
    }
  };

  // Filter tasks based on filter, search text, and selected tags
  const filteredTasks = tasks.filter(task =>
    (activeGroup === "master" ? true : task.group === "today") &&
    (searchText ? task.text.toLowerCase().includes(searchText.toLowerCase()) : true) &&
    (filter === "completed" ? task.completed : filter === "active" ? !task.completed : true) &&
    (selectedTags.length > 0 ? selectedTags.every(tag => task.tags.includes(tag)) : true)
  );

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

  const handleLightSwitch = () => {
    setShowPomodoro((prev) => !prev);
  };

  // Force light theme on component mount
  useEffect(() => {
    setTheme("light")
  }, [setTheme])

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Note: The state will be reset by our effect hook when user changes
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      {/* Custom Sidebar - ONLY Focus Session and Log out */}
      <div className="absolute left-0 top-0 h-full w-48 bg-gray-50 p-4 flex flex-col">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 mb-12 px-4 pt-6">
          <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="text-lg font-semibold text-gray-900">subspace</span>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={handleLightSwitch}
          >
            Focus Session
          </button>
          <button 
            className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Sliding Menu */}
      <SlidingMenu>
        <TabGroupManager />
      </SlidingMenu>

      {/* Main content area with animation */}
      <div className="w-full max-w-2xl flex flex-col justify-center items-center pt-32 pb-32">
        <AnimatePresence mode="wait">
          {showPomodoro ? (
            <motion.div
              key="pomodoro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <PomodoroTimer 
                tasks={tasks}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTaskHandler}
                formatTextWithTags={formatTextWithTags}
                updateTaskDate={updateTaskDate}
                tabGroups={tabGroups}
              />
            </motion.div>
          ) : (
            <motion.div
              key="todo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full space-y-6"
            >
              {/* Date Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
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
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={isRecording ? speechDraft : newTaskText}
                      onChange={(e) => {
                        if (isRecording) {
                          setSpeechDraft(e.target.value);
                        } else {
                          setNewTaskText(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addTask();
                        }
                      }}
                      placeholder="Add new task"
                      rows={1}
                      className="w-full resize-none overflow-hidden bg-white outline-none border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center h-12 pt-[14px]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className={cn(
                            "h-8 text-gray-500 hover:text-gray-700 flex items-center justify-center",
                            newTaskDate && !isSameDay(newTaskDate, new Date()) ? "px-2" : "w-8 px-0"
                          )}>
                            {newTaskDate && !isSameDay(newTaskDate, new Date()) ? (
                              <span className="text-xs font-medium whitespace-nowrap">
                                {newTaskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                              </span>
                            ) : (
                              <CalendarIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">Select date for this task</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={newTaskDate}
                            onSelect={(date) => setNewTaskDate(date || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button 
                        onClick={() => addTask()} 
                        size="icon" 
                        className="h-8 w-8 shrink-0 rounded-lg bg-gray-900 hover:bg-gray-800 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
                      />
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="relative z-10 w-full max-w-2xl mx-4"
                      >
                        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden">
                          <div className="p-8">
                            <div className="flex flex-col items-center space-y-8">
                              <motion.div 
                                className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center"
                              >
                                <div className="scale-150">
                                  <SoundWave />
                                </div>
                              </motion.div>
                              <motion.div 
                                className="text-center space-y-4"
                              >
                                <motion.h3 
                                  className="text-2xl font-semibold"
                                >
                                  Listening...
                                </motion.h3>
                                <div className="min-h-[60px] px-4 py-3 bg-muted/50 rounded-xl">
                                  <p className="text-lg text-muted-foreground">
                                    {speechDraft || "Speak now..."}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Release Ctrl to stop recording
                                </p>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isRecording && (
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                      <div className="flex items-center">
                        <Mic className="h-4 w-4 mr-1" />
                        Hold Ctrl
                      </div>
                    </Button>
                  </div>
                )}
              </div>

              {/* Tag Management Section */}
              <div className="mb-8 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-muted-foreground">Browse by Category</h3>
                  <div className="ml-4">
                    <AnimatePresence initial={false} mode="wait">
                      {!editCategoriesMode ? (
                        <motion.div
                          key="edit-btn"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="outline"
                            className="rounded-full px-4 py-2 text-xs font-medium min-h-7"
                            onClick={() => setEditCategoriesMode(true)}
                          >
                            Edit Categories
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="input"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="relative flex items-center"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (newTaskText.trim() && !allTags.includes(newTaskText.trim()) && user) {
                              await addCategory(newTaskText.trim(), user.uid);
                              setNewTaskText("");
                            }
                          }}
                        >
                          <Input
                            autoFocus
                            placeholder="New category..."
                            className="h-7 text-xs rounded-full pr-8 min-w-[120px]"
                            value={newTaskText}
                            onChange={e => setNewTaskText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Escape') {
                                setEditCategoriesMode(false);
                                setNewTaskText('');
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                            type="button"
                            tabIndex={0}
                            onClick={() => {
                              setEditCategoriesMode(false);
                              setNewTaskText('');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-3 items-center px-1">
                  {allTags.map((tag, idx) => {
                    const catObj = categories.find((c) => c.name === tag);
                    const catIdx = categories.findIndex((c) => c.name === tag);
                    return (
                      <div
                        key={tag}
                        className="relative flex items-center"
                        draggable={editCategoriesMode && catObj ? true : false}
                        onDragStart={editCategoriesMode && catObj ? () => setDraggedCatIdx(catIdx) : undefined}
                        onDragOver={editCategoriesMode && catObj ? (e) => { e.preventDefault(); setDragOverCatIdx(catIdx); } : undefined}
                        onDrop={editCategoriesMode && catObj ? (e) => {
                          e.preventDefault();
                          if (draggedCatIdx !== null && dragOverCatIdx !== null && draggedCatIdx !== dragOverCatIdx) {
                            moveCategory(draggedCatIdx, dragOverCatIdx);
                          }
                          setDraggedCatIdx(null);
                          setDragOverCatIdx(null);
                        } : undefined}
                        onDragEnd={editCategoriesMode && catObj ? () => { setDraggedCatIdx(null); setDragOverCatIdx(null); } : undefined}
                      >
                        <Button
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={cn(
                            "flex items-center justify-center rounded-full text-[10px] font-medium shadow-none transition-all duration-200",
                            editCategoriesMode ? "pl-4 pr-2 min-w-[90px] cursor-move" : "px-4",
                            "py-[2px]"
                          )}
                          onClick={editCategoriesMode
                            ? (e) => e.preventDefault()
                            : () => {
                                setSelectedTags((prev) =>
                                  prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                                );
                              }
                          }
                          type="button"
                          tabIndex={0}
                        >
                          <span className="truncate">{tag}</span>
                          {editCategoriesMode && catObj && (
                            <span
                              className="ml-2 flex items-center cursor-pointer text-destructive hover:text-destructive/80 focus:outline-none"
                              tabIndex={0}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await deleteCategory(catObj.id);
                              }}
                              role="button"
                              aria-label={`Delete ${tag}`}
                            >
                              <X className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card className="overflow-visible">
                <div className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 group hover:bg-accent/50 transition-colors min-h-0 relative",
                            task.completed ? "bg-muted/50" : "",
                            "relative"
                          )}
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className={cn(
                              "mt-0.5 h-4 w-4 min-h-4 min-w-4 transition-colors",
                              task.completed ? "border-muted-foreground data-[state=checked]:bg-muted-foreground" : "",
                            )}
                          />
                          <div
                            className={cn(
                              "flex-1 flex items-center gap-2 transition-opacity",
                              task.completed ? "text-muted-foreground line-through opacity-70" : "",
                            )}
                          >
                            <span className="flex-1 min-w-0 text-xs font-normal break-words whitespace-pre-line">{formatTextWithTags(task.text)}</span>
                            <div className="shrink-0 flex items-center gap-2">
                              <div className="flex flex-col items-end">
                                <Popover>
                                  <PopoverTrigger>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground transition-colors">
                                      {task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                                    </span>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                      mode="single"
                                      selected={task.createdAt}
                                      onSelect={(date) => date && updateTaskDate(task.id, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <span className="text-[10px] font-semibold text-gray-800 whitespace-nowrap">
                                  {task.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Los_Angeles' })}
                                </span>
                              </div>
                              {task.tags.length > 0 && (
                                <div className="flex gap-1 flex-nowrap">
                                  {task.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 whitespace-nowrap">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTaskHandler(task.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          {activeGroup === "master" && task.group !== "today" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateTask(task.id, { group: "today" })}
                            >
                              Move to Today
                            </Button>
                          )}
                          {activeGroup === "today" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateTask(task.id, { group: "master" })}
                            >
                              Move to Master
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Check className="h-6 w-6" />
                      </div>
                      <p>No tasks found</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showVoiceMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {voiceStep === 'listening' ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <h2 className="text-2xl font-semibold mb-6">Listening...</h2>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                      <SoundWave />
                    </div>
                    <div className="text-center space-y-3">
                      <div className="min-h-[60px] px-4 py-3 bg-gray-50 rounded-xl max-w-sm">
                        <p className="text-base text-gray-600">
                          {speechDraft || "Speak now..."}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Release Ctrl to stop recording
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : voiceStep === 'confirm' ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col space-y-6"
                >
                  <h2 className="text-2xl font-semibold">Voice Input</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Raw Transcription</div>
                      <div className="w-full border rounded-lg p-3 bg-gray-50">
                        <textarea
                          className="w-full bg-transparent outline-none resize-none text-sm"
                          rows={2}
                          value={voiceRaw}
                          readOnly
                        />
                      </div>
                    </div>
                    
                    {processedTask && (
                      <div>
                        <div className="text-sm font-medium mb-2">Processed Task</div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 border rounded-lg p-3 bg-gray-50">
                            <input type="checkbox" className="mr-2 mt-1" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{processedTask.taskName}</div>
                              <div className="text-xs text-gray-500 mt-1">{processedTask.description}</div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              {processedTask.date && (
                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                  {new Date(processedTask.date + 'T00:00:00').toLocaleDateString('en-US', { month: "short", day: "numeric", timeZone: 'America/Los_Angeles' })}
                                </div>
                              )}
                              {processedTask.time && (
                                <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                                  {(() => {
                                    const [hours, minutes] = processedTask.time.split(':');
                                    const d = new Date(0);
                                    d.setHours(parseInt(hours, 10));
                                    d.setMinutes(parseInt(minutes, 10));
                                    return d.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: true,
                                      timeZone: 'America/Los_Angeles'
                                    });
                                  })()}
                                </div>
                              )}
                            </div>
                            {processedTask.tags.length > 0 && (
                              <div className="flex gap-1">
                                {processedTask.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowVoiceMenu(false)}>Cancel</Button>
                    <Button
                      onClick={() => {
                        if (processedTask) {
                          const taskText = `${processedTask.taskName} ${processedTask.tags.map(tag => `#${tag}`).join(' ')}`;
                          
                          let taskDate: Date | undefined = undefined;
                          if (processedTask.date) {
                            const timeString = processedTask.time || '00:00';
                            taskDate = new Date(`${processedTask.date}T${timeString}`);
                          }
                          
                          addTask(taskText, taskDate);
                        }
                        setShowVoiceMenu(false);
                      }}
                    >
                      Add Task
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col space-y-6"
                >
                  <h2 className="text-2xl font-semibold">Manual Input</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">What's on your mind?</div>
                      <textarea
                        className="w-full border rounded-lg p-3 bg-gray-50 outline-none resize-none text-sm min-h-[80px]"
                        value={manualTaskText}
                        onChange={(e) => setManualTaskText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleManualGenerate();
                          }
                        }}
                        placeholder="Describe your task here..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowVoiceMenu(false)}>Cancel</Button>
                    <Button onClick={handleManualGenerate}>
                      Generate Task
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function PomodoroTimer({ 
  tasks, 
  toggleTaskCompletion, 
  deleteTask, 
  formatTextWithTags,
  updateTaskDate,
  tabGroups
}: { 
  tasks: Task[]; 
  toggleTaskCompletion: (id: string) => void; 
  deleteTask: (id: string) => void; 
  formatTextWithTags: (text: string) => React.ReactNode;
  updateTaskDate: (id: string, date: Date) => void;
  tabGroups: TabGroup[];
}) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const { launchTabGroup } = useTabGroupService();

  useEffect(() => {
    if (!running) {
      document.title = "subspace";
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => {
        const newSeconds = s > 0 ? s - 1 : 0;
        const minutes = Math.floor(newSeconds / 60);
        const secs = newSeconds % 60;
        document.title = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")} - subspace`;
        return newSeconds;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      document.title = "subspace";
    };
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="w-screen h-screen flex">
      {/* Left: Timer */}
      <div className="flex flex-1 items-center justify-center px-20">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-6 text-center">Focus Time</h2>
          <div className="mb-8">
            <div className="text-[80px] font-semibold leading-none px-12 py-4 border border-gray-200 rounded-2xl bg-white shadow-none font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {minutes.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <Button
              onClick={() => setRunning((r) => !r)}
              className="px-8 py-2 text-base rounded-md font-medium"
            >
              {running ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSeconds(25 * 60);
                setRunning(false);
              }}
              className="px-8 py-2 text-base rounded-md font-medium"
            >
              Reset
            </Button>
          </div>
          
          {/* Tab Groups Section */}
          <div className="mt-8 w-full max-w-md">
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium">Quick Launch</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-52">Configure tab groups in the side menu to quickly launch multiple websites at once</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {tabGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tabGroups.map((group) => (
                  <Button
                    key={group.id}
                    variant="outline"
                    size="sm"
                    onClick={() => launchTabGroup(group)}
                    className="text-xs h-8"
                  >
                    {group.name} ({group.tabs.length})
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-md">
                Create tab groups from the side menu to quickly launch multiple websites together. Perfect for study sessions or projects!
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="w-px bg-gray-200 h-[70%] self-center" />
      {/* Right: Task List */}
      <div className="flex flex-1 items-center justify-center px-20">
        <Card className="w-[440px] rounded-2xl border border-gray-200 shadow-none">
          <div className="py-4">
            <div className="flex flex-col gap-0">
              {tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center px-4 py-2",
                    idx !== tasks.length - 1 && "border-b border-gray-200",
                    task.completed ? "bg-muted/50" : ""
                  )}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4 min-h-4 min-w-4 flex-shrink-0 mr-3"
                  />
                  <div className={cn(
                    "flex-1 flex items-center min-w-0 gap-2",
                    task.completed ? "text-muted-foreground line-through opacity-70" : ""
                  )}>
                    <span className="text-sm font-normal truncate min-w-0">
                      {formatTextWithTags(task.text)}
                    </span>
                    {task.tags.length > 0 && (
                      <span className="text-sm text-gray-400 font-normal ml-2">
                        {task.tags.map((tag: string, i: number) => (
                          <span key={tag} className="mr-1">#{tag}</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <Popover>
                    <PopoverTrigger>
                      <span className="text-xs text-muted-foreground whitespace-nowrap mr-3 cursor-pointer hover:text-foreground transition-colors">
                        {task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={task.createdAt}
                        onSelect={(date) => date && updateTaskDate(task.id, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {task.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold bg-gray-100 text-black rounded-xl">
                      {task.tags[0]}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

