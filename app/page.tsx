"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Mic, X, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { useTheme } from "next-themes"
import { LightPullThemeSwitcher } from "@/components/ui/LightPullThemeSwitcher"

// Types
type Task = {
  id: string
  text: string
  completed: boolean
  tags: string[]
  createdAt: Date
}

export default function TaskManager() {
  // State
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Complete project proposal #work",
      completed: false,
      tags: ["work"],
      createdAt: new Date(),
    },
    {
      id: "2",
      text: "Buy groceries #shopping",
      completed: false,
      tags: ["shopping"],
      createdAt: new Date(),
    },
    {
      id: "3",
      text: "Schedule dentist appointment #health",
      completed: true,
      tags: ["health"],
      createdAt: new Date(Date.now() - 86400000),
    },
  ])

  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(new Date())
  const [focusMode, setFocusMode] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showSearch, setShowSearch] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const { theme, setTheme } = useTheme()

  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null);
  const transcriptionRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState(48); // px, initial min height

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

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

  // Add a new task
  const addTask = (text: string, date?: Date) => {
    if (!text.trim()) return

    const tags = parseTagsFromText(text)
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      tags,
      createdAt: date || new Date(),
    }

    setTasks([newTask, ...tasks])
    setNewTaskText("")
    setNewTaskDate(new Date())
  }

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  // Start voice recording and transcription
  const startRecording = () => {
    // Stop previous instance if it exists
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Remove old event listeners
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(true);
    setTranscription(""); // Clear previous transcription

    // Check for browser support
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
      setTranscription(finalTranscript + (interimTranscript ? " " + interimTranscript : ""));
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      recognition.stop();
    };

    recognition.start();
  };

  // Stop voice recording
  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Save transcription as a task
  const saveTranscription = () => {
    if (transcription.trim()) {
      addTask(transcription, newTaskDate);
      setTranscription("");
      setIsRecording(false);
      // Stop the speech recognition if it's still running
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
  }

  // Cancel transcription
  const cancelTranscription = () => {
    setTranscription("")
    setIsRecording(false)
  }

  // Filter tasks based on filter, search text, and focus mode
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = searchText ? task.text.toLowerCase().includes(searchText.toLowerCase()) : true
    const matchesFocus = focusMode ? !task.completed : true

    let matchesFilter = true
    if (filter === "completed") {
      matchesFilter = task.completed
    } else if (filter === "active") {
      matchesFilter = !task.completed
    }

    return matchesSearch && matchesFocus && matchesFilter
  })

  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)))

  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.style.height = "auto";
      const newHeight = Math.min(transcriptionRef.current.scrollHeight, 240); // max 240px
      transcriptionRef.current.style.height = newHeight + "px";
      setTextareaHeight(newHeight);
    }
  }, [transcription]);

  const handleLightSwitch = () => {
    if (theme === "light") {
      setTheme("dark")
      setShowPomodoro(true)
    } else {
      setTheme("light")
      setShowPomodoro(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-start py-12 px-4 relative">
      {/* Light Pull Switch at the top */}
      <div className="fixed top-4 right-4 z-50">
        <LightPullThemeSwitcher onSwitch={() => setShowPomodoro((v) => !v)} />
      </div>

      {/* Main content area with animation */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {showPomodoro ? (
            <PomodoroTimer key="pomodoro" />
          ) : (
            <motion.div
              key="todo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full"
            >
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-medium text-gray-900">Tasks</h1>
                <div className="flex items-center gap-2">
                  {showSearch ? (
                    <div className="relative">
                      <Input
                        ref={searchInputRef}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search tasks..."
                        className="h-9 w-48 border-gray-200"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSearchText("")
                          setShowSearch(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => setShowSearch(true)}>
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilter("all")}>View all tasks</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("active")}>View active tasks</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("completed")}>View completed tasks</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    ref={inputRef}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addTask(newTaskText, newTaskDate)
                      }
                    }}
                    placeholder="Add a new task... Use #tags"
                    className="flex-1 border-gray-200 focus-visible:ring-gray-400"
                  />
                  <Button onClick={() => addTask(newTaskText, newTaskDate)} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-2">
                  <Calendar
                    mode="single"
                    selected={newTaskDate}
                    onSelect={setNewTaskDate}
                    className="rounded-md border"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
                    <label htmlFor="focus-mode" className="text-sm font-medium text-gray-600">
                      Focus Mode
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Voice
                  </Button>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">
                  {filter === "all" ? "All Tasks" : filter === "active" ? "Active Tasks" : "Completed Tasks"}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-gray-500 -mr-2">
                      Sort
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Newest first</DropdownMenuItem>
                    <DropdownMenuItem>Oldest first</DropdownMenuItem>
                    <DropdownMenuItem>Alphabetical</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
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
                            "flex items-start gap-3 p-4 group hover:bg-gray-50 transition-colors",
                            task.completed ? "bg-gray-50/50" : "",
                          )}
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className={cn(
                              "mt-0.5 transition-colors",
                              task.completed ? "border-gray-400 data-[state=checked]:bg-gray-500" : "",
                            )}
                          />

                          <div
                            className={cn(
                              "flex-1 transition-opacity",
                              task.completed ? "text-gray-400 line-through opacity-70" : "",
                            )}
                          >
                            {formatTextWithTags(task.text)}
                            <div className="text-xs text-gray-400 mt-1">
                              {task.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            onClick={() => deleteTask(task.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <div className="rounded-full bg-gray-100 p-3 mb-3">
                        <Check className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>No tasks found</p>
                    </div>
                  )}
                </div>
              </Card>

              {allTags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 text-gray-600"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Only show tasks at the bottom in Pomodoro mode */}
      {showPomodoro && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-40 px-4 py-2">
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tasks</h3>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-gray-800"
                >
                  {/* Checkbox and text */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="mr-2"
                  />
                  <span className={`truncate flex-1 ${task.completed ? "line-through text-gray-400" : ""}`}>
                    {task.text}
                  </span>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-gray-400 text-center py-2">No tasks yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voice Transcription Overlay */}
      {isRecording && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-full max-w-md mx-4 border-gray-200 shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Voice Input</h3>
                  <div className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                </div>

                <div className="relative">
                  <motion.div
                    layout
                    initial={false}
                    animate={{ height: textareaHeight }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full overflow-hidden rounded-md border border-gray-200 bg-white"
                    style={{ minHeight: 48, maxHeight: 240 }}
                  >
                    <textarea
                      ref={transcriptionRef}
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="Listening..."
                      className="w-full resize-none overflow-hidden bg-transparent p-2 text-base outline-none"
                      rows={1}
                      style={{ height: textareaHeight, minHeight: 48, maxHeight: 240 }}
                    />
                    {transcription && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                        onClick={() => setTranscription("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelTranscription} className="border-gray-200 text-gray-600">
                    Cancel
                  </Button>
                  <Button onClick={saveTranscription} className="bg-gray-900 hover:bg-gray-800 text-white">
                    Add Task
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function PomodoroTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <motion.div
      key="pomodoro"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center justify-center h-full"
    >
      <h2 className="text-3xl font-bold mb-4">Pomodoro Timer</h2>
      <div className="text-6xl font-mono mb-6">
        {minutes.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
      </div>
      <button
        onClick={() => setRunning((r) => !r)}
        className="mb-2 px-4 py-2 rounded bg-blue-500 text-white"
      >
        {running ? "Pause" : "Start"}
      </button>
      <button
        onClick={() => {
          setSeconds(25 * 60);
          setRunning(false);
        }}
        className="px-4 py-2 rounded border"
      >
        Reset
      </button>
    </motion.div>
  );
}
