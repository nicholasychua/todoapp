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
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/tasks";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "month" | "week" | "day";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  getTagTextColor: (tag: string) => string;
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

// Memoized components for better performance
const TaskCard = React.memo(
  ({
    task,
    onTaskClick,
    getTagTextColor,
  }: {
    task: Task;
    onTaskClick?: (task: Task) => void;
    getTagTextColor: (tag: string) => string;
  }) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick?.(task);
      }}
      className={cn(
        "group flex items-start gap-0.5 rounded-sm border px-1 py-0.5 text-[9px] cursor-pointer transition-all hover:shadow-sm",
        task.completed
          ? "bg-green-50/50 border-green-200 hover:bg-green-100/50"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <div
        className={cn(
          "mt-0.5 h-0.5 w-0.5 rounded-full flex-shrink-0",
          task.completed ? "bg-green-500" : "bg-blue-500"
        )}
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium leading-tight line-clamp-1",
            task.completed && "line-through text-gray-500"
          )}
        >
          {task.text.replace(/#\w+/g, "").trim()}
        </p>
        {task.tags.length > 0 && (
          <div className="flex gap-0.5 mt-0.5 flex-wrap">
            {task.tags.slice(0, 1).map((tag, idx) => (
              <span
                key={idx}
                className={cn("text-[8px] font-semibold", getTagTextColor(tag))}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
);

TaskCard.displayName = "TaskCard";

export const CalendarView = React.memo(function CalendarView({
  tasks,
  onTaskClick,
  getTagTextColor,
}: CalendarViewProps) {
  const today = React.useMemo(() => startOfToday(), []);
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy")
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("month");
  const firstDayCurrentMonth = React.useMemo(
    () => parse(currentMonth, "MMM-yyyy", new Date()),
    [currentMonth]
  );

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
        <div className="flex-1 grid grid-cols-7 auto-rows-fr border-l border-t">
          {days.map((day, dayIdx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, firstDayCurrentMonth);
            const isSelected = isEqual(day, selectedDay);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                  "relative border-r border-b hover:bg-gray-50 transition-colors cursor-pointer p-1 flex flex-col"
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
                <div className="mt-0.5 space-y-0.5 overflow-y-auto flex-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskClick={onTaskClick}
                      getTagTextColor={getTagTextColor}
                    />
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-gray-500 pl-1.5 font-medium">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [monthDays, selectedDay, getTasksForDay, onTaskClick, getTagTextColor]);

  // Week View
  const renderWeekView = React.useCallback(() => {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="border-r p-3" /> {/* Time column */}
          {weekDays.map((day) => {
            const isTodayDate = isToday(day);
            return (
              <div
                key={day.toString()}
                className={cn(
                  "border-r p-3 text-center",
                  isTodayDate && "bg-blue-50"
                )}
              >
                <div className="text-xs font-medium text-gray-600">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-1",
                    isTodayDate ? "text-blue-600" : "text-gray-900"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 auto-rows-[60px] border-t">
            {timeSlots.map((hour) => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="border-r border-b p-2 text-xs text-gray-500 text-right pr-3">
                  {format(new Date().setHours(hour, 0), "ha")}
                </div>
                {/* Day columns */}
                {weekDays.map((day) => {
                  const hourTasks = getTasksForHour(day, hour);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={`${day.toString()}-${hour}`}
                      className={cn(
                        "border-r border-b p-1 hover:bg-gray-50 transition-colors relative",
                        isTodayDate && "bg-blue-50/30"
                      )}
                    >
                      {hourTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick?.(task)}
                          className={cn(
                            "mb-1 rounded px-2 py-1 text-xs cursor-pointer transition-all hover:shadow-sm border",
                            task.completed
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : "bg-white border-blue-200 hover:border-blue-300"
                          )}
                        >
                          <p
                            className={cn(
                              "font-medium line-clamp-1",
                              task.completed && "line-through text-gray-500"
                            )}
                          >
                            {task.text.replace(/#\w+/g, "").trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }, [weekDays, getTasksForHour, onTaskClick]);

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
            {tasksByHour.map(({ hour, tasks: hourTasks }) => (
              <div key={hour} className="flex border-b min-h-[80px]">
                <div className="w-24 border-r p-4 text-sm text-gray-500 font-medium bg-gray-50">
                  {format(new Date().setHours(hour, 0), "h:00 a")}
                </div>
                <div className="flex-1 p-3 space-y-2">
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
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
            ))}
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
                      onClick={() => onTaskClick?.(task)}
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
  ]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-700" />
            <h1 className="text-base font-semibold text-gray-900 whitespace-nowrap">
              {periodTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View Mode Selector */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                viewMode === "month"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                viewMode === "week"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                viewMode === "day"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Day
            </button>
          </div>

          {/* Navigation */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm">
            <Button
              onClick={previousPeriod}
              className="rounded-none rounded-l-lg shadow-none border-0 h-6 w-6 p-0"
              variant="outline"
              size="icon"
            >
              <ChevronLeftIcon size={13} strokeWidth={2} />
            </Button>
            <Button
              onClick={goToToday}
              className="rounded-none shadow-none border-0 border-l px-2 h-6 text-xs font-medium"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextPeriod}
              className="rounded-none rounded-r-lg shadow-none border-0 border-l h-6 w-6 p-0"
              variant="outline"
              size="icon"
            >
              <ChevronRightIcon size={13} strokeWidth={2} />
            </Button>
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
