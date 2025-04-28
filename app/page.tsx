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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4 relative">
      {/* Light Pull Switch at the top */}
      <div className="fixed top-4 right-4 z-50">
        <LightPullThemeSwitcher onSwitch={() => setShowPomodoro((v) => !v)} data-pomodoro={showPomodoro} />
      </div>

      {/* Main content area with animation */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {showPomodoro ? (
            <PomodoroTimer 
              key="pomodoro" 
              tasks={tasks}
              toggleTaskCompletion={toggleTaskCompletion}
              deleteTask={deleteTask}
              formatTextWithTags={formatTextWithTags}
            />
          ) : (
            <motion.div
              key="todo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full space-y-6"
            >
              <div className="flex items-center justify-between">
                <h1>hi, i'm tami 👋</h1>
                <div className="flex items-center gap-2">
                  {showSearch ? (
                    <div className="relative">
                      <Input
                        ref={searchInputRef}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-48"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => {
                          setSearchText("")
                          setShowSearch(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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

              <div className="space-y-4">
                <div className="flex items-center gap-2">
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
                    className="flex-1"
                  />
                  <Button onClick={() => addTask(newTaskText, newTaskDate)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
                    <label htmlFor="focus-mode" className="text-sm font-medium">
                      Focus Mode
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Voice
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {filter === "all" ? "All Tasks" : filter === "active" ? "Active Tasks" : "Completed Tasks"}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 -mr-2">
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
                              "flex-1 flex items-center justify-between gap-2 transition-opacity",
                              task.completed ? "text-muted-foreground line-through opacity-70" : "",
                            )}
                          >
                            <span className="text-xs font-normal truncate max-w-[60%]">{formatTextWithTags(task.text)}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {task.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                              {task.tags.length > 0 && (
                                <div className="flex gap-1 flex-nowrap">
                                  {task.tags.map((tag) => (
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
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Check className="h-6 w-6" />
                      </div>
                      <p>No tasks found</p>
                    </div>
                  )}
                </div>
              </Card>

              {allTags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-colors"
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

function PomodoroTimer({ 
  tasks, 
  toggleTaskCompletion, 
  deleteTask, 
  formatTextWithTags 
}: { 
  tasks: Task[]; 
  toggleTaskCompletion: (id: string) => void; 
  deleteTask: (id: string) => void; 
  formatTextWithTags: (text: string) => React.ReactNode; 
}) {
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
                        {task.tags.map((tag, i) => (
                          <span key={tag} className="mr-1">#{tag}</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap mr-3">
                    {task.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
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
