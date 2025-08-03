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
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion"
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
import { processVoiceInput, type ProcessedTask, categorizeTask, type CategorizationResult } from "@/lib/ai-service"
import { Loader } from "@/components/ui/loader"

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
          duration: 1.2,
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
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["60%", "100%", "60%"]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8
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

// Sidebar component
function Sidebar({ 
  showBacklog, 
  showPomodoro, 
  setShowBacklog, 
  setShowPomodoro, 
  handleBacklogToggle, 
  handleLightSwitch, 
  handleLogout 
}: { 
  showBacklog: boolean;
  showPomodoro: boolean;
  setShowBacklog: (show: boolean) => void;
  setShowPomodoro: (show: boolean) => void;
  handleBacklogToggle: () => void;
  handleLightSwitch: () => void;
  handleLogout: () => void;
}) {
  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-gray-50 p-4 flex flex-col z-10">
      {/* Logo and Title */}
      <div className="flex items-center gap-2 mb-6 px-4 pt-6">
        <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <span className="text-lg font-semibold text-gray-900">subspace</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1 -translate-y-6">
        <button 
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            !showBacklog && !showPomodoro
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => {
            setShowBacklog(false);
            setShowPomodoro(false);
          }}
        >
          Home
        </button>
        <button 
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            showBacklog 
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={handleBacklogToggle}
        >
          Subspaces
        </button>
        <button 
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            showPomodoro 
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={handleLightSwitch}
        >
          Focus Session
        </button>
        <button 
          className="text-left px-4 py-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-normal"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

// Category Popup Component
function CategoryPopup({ 
  isOpen, 
  onClose, 
  onSelect, 
  categories, 
  position,
  inputValue,
  onInputChange,
  user
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  categories: Category[];
  position: { top: number; left: number };
  inputValue: string;
  onInputChange: (value: string) => void;
  user: any;
}) {
  const [customInput, setCustomInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  const handleSelect = (categoryName: string) => {
    onSelect(categoryName);
    onClose();
  };
  
  const handleCustomSubmit = async () => {
    if (customInput.trim() && user) {
      try {
        // Create the category in Firebase
        await addCategory(customInput.trim(), user.uid);
        // Select the newly created category
        onSelect(customInput.trim());
        onClose();
        setCustomInput("");
        toast.success(`Created category: ${customInput.trim()}`);
      } catch (error) {
        console.error("Failed to create category:", error);
        toast.error("Failed to create category");
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCategories.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCategories[selectedIndex]) {
            handleSelect(filteredCategories[selectedIndex].name);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCategories, selectedIndex]);

  // Reset selected index when filtered categories change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCategories.length]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-50 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden min-w-[220px] max-w-[300px]"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="p-2">
        {/* Header */}
        <div className="px-2 py-1 mb-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Choose Category
          </div>
        </div>
        
        {/* Predefined Categories */}
        <div className="space-y-1 mb-2">
          {filteredCategories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => handleSelect(category.name)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium flex items-center gap-3 group",
                index === selectedIndex
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 border border-transparent"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === selectedIndex ? "bg-blue-500" : "bg-gray-400"
              )}></span>
              <span className="flex-1">{category.name}</span>
              {index === selectedIndex && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 font-medium"
                >
                  ↵
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500 text-center">
            No categories found
          </div>
        )}
        
        {/* Custom Input */}
        <div className="border-t border-gray-100 pt-2">
          <div className="px-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Create New
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                  e.stopPropagation(); // Prevent parent keyboard handling
                }}
                placeholder="Custom category..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-all placeholder:text-gray-400"
                autoFocus
              />
              <Button
                onClick={handleCustomSubmit}
                size="sm"
                className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={!customInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TaskManager() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { createTask, updateTask, deleteTask, subscribeToTasks } = useTaskService();
  const { subscribeToTabGroups } = useTabGroupService();
  const { theme, setTheme } = useTheme()
  
  // All useState hooks first
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined)
  const [newTaskTime, setNewTaskTime] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingComplete, setIsRecordingComplete] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showSearch, setShowSearch] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
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
  const [showBacklog, setShowBacklog] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [backlogFilter, setBacklogFilter] = useState<"all" | "active" | "completed">("all");
  const [backlogSortBy, setBacklogSortBy] = useState<"date" | "alphabetical" | "category">("date");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<Record<string, NodeJS.Timeout>>({});
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [categoryPopupPosition, setCategoryPopupPosition] = useState({ top: 0, left: 0 });
  const [categoryInputValue, setCategoryInputValue] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(40)
  const [speechDraft, setSpeechDraft] = useState("")
  const [isAILoading, setIsAILoading] = useState(false)

  // All useRef hooks
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const finalTranscriptRef = useRef("");
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Parse tags from text (words starting with #)
  const parseTagsFromText = (text: string): string[] => {
    const tagRegex = /#(\w+)/g
    const matches = text.match(tagRegex) || []
    return matches.map((tag) => tag.substring(1))
  }

  // Format text with colored tags
  const formatTextWithTags = (text: string) => {
    // Remove all #tags from the text
    return text.replace(/#\w+/g, '').replace(/\s{2,}/g, ' ').trim();
  };

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

  // Handle category popup logic
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    if (isRecording) {
      setSpeechDraft(value);
    } else {
      setNewTaskText(value);
    }
    
    // Check if user typed # and show category popup
    const lastChar = value[cursorPosition - 1];
    if (lastChar === '#' && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      setCategoryPopupPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setCategoryInputValue("");
      setShowCategoryPopup(true);
    } else {
      setShowCategoryPopup(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    if (!textareaRef.current) return;
    
    const currentValue = isRecording ? speechDraft : newTaskText;
    const cursorPosition = textareaRef.current.selectionStart;
    
    // Find the last # position
    const lastHashIndex = currentValue.lastIndexOf('#', cursorPosition - 1);
    if (lastHashIndex !== -1) {
      const beforeHash = currentValue.substring(0, lastHashIndex);
      const afterCursor = currentValue.substring(cursorPosition);
      const newValue = beforeHash + '#' + categoryName + ' ' + afterCursor;
      
      if (isRecording) {
        setSpeechDraft(newValue);
      } else {
        setNewTaskText(newValue);
      }
      
      // Set cursor position after the inserted category
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = lastHashIndex + categoryName.length + 2;
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Add a new task
  const addTask = async (text?: string, date?: Date) => {
    if (!user) return
    
    const value = isRecording ? speechDraft : (typeof text === "string" ? text : newTaskText);
    if (!value.trim()) return;
    
    try {
      const tags = parseTagsFromText(value);
      
      // Create the final date with time if both are selected
      let finalDate = (date ?? newTaskDate) || new Date();
      if (newTaskDate && newTaskTime) {
        const [hours, minutes] = newTaskTime.split(':').map(Number);
        finalDate = new Date(newTaskDate);
        finalDate.setHours(hours, minutes, 0, 0);
      }
      
      await createTask({
        text: value,
        completed: false,
        tags,
        createdAt: finalDate,
        group: "master"
      });
      setNewTaskText("");
      setSpeechDraft("");
      setNewTaskDate(undefined);
      setNewTaskTime(null);
      toast.success("Task added successfully!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  // Handle AI categorization
  const handleAICategorization = async (taskText: string) => {
    if (!user || !taskText.trim()) return;
    
    setIsAILoading(true);
    
    try {
      // Process the input text to extract task details including date
      const result = await processVoiceInput(taskText);
      
      // Create task with extracted information
      if (result) {
        // Format the task with any tags
        const taskText = `${result.taskName} ${(result.tags || []).map(tag => `#${tag}`).join(' ')}`;
        
        // Extract date from the result
        let taskDate: Date | undefined = undefined;
        if (result.date) {
          const timeString = result.time || '00:00';
          taskDate = new Date(`${result.date}T${timeString}`);
        }
        
        // Add the task
        await createTask({
          text: taskText,
          completed: false,
          tags: result.tags || [],
          createdAt: taskDate || new Date(),
          group: "master"
        });
        
        // Clear the input text
        setNewTaskText("");
        
        toast.success('Task created');
      }
    } catch (error) {
      console.error('Error processing task:', error);
      toast.error("Failed to process task");
    } finally {
      setIsAILoading(false);
    }
  };

  // Toggle task completion with delay
  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isPending = !!pendingCompletions[taskId];

    if (isPending) {
      // If the task is in the pending state, cancel the completion
      clearTimeout(pendingCompletions[taskId]);
      setPendingCompletions((prev) => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
    } else if (task.completed) {
      // If the task is already completed, uncheck it
      try {
        await updateTask(taskId, { completed: false });
      } catch (error) {
        toast.error("Failed to uncheck task.");
      }
    } else {
      // If the task is not completed, check it and start the timer
      setCompletedTaskIds((prev) => [...prev, taskId]);

      const timeoutId = setTimeout(async () => {
        try {
          await updateTask(taskId, { completed: true });

          setTimeout(() => {
            setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
            setPendingCompletions((prev) => {
              const updated = { ...prev };
              delete updated[taskId];
              return updated;
            });
          }, 100);
        } catch (error) {
          toast.error("Failed to complete task.");
          // Revert pending state on error
          setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
          setPendingCompletions((prev) => {
            const updated = { ...prev };
            delete updated[taskId];
            return updated;
          });
        }
      }, 4000);

      setPendingCompletions((prev) => ({
        ...prev,
        [taskId]: timeoutId,
      }));
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev: string[]) => 
      prev.includes(taskId) 
        ? prev.filter((id: string) => id !== taskId)
        : [...prev, taskId]
    );
  };

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

      if (!finalTranscriptRef.current.trim()) {
        // No speech detected, show manual input mode
        setShowVoiceMenu(true);
        setVoiceStep('manual');
        setManualTaskText("");
        return;
      }

      try {
        const result = await processVoiceInput(finalTranscriptRef.current);
        if (result) {
          // Show the confirmation screen instead of directly creating the task
          setProcessedTask(result);
          setShowVoiceMenu(true);
          setVoiceStep('confirm');
        }
      } catch (error) {
        console.error("Failed to process voice input:", error);
        toast.error("Failed to process voice input");
        // Show manual input mode as fallback
        setShowVoiceMenu(true);
        setVoiceStep('manual');
        setManualTaskText("");
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
      (!showBacklog ? !(effectivelyCompleted && !isInWaitingPeriod) : true)
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

  const handleLightSwitch = () => {
    setShowPomodoro((prev) => !prev);
  };

  const handleBacklogToggle = () => {
    setShowBacklog((prev) => !prev);
    setShowPomodoro(false);
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

  // All useEffect hooks
  // Redirect to coming soon page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/coming-soon')
    } else if (!loading && user) {
      // If user is authenticated, stay on the main page
      console.log("User authenticated:", user.uid)
    }
  }, [user, loading, router])

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
      setShowPomodoro(false);
      setShowBacklog(false);
      setSelectedTaskIds([]);
      setBacklogFilter("all");
      setBacklogSortBy("date");
      setTheme("light");
      setSelectedTags([]);
      setCompletedTaskIds([]);
      setPendingCompletions({});
      console.log("Reset all state for user:", user?.uid);
    }
  }, [user?.uid, loading]);

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

  // Force light theme on component mount
  useEffect(() => {
    setTheme("light")
  }, [setTheme])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingCompletions).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, [pendingCompletions]);

  // Close category popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryPopup && textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowCategoryPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryPopup]);

  // Early returns after all hooks
  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen flex items-start justify-center bg-gray-50 overflow-visible" onClick={handleContainerClick}>
      {/* Custom Sidebar - ONLY Focus Session, Backlog and Log out */}
      <Sidebar 
        showBacklog={showBacklog}
        showPomodoro={showPomodoro}
        setShowBacklog={setShowBacklog}
        setShowPomodoro={setShowPomodoro}
        handleBacklogToggle={handleBacklogToggle}
        handleLightSwitch={handleLightSwitch}
        handleLogout={handleLogout}
      />

      {/* Sliding Menu */}
      <SlidingMenu>
        <TabGroupManager />
      </SlidingMenu>

      {/* Main content area with animation */}
      <div className="w-full max-w-2xl flex flex-col justify-center items-center h-full">
        <AnimatePresence mode="wait">
          {showPomodoro ? (
            <motion.div
              key="pomodoro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex justify-center items-center h-full"
            >
              <PomodoroTimer 
                tasks={tasks}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTaskHandler}
                formatTextWithTags={formatTextWithTags}
                updateTaskDate={updateTaskDate}
                tabGroups={tabGroups}
                allTags={allTags}
                completedTaskIds={completedTaskIds}
                getTagTextColor={getTagTextColor}
              />
            </motion.div>
          ) : showBacklog ? (
            <motion.div
              key="backlog"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full max-w-4xl space-y-6 pt-24 pb-8"
            >
              <BacklogView 
                tasks={tasks}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTaskHandler}
                formatTextWithTags={formatTextWithTags}
                updateTaskDate={updateTaskDate}
                updateTask={updateTask}
                createTask={async (task) => { await createTask(task); }}
                allTags={allTags}
                categories={categories}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                toggleTaskSelection={toggleTaskSelection}
                backlogFilter={backlogFilter}
                setBacklogFilter={setBacklogFilter}
                backlogSortBy={backlogSortBy}
                setBacklogSortBy={setBacklogSortBy}
                user={user}
                completedTaskIds={completedTaskIds}
                getTagTextColor={getTagTextColor}
                parseTagsFromText={parseTagsFromText}
              />
            </motion.div>
          ) : (
            <motion.div
              key="todo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full h-full flex flex-col"
            >
              {/* Fixed header + quick-add */}
              <div className="flex-shrink-0 bg-gray-50 pt-32 pb-8 px-4">
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
                <div className="space-y-6">
                  <div className="relative">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={isRecording ? speechDraft : newTaskText}
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addTask();
                          }
                          if (e.key === "Enter" && e.shiftKey) {
                            e.preventDefault();
                            const currentText = isRecording ? speechDraft : newTaskText;
                            if (currentText.trim()) {
                              handleAICategorization(currentText);
                            }
                          }
                          if (e.key === "Escape") {
                            setShowCategoryPopup(false);
                          }
                        }}
                        placeholder="Add new task (type # for categories)"
                        rows={1}
                        className="w-full resize-none overflow-hidden bg-white outline-none border border-gray-200 rounded-xl px-4 py-3 pr-20 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center h-12 pt-[14px]"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {/* Date and Time Display */}
                        {(newTaskDate || newTaskTime) && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            {newTaskDate && (
                              <span className="text-xs text-gray-600">
                                {newTaskDate.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  timeZone: 'America/Los_Angeles'
                                })}
                              </span>
                            )}
                            {newTaskTime && (
                              <span className="text-xs text-gray-600">
                                {newTaskTime}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-gray-200"
                              onClick={() => {
                                setNewTaskDate(undefined);
                                setNewTaskTime(null);
                              }}
                            >
                              <X className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Date Picker */}
                        <DatePicker
                          date={newTaskDate}
                          setDate={setNewTaskDate as (date: Date | undefined) => void}
                          time={newTaskTime}
                          setTime={setNewTaskTime}
                        />
                        
                        <Button
                          onClick={() => addTask()}
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          disabled={isAILoading}
                        >
                          {isAILoading ? (
                            <Loader className="text-gray-600" />
                          ) : (
                            <Plus className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* AI Categorization Hint */}
                    <AnimatePresence>
                      {(isRecording ? speechDraft : newTaskText).trim() && categories.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -bottom-6 left-0 text-xs text-gray-400 flex items-center gap-1"
                        >
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">Shift+Enter</span>
                          <span>for AI categorization</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Category Popup */}
                    <AnimatePresence>
                      {showCategoryPopup && (
                        <CategoryPopup
                          isOpen={showCategoryPopup}
                          onClose={() => setShowCategoryPopup(false)}
                          onSelect={handleCategorySelect}
                          categories={categories}
                          position={categoryPopupPosition}
                          inputValue={categoryInputValue}
                          onInputChange={setCategoryInputValue}
                          user={user}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence mode="wait">
                    {isRecording && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop with blur */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/20 backdrop-blur-md"
                        />
                        
                        {/* Main modal container */}
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.9, opacity: 0, y: 20 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30,
                            duration: 0.4
                          }}
                          className="relative z-10 w-full max-w-xl mx-4"
                        >
                          {/* Glass container */}
                          <div 
                            className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl"
                          >
                            {/* Content */}
                            <div className="relative p-8">
                              <div className="flex flex-col">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Listening...</h2>
                                <div className="flex flex-col items-center space-y-6">
                                  {/* Simplified microphone icon */}
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center border border-red-200/50 shadow-lg">
                                      <SoundWave />
                                    </div>
                                  </div>
                                  
                                  <div className="text-center space-y-4">
                                    {/* Speech display container */}
                                    <div className="relative">
                                      <div className="min-h-[60px] px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm max-w-sm">
                                        <p className="text-base text-gray-700 leading-relaxed">
                                          {speechDraft || "Speak now..."}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 font-medium">
                                      Release Ctrl to stop recording
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent rounded-b-3xl" />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Scrollable Task List */}
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                <Card className="overflow-visible">
                  <div className="divide-y divide-border relative">
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
                          // Always show time if it's set (not midnight or if explicitly set)
                          const hours = d.getHours();
                          const minutes = d.getMinutes();
                          // Show time if it's not midnight OR if the task was created with a specific time
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
                              idx !== tasks.length - 1 && "border-b border-gray-200",
                              effectivelyCompleted ? "bg-muted/30" : ""
                            )}
                          >
                            {/* Checkbox */}
                            <StyledCheckbox
                              checked={effectivelyCompleted}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                              className="flex-shrink-0 mr-3"
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
                            {/* Delete button (show on hover) */}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none"
                              aria-label="Delete task"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glassy Voice Button - Bottom Right */}
      {!isRecording && !showPomodoro && !showBacklog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={startRecording}
            className="group relative flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <Mic className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
              Hold Ctrl
            </span>
          </button>
        </motion.div>
      )}

      {/* Voice Menu Modal */}
      {showVoiceMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md"
          />
          
          {/* Main modal container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4
            }}
            className="relative z-10 w-full max-w-xl mx-4"
          >
            {/* Glass container */}
            <div 
              className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl"
            >
              {/* Content */}
              <div className="relative p-8">
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
                      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Listening...</h2>
                      <div className="flex flex-col items-center space-y-6">
                        {/* Simplified microphone icon */}
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center border border-red-200/50 shadow-lg">
                            <SoundWave />
                          </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                          {/* Speech display container */}
                          <div className="relative">
                            <div className="min-h-[60px] px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm max-w-sm">
                              <p className="text-base text-gray-700 leading-relaxed">
                                {speechDraft || "Speak now..."}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 font-medium">
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
                      <h2 className="text-2xl font-semibold text-gray-900">Voice Input</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2 text-gray-700">Raw Transcription</div>
                          <div className="relative">
                            <div className="w-full border border-gray-200/50 rounded-xl p-3 bg-white/90 backdrop-blur-sm shadow-sm">
                              <textarea
                                className="w-full bg-transparent outline-none resize-none text-sm text-gray-700"
                                rows={2}
                                value={voiceRaw}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        
                        {processedTask && (
                          <div>
                            <div className="text-sm font-medium mb-2 text-gray-700">Processed Task</div>
                            <div className="space-y-3">
                              <div className="relative">
                                <div className="flex items-start gap-2 border border-gray-200/50 rounded-xl p-3 bg-white/90 backdrop-blur-sm shadow-sm">
                                  <input type="checkbox" className="mr-2 mt-1" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{processedTask.taskName}</div>
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
                                        <span key={tag} className="text-xs font-medium flex items-center gap-0.5">
                                          <span className="text-gray-500">{tag}</span> <span className={getTagTextColor(tag)}>#</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowVoiceMenu(false)}
                          className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/90"
                        >
                          Cancel
                        </Button>
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
                          className="bg-gray-900 hover:bg-gray-800 text-white"
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
                      <h2 className="text-2xl font-semibold text-gray-900">Manual Input</h2>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2 text-gray-700">What's on your mind?</div>
                          <div className="relative">
                            <div className="w-full border border-gray-200/50 rounded-xl p-3 bg-white/90 backdrop-blur-sm shadow-sm">
                              <textarea
                                className="w-full bg-transparent outline-none resize-none text-sm text-gray-700 min-h-[80px]"
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
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowVoiceMenu(false)}
                          className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/90"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleManualGenerate}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          Generate Task
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent rounded-b-3xl" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Backlog View Component
function BacklogView({ 
  tasks, 
  toggleTaskCompletion, 
  deleteTask, 
  formatTextWithTags,
  updateTaskDate,
  updateTask,
  createTask,
  allTags,
  categories,
  selectedTaskIds,
  setSelectedTaskIds,
  toggleTaskSelection,
  backlogFilter,
  setBacklogFilter,
  backlogSortBy,
  setBacklogSortBy,
  user,
  completedTaskIds,
  getTagTextColor,
  parseTagsFromText
}: { 
  tasks: Task[]; 
  toggleTaskCompletion: (id: string) => void; 
  deleteTask: (id: string) => void; 
  formatTextWithTags: (text: string) => React.ReactNode;
  updateTaskDate: (id: string, date: Date) => void;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  allTags: string[];
  categories: Category[];
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  toggleTaskSelection: (taskId: string) => void;
  backlogFilter: "all" | "active" | "completed";
  setBacklogFilter: (filter: "all" | "active" | "completed") => void;
  backlogSortBy: "date" | "alphabetical" | "category";
  setBacklogSortBy: (sort: "date" | "alphabetical" | "category") => void;
  user: any;
  completedTaskIds: string[];
  getTagTextColor: (tag: string) => string;
  parseTagsFromText: (text: string) => string[];
}) {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined);
  const [newTaskTime, setNewTaskTime] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Category management state (moved from TaskManager)
  const [editCategoriesMode, setEditCategoriesMode] = useState(false);
  const [draggedCatIdx, setDraggedCatIdx] = useState<number | null>(null);
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Category popup state
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [categoryPopupPosition, setCategoryPopupPosition] = useState({ top: 0, left: 0 });
  const [categoryInputValue, setCategoryInputValue] = useState("");
  const backlogTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Add at the top of BacklogView, after other useState hooks:
  const [cardStates, setCardStates] = useState<Record<string, { showAdd: boolean, input: string, date?: Date }>>({});

  // Helper to get state for a card
  const getCardState = (catName: string) => cardStates[catName] || { showAdd: false, input: "", date: undefined };

  // Handler to update state for a card
  const setCardState = (catName: string, newState: Partial<{ showAdd: boolean, input: string, date?: Date }>) => {
    setCardStates(prev => ({
      ...prev,
      [catName]: { ...getCardState(catName), ...newState }
    }));
  };

  // Helper to reorder categories (moved from TaskManager)
  const moveCategory = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= categories.length || to >= categories.length) return;
    const updated = [...categories];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    // This only updates locally; to persist, update backend as needed
    // setCategories(updated); // Not available here, but backend update can be added if needed
  };

  // Add a new task to backlog
  const addTask = async () => {
    if (!user || !newTaskText.trim()) return
    
    try {
      const tags = parseTagsFromText(newTaskText);
      
      // Create the final date with time if both are selected
      let finalDate = newTaskDate || new Date();
      if (newTaskDate && newTaskTime) {
        const [hours, minutes] = newTaskTime.split(':').map(Number);
        finalDate = new Date(newTaskDate);
        finalDate.setHours(hours, minutes, 0, 0);
      }
      
      await createTask({
        text: newTaskText,
        completed: false,
        tags,
        createdAt: finalDate,
        group: "master"
      });
      setNewTaskText("");
      setNewTaskDate(undefined);
      setNewTaskTime(null);
      toast.success("Task added to backlog!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  // Handle AI categorization for backlog
  const handleAICategorization = async (taskText: string) => {
    if (!user || !taskText.trim() || categories.length === 0) return;
    
    try {
      const categoryNames = categories.map(cat => cat.name);
      const result = await categorizeTask(taskText, categoryNames);
      
      if (result.suggestedCategory) {
        // Add the suggested category as a tag
        const categorizedText = taskText + ` #${result.suggestedCategory}`;
        setCardState(selectedCategory || "", { input: categorizedText });
        toast.success(`Categorized as: ${result.suggestedCategory}`);
      }
    } catch (error) {
      console.error('Error categorizing task:', error);
      toast.error("Failed to categorize task");
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Filter by completion status
      if (backlogFilter === "completed" && !task.completed) return false;
      if (backlogFilter === "active" && task.completed) return false;
      
      // Filter by search text
      if (searchText && !task.text.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      // Filter by category
      if (selectedCategory && !task.tags.includes(selectedCategory)) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (backlogSortBy) {
        case "alphabetical":
          return a.text.localeCompare(b.text);
        case "category":
          const aCategory = a.tags[0] || "zzz";
          const bCategory = b.tags[0] || "zzz";
          return aCategory.localeCompare(bCategory);
        case "date":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  // Select all visible tasks
  const selectAllTasks = () => {
    const allVisibleIds = filteredAndSortedTasks.map(task => task.id);
    setSelectedTaskIds(allVisibleIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedTaskIds([]);
  };

  // Bulk operations
  const bulkComplete = async () => {
    try {
      await Promise.all(
        selectedTaskIds.map(id => updateTask(id, { completed: true }))
      );
      toast.success(`Completed ${selectedTaskIds.length} tasks`);
      clearSelection();
    } catch (error) {
      toast.error("Failed to complete tasks");
    }
  };

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedTaskIds.map(id => deleteTask(id)));
      toast.success(`Deleted ${selectedTaskIds.length} tasks`);
      clearSelection();
    } catch (error) {
      toast.error("Failed to delete tasks");
    }
  };

  const bulkAddTag = async (tag: string) => {
    try {
      await Promise.all(
        selectedTaskIds.map(id => {
          const task = tasks.find(t => t.id === id);
          if (task && !task.tags.includes(tag)) {
            return updateTask(id, { tags: [...task.tags, tag] });
          }
          return Promise.resolve();
        })
      );
      toast.success(`Added tag "${tag}" to ${selectedTaskIds.length} tasks`);
      clearSelection();
    } catch (error) {
      toast.error("Failed to add tags");
    }
  };

  // Group tasks by category for better organization
  const groupedTasks = filteredAndSortedTasks.reduce((groups, task) => {
    const category = task.tags[0] || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  // Handle category popup logic for backlog textarea
  const handleBacklogTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNewTaskText(value);
    
    // Check if user typed # and show category popup
    const lastChar = value[cursorPosition - 1];
    if (lastChar === '#' && backlogTextareaRef.current) {
      const rect = backlogTextareaRef.current.getBoundingClientRect();
      setCategoryPopupPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setCategoryInputValue("");
      setShowCategoryPopup(true);
    } else {
      setShowCategoryPopup(false);
    }
  };

  const handleBacklogCategorySelect = (categoryName: string) => {
    if (!backlogTextareaRef.current) return;
    
    const currentValue = newTaskText;
    const cursorPosition = backlogTextareaRef.current.selectionStart;
    
    // Find the last # position
    const lastHashIndex = currentValue.lastIndexOf('#', cursorPosition - 1);
    if (lastHashIndex !== -1) {
      const beforeHash = currentValue.substring(0, lastHashIndex);
      const afterCursor = currentValue.substring(cursorPosition);
      const newValue = beforeHash + '#' + categoryName + ' ' + afterCursor;
      
      setNewTaskText(newValue);
      
      // Set cursor position after the inserted category
      setTimeout(() => {
        if (backlogTextareaRef.current) {
          const newCursorPosition = lastHashIndex + categoryName.length + 2;
          backlogTextareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          backlogTextareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Close category popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryPopup && backlogTextareaRef.current && !backlogTextareaRef.current.contains(event.target as Node)) {
        setShowCategoryPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryPopup]);

  // Add at the top of BacklogView, after other useState hooks:
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState<string>("");

  // Handler to open modal
  const openCategoryModal = (catName: string) => setSelectedCategory(catName);
  // Handler to close modal
  const closeCategoryModal = () => {
    setSelectedCategory(null);
    setEditTaskId(null);
    setEditTaskText("");
  };

  // Handler for editing a task
  const startEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setEditTaskText(task.text);
  };
  const saveEditTask = async (task: Task) => {
    if (editTaskText.trim() && editTaskText !== task.text) {
      await updateTask(task.id, { text: editTaskText });
    }
    setEditTaskId(null);
    setEditTaskText("");
  };

  // In BacklogView, add state for card order:
  const initialOrder = [...categories.map(c => c.name), "Uncategorized"];
  const [categoryOrder, setCategoryOrder] = useState<string[]>(initialOrder);
  
  // Keep order in sync with categories
  useEffect(() => {
    setCategoryOrder([...categories.map(c => c.name), "Uncategorized"]);
  }, [categories]);

  // Create a single drag control for all cards
  const dragControls = useDragControls();

  // Helper function to distribute items into columns
  const distributeIntoColumns = (items: string[], numColumns: number = 3) => {
    const columns: string[][] = Array(numColumns).fill(null).map(() => []);
    items.forEach((item, index) => {
      columns[index % numColumns].push(item);
    });
    return columns;
  };

  const columns = distributeIntoColumns(categoryOrder, 3);

  // Handle reordering
  const handleReorder = (newOrder: string[]) => {
    setCategoryOrder(newOrder);
    // TODO: Persist order to backend if needed
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Subspaces</h1>
        <p className="text-gray-500 text-sm">Your complete task brain dump and management center</p>
      </div>

      {/* Create a new list (category) */}
      <Card className="p-4 mb-4">
        <form
          className="flex gap-2 items-center"
          onSubmit={async (e) => {
            e.preventDefault();
            if (newTaskText.trim() && !allTags.includes(newTaskText.trim()) && user) {
              await addCategory(newTaskText.trim(), user.uid);
              setNewTaskText("");
            }
          }}
        >
          <Input
            placeholder="Create a new list..."
            className="flex-1 text-sm rounded-lg"
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setNewTaskText('');
            }}
          />
          <Button type="submit" size="sm" className="text-xs">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </form>
      </Card>

      {/* Category Cards Grid - Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {columns.map((column, columnIndex) => (
          <Reorder.Group
            key={columnIndex}
            axis="y"
            values={column}
            onReorder={(newColumnOrder) => {
              const newOrder = [...categoryOrder];
              // Update the positions based on the new column order
              column.forEach((item, oldIndex) => {
                const newIndex = newColumnOrder.indexOf(item);
                if (newIndex !== oldIndex) {
                  const globalOldIndex = categoryOrder.indexOf(item);
                  const globalNewIndex = columnIndex * Math.ceil(categoryOrder.length / 3) + newIndex;
                  if (globalOldIndex !== -1) {
                    newOrder.splice(globalOldIndex, 1);
                    newOrder.splice(globalNewIndex, 0, item);
                  }
                }
              });
              handleReorder(newOrder);
            }}
            className="space-y-6"
          >
            {column.map((catName) => {
              const isUncategorized = catName === "Uncategorized";
              const catTasks = isUncategorized
                ? filteredAndSortedTasks.filter(t => t.tags.length === 0)
                : filteredAndSortedTasks.filter(t => t.tags[0] === catName);
              const cardState = getCardState(catName);
              
              return (
                <Reorder.Item
                  key={catName}
                  value={catName}
                  dragListener={true}
                  dragControls={dragControls}
                  whileDrag={{ 
                    scale: 1.05, 
                    rotate: 2,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)", 
                    zIndex: 1000,
                    cursor: "grabbing"
                  }}
                  dragTransition={{ 
                    bounceStiffness: 300, 
                    bounceDamping: 20 
                  }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-4 relative cursor-pointer select-none hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2
                      className="text-lg font-semibold text-gray-900 truncate flex-1 cursor-pointer"
                      onClick={() => openCategoryModal(catName)}
                    >
                      {catName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {catTasks.length}
                      </span>
                      <button
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                        title="Drag to reorder"
                        onPointerDown={(e) => {
                          dragControls.start(e);
                        }}
                        tabIndex={0}
                        aria-label="Drag card"
                        type="button"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                          <circle cx="5" cy="6" r="1.5" fill="currentColor"/>
                          <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
                          <circle cx="5" cy="14" r="1.5" fill="currentColor"/>
                          <circle cx="10" cy="6" r="1.5" fill="currentColor"/>
                          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                          <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
                          <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
                          <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                          <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="flex flex-col gap-2 mb-3 min-h-[60px] cursor-pointer flex-1" 
                    onClick={() => openCategoryModal(catName)}
                  >
                    {catTasks.length === 0 && (
                      <div className="flex items-center justify-center h-16 text-gray-400">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📝</div>
                          <span className="text-xs">No tasks yet</span>
                        </div>
                      </div>
                    )}
                    <AnimatePresence initial={false}>
                      {catTasks.slice(0, 3).map((task, idx) => (
                        <motion.div
                          key={task.id}
                          layout="position"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={cn(
                            "flex items-start px-3 py-2 min-h-[36px] group hover:bg-gray-50 transition-colors relative rounded-lg border border-gray-100",
                            completedTaskIds.includes(task.id) || task.completed ? "bg-gray-50 opacity-60" : ""
                          )}
                        >
                          <StyledCheckbox
                            checked={completedTaskIds.includes(task.id) || task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <div className="flex flex-1 flex-row min-w-0 ml-3 items-start">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={cn(
                                "text-sm font-normal leading-relaxed transition-colors duration-200",
                                completedTaskIds.includes(task.id) || task.completed ? "text-gray-500 line-through" : "text-gray-900"
                              )}>
                                {formatTextWithTags(task.text)}
                              </span>
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="text-xs font-medium flex items-center gap-0.5">
                                      <span className="text-gray-400">{tag}</span> 
                                      <span className={getTagTextColor(tag)}>#</span>
                                    </span>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {catTasks.length > 3 && (
                      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100">
                        +{catTasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                  
                  {/* Quick add button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCategoryModal(catName);
                    }}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-gray-300"
                  >
                    + Add task
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ))}
      </div>

      {/* Statistics (unchanged) */}
      <Card className="p-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{allTags.length}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
        </div>
      </Card>

      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeCategoryModal}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-card text-card-foreground border border-border shadow-xl rounded-xl w-full max-w-md mx-4 relative"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <div className="rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{selectedCategory}</h2>
                <button onClick={closeCategoryModal} className="text-muted-foreground hover:text-foreground p-1 rounded-full focus:outline-none">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2 mb-4 max-h-80 overflow-y-auto">
                {filteredAndSortedTasks.filter(t => (selectedCategory === "Uncategorized" ? t.tags.length === 0 : t.tags[0] === selectedCategory)).map(task => (
                  <div key={task.id} className="flex items-center group rounded-lg px-3 py-2 transition-colors hover:bg-muted">
                    <StyledCheckbox
                      checked={completedTaskIds.includes(task.id) || task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mr-2"
                    />
                    {editTaskId === task.id ? (
                      <input
                        className="flex-1 bg-transparent border-b border-input text-foreground px-1 py-0.5 outline-none"
                        value={editTaskText}
                        onChange={e => setEditTaskText(e.target.value)}
                        onBlur={() => saveEditTask(task)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEditTask(task);
                          if (e.key === 'Escape') { setEditTaskId(null); setEditTaskText(""); }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm cursor-pointer"
                        onClick={() => startEditTask(task)}
                      >
                        {task.text}
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="ml-2 text-muted-foreground hover:text-destructive p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      aria-label="Delete task"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Add Task Input */}
              <form
                className="flex gap-2 items-center mt-2"
                onSubmit={async e => {
                  e.preventDefault();
                  if (!user || !cardStates[selectedCategory]?.input?.trim()) return;
                  const tags = selectedCategory === "Uncategorized" ? [] : [selectedCategory];
                  await createTask({
                    text: cardStates[selectedCategory]?.input,
                    completed: false,
                    tags,
                    createdAt: cardStates[selectedCategory]?.date || new Date(),
                    group: "master"
                  });
                  setCardState(selectedCategory, { input: "", date: undefined });
                }}
              >
                <div className="flex-1 relative">
                  <Input
                    placeholder="Add a task... (Shift+Enter to extract date and generate task)"
                    className="flex-1 text-xs rounded-lg"
                    value={cardStates[selectedCategory]?.input || ""}
                    onChange={e => setCardState(selectedCategory, { input: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        const currentText = cardStates[selectedCategory]?.input || "";
                        if (currentText.trim()) {
                          handleAICategorization(currentText);
                        }
                      }
                    }}
                  />
                  
                  {/* AI Categorization Hint */}
                  <AnimatePresence>
                    {(cardStates[selectedCategory]?.input || "").trim() && categories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -bottom-5 left-0 text-[10px] text-gray-400 flex items-center gap-1"
                      >
                        <span className="bg-gray-100 px-1 py-0.5 rounded text-[8px] font-medium">Shift+Enter</span>
                        <span>to extract date and generate task</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button type="submit" size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function PomodoroTimer({ 
  tasks, 
  toggleTaskCompletion, 
  deleteTask, 
  formatTextWithTags,
  updateTaskDate,
  tabGroups,
  allTags,
  completedTaskIds,
  getTagTextColor
}: { 
  tasks: Task[]; 
  toggleTaskCompletion: (id: string) => void; 
  deleteTask: (id: string) => void; 
  formatTextWithTags: (text: string) => React.ReactNode;
  updateTaskDate: (id: string, date: Date) => void;
  tabGroups: TabGroup[];
  allTags: string[];
  completedTaskIds: string[];
  getTagTextColor: (tag: string) => string;
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

  // Filter tasks similar to main view - hide completed tasks that are not in waiting period
  const filteredTasks = tasks.filter(task => {
    const isInWaitingPeriod = completedTaskIds.includes(task.id);
    const effectivelyCompleted = isInWaitingPeriod || task.completed;
    // Hide completed tasks that are not in waiting period
    return !(effectivelyCompleted && !isInWaitingPeriod);
  });

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Left: Timer */}
      <div className="flex flex-1 items-center justify-center">
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
      <div className="w-px bg-gray-200 h-5/6 self-center mx-12" />
      {/* Right: Task List */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-[440px] rounded-2xl border border-gray-200 shadow-none flex flex-col justify-center gap-0">
          <div className="py-4 flex flex-col gap-0">
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
                  // Always show time if it's set (not midnight or if explicitly set)
                  const hours = d.getHours();
                  const minutes = d.getMinutes();
                  // Show time if it's not midnight OR if the task was created with a specific time
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
                      idx !== tasks.length - 1 && "border-b border-gray-200",
                      effectivelyCompleted ? "bg-muted/30" : ""
                    )}
                  >
                    {/* Checkbox */}
                    <StyledCheckbox
                      checked={effectivelyCompleted}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="flex-shrink-0 mr-3"
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}

