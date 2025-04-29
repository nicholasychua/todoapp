"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Plus, Search, MoreHorizontal, Mic, X, Check, ChevronDown } from "lucide-react"
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
import { LightPullThemeSwitcher } from "@/components/ui/LightPullThemeSwitcher"
import Link from "next/link"

// Types
type Task = {
  id: string
  text: string
  completed: boolean
  tags: string[]
  createdAt: Date
}

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
  const [searchText, setSearchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [showSearch, setShowSearch] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const { theme, setTheme } = useTheme()

  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState(40)

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

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      setTextareaHeight(newHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [newTaskText])

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
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.onerror = null
      recognitionRef.current.onresult = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(true)

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support Speech Recognition.")
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      const newText = finalTranscript + (interimTranscript ? " " + interimTranscript : "")
      setNewTaskText(newText)
    }

    recognition.onerror = (event: any) => {
      setIsRecording(false)
      recognition.stop()
    }

    recognition.start()
  }

  // Stop voice recording
  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Filter tasks based on filter and search text
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = searchText ? task.text.toLowerCase().includes(searchText.toLowerCase()) : true

    let matchesFilter = true
    if (filter === "completed") {
      matchesFilter = task.completed
    } else if (filter === "active") {
      matchesFilter = !task.completed
    }

    return matchesSearch && matchesFilter
  })

  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)))

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
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      {/* Top-left login button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/signin">
          <Button variant="outline" size="sm" className="px-4 py-1 text-sm font-medium">
            Log in
          </Button>
        </Link>
      </div>
      {/* Main content area with animation */}
      <div className="w-full max-w-md flex flex-col justify-center items-center">
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
                  <motion.div
                    animate={{ height: textareaHeight }}
                    transition={{ type: "spring", stiffness: 180, damping: 18, duration: 0.3 }}
                    className="flex-1 min-h-[40px]"
                  >
                    <textarea
                      ref={textareaRef}
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          addTask(newTaskText, newTaskDate)
                        }
                      }}
                      placeholder="Add a new task... Use #tags"
                      rows={1}
                      className="w-full resize-none bg-transparent outline-none border border-input rounded-md px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary"
                      style={{ height: textareaHeight }}
                    />
                  </motion.div>
                  <Button onClick={() => addTask(newTaskText, newTaskDate)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center">
                  <motion.div
                    layout
                    initial={false}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        isRecording ? "bg-red-50 px-6" : "px-4"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isRecording ? (
                          <motion.div
                            key="listening"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex items-center"
                          >
                            <SoundWave />
                            <span className="ml-2 text-red-500">Listening...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="hold"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex items-center"
                          >
                            <Mic className="h-4 w-4 mr-1" />
                            Hold Ctrl
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
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
