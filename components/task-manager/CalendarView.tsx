"use client";

import * as React from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  addDays,
  subDays,
  getHours,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/tasks";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type ViewMode = "month" | "week" | "day";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
  onTaskEdit?: (task: Task) => void;
  getTagTextColor: (tag: string) => string;
  updateTask?: (id: string, updates: Partial<Task>) => Promise<void>;
}

// For Monday start (getDay returns: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
// Map to grid columns: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7
const colStartClasses = [
  "col-start-7", // Sunday -> column 7
  "", // Monday -> column 1 (default)
  "col-start-2", // Tuesday
  "col-start-3", // Wednesday
  "col-start-4", // Thursday
  "col-start-5", // Friday
  "col-start-6", // Saturday
];

const timeSlots = Array.from({ length: 24 }, (_, i) => i);

// Get background color based on tag
const getTaskBackground = (task: Task) => {
  if (task.completed) return "bg-gray-100";

  const tag = task.tags[0]?.toLowerCase();
  const colorMap: Record<string, string> = {
    food: "bg-orange-100",
    school: "bg-purple-100",
    work: "bg-blue-100",
    personal: "bg-pink-100",
    health: "bg-green-100",
    meeting: "bg-indigo-100",
    social: "bg-yellow-100",
  };

  return colorMap[tag] || "bg-gray-100";
};

// Get dot color based on tag
const getDotColor = (task: Task) => {
  if (task.completed) return "bg-gray-500";

  const tag = task.tags[0]?.toLowerCase();
  const colorMap: Record<string, string> = {
    food: "bg-orange-500",
    school: "bg-purple-500",
    work: "bg-blue-500",
    personal: "bg-pink-500",
    health: "bg-green-500",
    meeting: "bg-indigo-500",
    social: "bg-yellow-600",
  };

  return colorMap[tag] || "bg-gray-500";
};

// Get text color based on tag
const getTextColor = (task: Task) => {
  if (task.completed) return "text-gray-600";

  const tag = task.tags[0]?.toLowerCase();
  const colorMap: Record<string, string> = {
    food: "text-orange-900",
    school: "text-purple-900",
    work: "text-blue-900",
    personal: "text-pink-900",
    health: "text-green-900",
    meeting: "text-indigo-900",
    social: "text-yellow-900",
  };

  return colorMap[tag] || "text-gray-900";
};

// Memoized components for better performance
const TaskCard = React.memo(
  ({
    task,
    onTaskClick,
    getTagTextColor,
    isEditing,
    editText,
    onStartEdit,
    onSaveEdit,
    onEditTextChange,
  }: {
    task: Task;
    onTaskClick?: (task: Task) => void;
    getTagTextColor: (tag: string) => string;
    isEditing: boolean;
    editText: string;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onEditTextChange: (text: string) => void;
  }) => {
    const taskDate =
      task.createdAt instanceof Date ? task.createdAt : new Date();
    const hasTime = taskDate.getHours() !== 0 || taskDate.getMinutes() !== 0;
    const timeString = hasTime
      ? taskDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className={cn(
          "group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-all hover:shadow-md text-[10px]",
          getTaskBackground(task)
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditing) return;
          onTaskClick?.(task);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isEditing) return;
          onStartEdit();
        }}
      >
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full flex-shrink-0",
            getDotColor(task)
          )}
        />
        <div className="flex-1 min-w-0 flex items-baseline justify-between gap-1">
          {isEditing ? (
            <motion.input
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex-1 bg-white/90 border border-gray-300 rounded px-1.5 py-1 text-[10px] outline-none focus:border-gray-400 focus:shadow-sm"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveEdit();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  onSaveEdit();
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              className={cn(
                "font-semibold leading-tight line-clamp-1 transition-colors duration-150",
                getTextColor(task),
                task.completed && "line-through"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
            >
              {task.text.replace(/#\w+/g, "").trim()}
            </p>
          )}
          {!isEditing && timeString && (
            <span
              className={cn(
                "text-[9px] flex-shrink-0 font-medium",
                getTextColor(task)
              )}
            >
              {timeString}
            </span>
          )}
        </div>
      </motion.div>
    );
  }
);

TaskCard.displayName = "TaskCard";

export const CalendarView = React.memo(function CalendarView({
  tasks,
  onTaskClick,
  onDateClick,
  onTaskEdit,
  getTagTextColor,
  updateTask,
}: CalendarViewProps) {
  const today = React.useMemo(() => startOfToday(), []);
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy")
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("month");
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = React.useState("");

  const firstDayCurrentMonth = React.useMemo(
    () => parse(currentMonth, "MMM-yyyy", new Date()),
    [currentMonth]
  );

  // Edit handlers
  const startEditTask = React.useCallback(
    (task: Task) => {
      if (onTaskEdit) {
        onTaskEdit(task);
      } else {
        // Fallback to inline editing if no onTaskEdit prop
        setEditingTaskId(task.id);
        setEditingTaskText(task.text);
      }
    },
    [onTaskEdit]
  );

  const saveEditTask = React.useCallback(async () => {
    if (!editingTaskId || !editingTaskText.trim() || !updateTask) {
      setEditingTaskId(null);
      setEditingTaskText("");
      return;
    }

    const task = tasks.find((t) => t.id === editingTaskId);
    if (task && editingTaskText !== task.text) {
      try {
        await updateTask(editingTaskId, { text: editingTaskText });
        toast.success("Task updated");
      } catch (error) {
        toast.error("Failed to update task");
      }
    }

    setEditingTaskId(null);
    setEditingTaskText("");
  }, [editingTaskId, editingTaskText, tasks, updateTask]);

  // Memoize task lookups for better performance
  const getTasksForDay = React.useCallback(
    (day: Date): Task[] => {
      return tasks.filter((task) => isSameDay(task.createdAt, day));
    },
    [tasks]
  );

  const getTasksForHour = React.useCallback(
    (day: Date, hour: number): Task[] => {
      return tasks.filter((task) => {
        const taskDate = task.createdAt;
        return isSameDay(taskDate, day) && getHours(taskDate) === hour;
      });
    },
    [tasks]
  );

  // Navigation functions with useCallback for stable references
  const previousPeriod = React.useCallback(() => {
    if (viewMode === "month") {
      const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
      setCurrentMonth(format(firstDayPrevMonth, "MMM-yyyy"));
    } else if (viewMode === "week") {
      const prevWeek = subDays(selectedDay, 7);
      setSelectedDay(prevWeek);
      setCurrentMonth(format(prevWeek, "MMM-yyyy"));
    } else {
      const prevDay = subDays(selectedDay, 1);
      setSelectedDay(prevDay);
      setCurrentMonth(format(prevDay, "MMM-yyyy"));
    }
  }, [viewMode, firstDayCurrentMonth, selectedDay]);

  const nextPeriod = React.useCallback(() => {
    if (viewMode === "month") {
      const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
      setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    } else if (viewMode === "week") {
      const nextWeek = addDays(selectedDay, 7);
      setSelectedDay(nextWeek);
      setCurrentMonth(format(nextWeek, "MMM-yyyy"));
    } else {
      const nextDay = addDays(selectedDay, 1);
      setSelectedDay(nextDay);
      setCurrentMonth(format(nextDay, "MMM-yyyy"));
    }
  }, [viewMode, firstDayCurrentMonth, selectedDay]);

  const goToToday = React.useCallback(() => {
    setCurrentMonth(format(today, "MMM-yyyy"));
    setSelectedDay(today);
  }, [today]);

  // Get period title with memoization
  const periodTitle = React.useMemo(() => {
    if (viewMode === "month") {
      return format(firstDayCurrentMonth, "MMMM yyyy");
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDay);
      const weekEnd = endOfWeek(selectedDay);
      return `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d, yyyy"
      )}`;
    } else {
      return format(selectedDay, "EEEE, MMMM d, yyyy");
    }
  }, [viewMode, firstDayCurrentMonth, selectedDay]);

  // Memoize days calculation
  const monthDays = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth), { weekStartsOn: 1 }),
      }),
    [firstDayCurrentMonth]
  );

  const weekDays = React.useMemo(() => {
    const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    });
  }, [selectedDay]);

  // Month View
  const renderMonthView = React.useCallback(() => {
    const days = monthDays;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b text-center text-xs font-semibold leading-6 text-gray-700 bg-gray-50">
          <div className="py-1.5">Mon</div>
          <div className="py-1.5">Tue</div>
          <div className="py-1.5">Wed</div>
          <div className="py-1.5">Thu</div>
          <div className="py-1.5">Fri</div>
          <div className="py-1.5">Sat</div>
          <div className="py-1.5">Sun</div>
        </div>

        {/* Calendar Days */}
        <div
          className="flex-1 grid grid-cols-7 border-l border-t"
          style={{ gridAutoRows: "minmax(120px, 1fr)" }}
        >
          {days.map((day, dayIdx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, firstDayCurrentMonth);
            const isSelected = isEqual(day, selectedDay);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => onDateClick?.(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                  "relative border-r border-b hover:bg-gray-50 transition-colors cursor-pointer p-1.5 flex flex-col group"
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors flex-shrink-0",
                    isTodayDate && !isSelected && "bg-blue-600 text-white",
                    isSelected && "bg-gray-900 text-white",
                    !isTodayDate && !isSelected && "hover:bg-gray-100"
                  )}
                >
                  {format(day, "d")}
                </button>

                {/* Tasks for the day */}
                <div className="mt-1 space-y-1 overflow-y-auto flex-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskClick={onTaskClick}
                      getTagTextColor={getTagTextColor}
                      isEditing={editingTaskId === task.id}
                      editText={editingTaskText}
                      onStartEdit={() => startEditTask(task)}
                      onSaveEdit={saveEditTask}
                      onEditTextChange={setEditingTaskText}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[9px] text-gray-500 pl-2 font-medium mt-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add task hint - shows on hover */}
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[9px] text-gray-400 font-medium bg-white px-1 py-0.5 rounded shadow-sm">
                    Double-click to add
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [
    monthDays,
    selectedDay,
    getTasksForDay,
    onTaskClick,
    onDateClick,
    getTagTextColor,
    firstDayCurrentMonth,
    editingTaskId,
    editingTaskText,
    startEditTask,
    saveEditTask,
    setEditingTaskId,
    setEditingTaskText,
  ]);

  // Week View - Kanban Style
  const renderWeekView = React.useCallback(() => {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header Row */}
        <div className="flex border-b bg-gray-50">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isTodayDate = isToday(day);
            const completedCount = dayTasks.filter((t) => t.completed).length;

            return (
              <div
                key={day.toString()}
                className={cn(
                  "flex-1 min-w-0 px-3 py-3 border-r last:border-r-0",
                  isTodayDate && "bg-blue-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        isTodayDate ? "text-blue-600" : "text-gray-600"
                      )}
                    >
                      {format(day, "EEE")}
                    </h3>
                    <span
                      className={cn(
                        "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold",
                        isTodayDate
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {dayTasks.length}
                  </span>
                </div>
                {dayTasks.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    {completedCount} of {dayTasks.length} completed
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Tasks Grid */}
        <div className="flex-1 flex h-full overflow-hidden min-h-0">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "flex-1 min-w-0 border-r last:border-r-0 overflow-y-auto px-2 py-3 flex flex-col",
                  isTodayDate && "bg-blue-50/20"
                )}
                onDoubleClick={() => onDateClick?.(day)}
              >
                {dayTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gray-400 font-medium">
                      +
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {dayTasks.map((task) => {
                        const taskDate =
                          task.createdAt instanceof Date
                            ? task.createdAt
                            : new Date();
                        const hasTime =
                          taskDate.getHours() !== 0 ||
                          taskDate.getMinutes() !== 0;
                        const timeString = hasTime
                          ? taskDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "";

                        return (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={cn(
                              "group relative rounded-lg border-2 p-3 cursor-pointer transition-all hover:shadow-lg",
                              getTaskBackground(task),
                              task.completed
                                ? "border-gray-200 opacity-75 hover:opacity-100"
                                : "border-transparent hover:border-gray-200"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editingTaskId === task.id) return;
                              onTaskClick?.(task);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              startEditTask(task);
                            }}
                          >
                            {/* Task Content */}
                            <div className="flex items-start gap-2">
                              <div
                                className={cn(
                                  "mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                                  getDotColor(task)
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                {editingTaskId === task.id ? (
                                  <motion.input
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      duration: 0.15,
                                      ease: "easeOut",
                                    }}
                                    className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    value={editingTaskText}
                                    onChange={(e) =>
                                      setEditingTaskText(e.target.value)
                                    }
                                    onBlur={saveEditTask}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveEditTask();
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        saveEditTask();
                                      }
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <>
                                    <p
                                      className={cn(
                                        "font-semibold text-xs leading-snug mb-1.5",
                                        getTextColor(task),
                                        task.completed && "line-through"
                                      )}
                                    >
                                      {task.text.replace(/#\w+/g, "").trim()}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      {task.tags.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                          {task.tags.map((tag, idx) => (
                                            <span
                                              key={idx}
                                              className={cn(
                                                "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                                                getTextColor(task),
                                                "bg-white/50"
                                              )}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {timeString && (
                                        <span
                                          className={cn(
                                            "text-[9px] font-semibold flex-shrink-0 flex items-center gap-0.5",
                                            getTextColor(task)
                                          )}
                                        >
                                          <Clock className="h-2.5 w-2.5" />
                                          {timeString}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Completed badge */}
                            {task.completed && (
                              <div className="absolute top-1.5 right-1.5">
                                <div className="bg-green-500 rounded-full p-0.5">
                                  <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-2.5 w-2.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </motion.svg>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [
    weekDays,
    getTasksForDay,
    onTaskClick,
    onDateClick,
    getTagTextColor,
    editingTaskId,
    editingTaskText,
    startEditTask,
    saveEditTask,
    setEditingTaskText,
  ]);

  // Day View
  const renderDayView = React.useCallback(() => {
    const dayTasks = getTasksForDay(selectedDay);
    const tasksByHour = timeSlots.map((hour) => ({
      hour,
      tasks: getTasksForHour(selectedDay, hour),
    }));

    return (
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Time Grid - Left Side */}
        <div className="flex-1 overflow-auto border rounded-lg bg-white shadow-sm">
          <div className="min-w-[400px]">
            {tasksByHour.map(({ hour, tasks: hourTasks }) => {
              const dateWithHour = new Date(selectedDay);
              dateWithHour.setHours(hour, 0, 0, 0);

              return (
                <div key={hour} className="flex border-b min-h-[80px]">
                  <div className="w-24 border-r p-4 text-sm text-gray-500 font-medium bg-gray-50">
                    {format(new Date().setHours(hour, 0), "h:00 a")}
                  </div>
                  <div
                    className="flex-1 p-3 space-y-2 relative group cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onDoubleClick={() => onDateClick?.(dateWithHour)}
                  >
                    {/* Add task hint */}
                    {hourTasks.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-400 font-medium">
                          Double-click to add task
                        </span>
                      </div>
                    )}
                    {hourTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          // Start edit mode for this task
                          setEditingTaskId(task.id);
                          setEditingTaskText(task.text);
                        }}
                        className={cn(
                          "group rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md",
                          task.completed
                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                              task.completed ? "bg-green-500" : "bg-blue-500"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "font-medium text-sm leading-snug",
                                task.completed && "line-through text-gray-500"
                              )}
                            >
                              {task.text.replace(/#\w+/g, "").trim()}
                            </p>
                            {task.tags.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {task.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={cn(
                                      "text-xs font-semibold",
                                      getTagTextColor(tag)
                                    )}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Summary - Right Side */}
        <div className="w-64 overflow-auto">
          <div className="sticky top-0 bg-white rounded-lg border shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              {format(selectedDay, "EEEE, MMM d")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-semibold text-gray-900">
                  {dayTasks.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">
                  {dayTasks.filter((t) => t.completed).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-blue-600">
                  {dayTasks.filter((t) => !t.completed).length}
                </span>
              </div>
              <div className="border-t pt-3 mt-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">
                  All Tasks
                </h4>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(task);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        // Start edit mode for this task
                        setEditingTaskId(task.id);
                        setEditingTaskText(task.text);
                      }}
                      className={cn(
                        "p-2 rounded-md border cursor-pointer transition-all hover:shadow-sm",
                        task.completed
                          ? "bg-green-50/50 border-green-200"
                          : "bg-gray-50 border-gray-200 hover:bg-white"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium line-clamp-2",
                          task.completed && "line-through text-gray-500"
                        )}
                      >
                        {task.text.replace(/#\w+/g, "").trim()}
                      </p>
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "text-[10px] font-semibold",
                                getTagTextColor(tag)
                              )}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-6">
                      No tasks for this day
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    selectedDay,
    getTasksForDay,
    getTasksForHour,
    onTaskClick,
    getTagTextColor,
    setEditingTaskId,
    setEditingTaskText,
  ]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          {/* Today Button */}
          <button
            onClick={goToToday}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-gray-300 transition-all duration-200"
          >
            Today
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={previousPeriod}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <ChevronLeftIcon size={18} strokeWidth={2} />
            </button>
            <button
              onClick={nextPeriod}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <ChevronRightIcon size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Month Title - Fixed width to prevent shifting */}
          <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">
            {periodTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* View Mode Selector */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200",
                viewMode === "month"
                  ? "bg-white text-gray-900 shadow-sm rounded-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200",
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm rounded-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all duration-200",
                viewMode === "day"
                  ? "bg-white text-gray-900 shadow-sm rounded-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
