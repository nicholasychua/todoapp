"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { useTabGroupService } from "../../hooks/useTabGroupService";
import { motion, AnimatePresence } from "framer-motion";
import type { TabGroup } from "../../lib/tabgroups";
import type { Task } from "../../lib/tasks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Settings, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { Category } from "@/lib/categories";
import { setCategoryHiddenOnHome } from "@/lib/categories";

function FocusSession({
  tasks,
  toggleTaskCompletion,
  deleteTask,
  formatTextWithTags,
  updateTaskDate,
  tabGroups,
  allTags,
  completedTaskIds,
  getTagTextColor,
  updateTask,
  categories,
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
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  categories: Category[];
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
        document.title = `${minutes.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")} - subspace`;
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
  const filteredTasks = tasks.filter((task) => {
    const isInWaitingPeriod = completedTaskIds.includes(task.id);
    const effectivelyCompleted = isInWaitingPeriod || task.completed;
    // Hide completed tasks that are not in waiting period
    return !(effectivelyCompleted && !isInWaitingPeriod);
  });

  return (
    <div className="flex-1 h-screen flex items-center justify-end bg-white overflow-hidden">
      <div className="flex items-center justify-center gap-4 max-w-7xl mr-0 px-8">
        {/* Left: Timer */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Focus Time
            </h2>
            <div className="mb-8">
              <div
                className="text-[80px] font-semibold leading-none px-12 py-4 border border-gray-200 rounded-2xl bg-white shadow-none font-sans"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {minutes.toString().padStart(2, "0")}:
                {secs.toString().padStart(2, "0")}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-52">
                        Configure tab groups in the side menu to quickly launch
                        multiple websites at once
                      </p>
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
                  Create tab groups from the side menu to quickly launch
                  multiple websites together. Perfect for study sessions or
                  projects!
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="w-px bg-gray-200 h-5/6 self-center ml-4 mr-12" />
        {/* Right: Task List */}
        <div className="flex flex-1 items-center justify-center">
            <AnimatePresence initial={false}>
                {filteredTasks.map((task, idx) => {
                  // Date logic
                  const hasDate = task.createdAt instanceof Date;
                  const today = new Date();
                  let isPastOrToday = false;
                  let dateString = "";
                  let timeString = "";
                  if (hasDate) {
                    const d = task.createdAt;
                    dateString = `${d.getMonth() + 1}/${d.getDate()}/${d
                      .getFullYear()
                      .toString()
                      .slice(-2)}`;
                    // Create copies for comparison to avoid mutating the original date
                    const dateOnly = new Date(d);
                    dateOnly.setHours(0, 0, 0, 0);
                    const todayOnly = new Date(today);
                    todayOnly.setHours(0, 0, 0, 0);
                    isPastOrToday = dateOnly.getTime() <= todayOnly.getTime();
                    // Only show time if it's not midnight (midnight indicates no specific time was set)
                    const hours = d.getHours();
                    const minutes = d.getMinutes();
                    if (hours !== 0 || minutes !== 0) {
                      timeString = d.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "America/Los_Angeles",
                      });
                    }
                  }

                  // Determine effective completion status using local state
                  const isInWaitingPeriod = completedTaskIds.includes(task.id);
                  const effectivelyCompleted =
                    isInWaitingPeriod || task.completed;

                  return (
                    <motion.div
                      key={task.id}
                      layout="position"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        transition: {
                          duration: 0.25, // quick fade
                          ease: "easeInOut",
                        },
                      }}
                      transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                        delay: idx * 0.04,
                      }}
                      className={cn(
                        "flex items-start px-4 py-3 min-h-[40px] group hover:bg-accent/50 transition-colors relative border-none shadow-none rounded-none bg-transparent",
                        effectivelyCompleted ? "bg-muted/30" : ""
                      )}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={effectivelyCompleted}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="flex-shrink-0 mr-3"
                      />
                      {/* Main content: flex-1 row, name/date left, tags bottom right */}
                      <div className="flex flex-1 flex-row min-w-0 ml-3 items-end">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={cn(
                              "text-sm font-normal truncate transition-colors duration-200",
                              effectivelyCompleted
                                ? "text-muted-foreground opacity-70"
                                : "text-gray-900"
                            )}
                          >
                            {formatTextWithTags(task.text)}
                          </span>
                          {hasDate && (
                            <span
                              className={cn(
                                "text-xs font-medium transition-colors duration-200 mt-0.5",
                                isPastOrToday ? "text-red-600" : "text-gray-400"
                              )}
                            >
                              {dateString}
                              {timeString ? `, ${timeString}` : ""}
                            </span>
                          )}
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end items-end ml-3">
                            {task.tags.map((tag) => (
                              <Popover key={tag}>
                                <PopoverTrigger asChild>
                                  <span className="text-xs font-medium flex items-center gap-0.5 cursor-pointer">
                                    <span className="text-gray-500">{tag}</span>
                                    <span
                                      className={cn(
                                        "transition-colors",
                                        getTagTextColor(tag)
                                      )}
                                    >
                                      #
                                    </span>
                                  </span>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="end"
                                >
                                  <div className="p-2">
                                    <div className="px-2 py-1 mb-2">
                                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Change Category
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      {categories.map((category) => {
                                        const hidden =
                                          category.hiddenOnHome ?? false;
                                        return (
                                          <div
                                            key={category.id}
                                            className="w-full px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium flex items-center gap-3 group hover:bg-gray-50 border border-transparent"
                                          >
                                            <button
                                              onClick={async () => {
                                                try {
                                                  // Remove the old tag and add the new one
                                                  const updatedTags =
                                                    task.tags.filter(
                                                      (t) => t !== tag
                                                    );
                                                  updatedTags.push(
                                                    category.name
                                                  );
                                                  await updateTask(task.id, {
                                                    tags: updatedTags,
                                                  });
                                                  toast.success(
                                                    `Changed category to ${category.name}`
                                                  );
                                                } catch (error) {
                                                  toast.error(
                                                    "Failed to update category"
                                                  );
                                                }
                                              }}
                                              className="flex items-center gap-3 flex-1 text-left"
                                            >
                                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                              <span className="flex-1">
                                                {category.name}
                                              </span>
                                            </button>

                                            {/* Eye Icon Toggle */}
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button
                                                    onClick={async (e) => {
                                                      e.stopPropagation();
                                                      try {
                                                        await setCategoryHiddenOnHome(
                                                          category.id,
                                                          !hidden
                                                        );
                                                        toast.success(
                                                          hidden
                                                            ? `${category.name} is now visible on Home`
                                                            : `${category.name} is now hidden from Home`
                                                        );
                                                      } catch (error) {
                                                        toast.error(
                                                          "Failed to update category visibility"
                                                        );
                                                      }
                                                    }}
                                                    className={cn(
                                                      "p-0 rounded-none bg-transparent",
                                                      hidden
                                                        ? "text-gray-400 hover:text-gray-500"
                                                        : "text-gray-600 hover:text-gray-700"
                                                    )}
                                                    title={
                                                      hidden
                                                        ? "Show on Home"
                                                        : "Hide on Home"
                                                    }
                                                    type="button"
                                                  >
                                                    {hidden ? (
                                                      <EyeOff className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Eye className="w-3.5 h-3.5" />
                                                    )}
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <span className="text-xs">
                                                    Toggle visibility on Home
                                                  </span>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default FocusSession;
