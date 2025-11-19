"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Card } from "./card";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Task } from "@/lib/tasks";
import type { Category } from "@/lib/categories";

interface FocusSessionOnboardingProps {
  tasks: Task[];
  tasksLoaded?: boolean;
  completedTaskIds: string[];
  formatTextWithTags: (text: string) => React.ReactNode;
  getTagTextColor: (tag: string) => string;
  onComplete: (selectedTaskIds: string[]) => void;
  onCancel: () => void;
}

export function FocusSessionOnboarding({
  tasks,
  tasksLoaded = true,
  completedTaskIds,
  formatTextWithTags,
  getTagTextColor,
  onComplete,
  onCancel,
}: FocusSessionOnboardingProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Filter out completed tasks
  const availableTasks = tasks.filter((task) => {
    const isInWaitingPeriod = completedTaskIds.includes(task.id);
    const effectivelyCompleted = isInWaitingPeriod || task.completed;
    return !(effectivelyCompleted && !isInWaitingPeriod);
  });

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleStart = () => {
    if (selectedTaskIds.length > 0) {
      onComplete(selectedTaskIds);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto px-8"
      >
        <Card className="rounded-3xl border border-gray-200 shadow-none overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-white">
            <h2 className="text-2xl font-semibold text-gray-900">
              Choose Your Focus Tasks
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select the tasks you want to work on during this session
            </p>
          </div>

          {/* Task List - Shows 5 tasks, rest scrollable */}
          <div className="relative">
            <div className="bg-white max-h-[340px] overflow-y-auto scrollbar-thin">
              {tasksLoaded && availableTasks.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No tasks available. Create some tasks to get started!
                    </p>
                  </div>
                </div>
              ) : availableTasks.length > 0 || !tasksLoaded ? (
                <div className="divide-y divide-gray-200">
                  <AnimatePresence initial={false}>
                    {availableTasks.map((task, idx) => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      const hasDate = task.createdAt instanceof Date;
                      let dateString = "";
                      let timeString = "";
                      let isPastOrToday = false;

                      if (hasDate) {
                        const d = task.createdAt;
                        dateString = `${d.getMonth() + 1}/${d.getDate()}/${d
                          .getFullYear()
                          .toString()
                          .slice(-2)}`;
                        const dateOnly = new Date(d);
                        dateOnly.setHours(0, 0, 0, 0);
                        const todayOnly = new Date();
                        todayOnly.setHours(0, 0, 0, 0);
                        isPastOrToday =
                          dateOnly.getTime() <= todayOnly.getTime();
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
                              duration: 0.25,
                              ease: "easeInOut",
                            },
                          }}
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                            delay: idx * 0.04,
                          }}
                          onClick={(e) => {
                            // Don't trigger if clicking on the checkbox itself
                            if (
                              (e.target as HTMLElement).closest(
                                'button[role="checkbox"]'
                              )
                            ) {
                              return;
                            }
                            toggleTaskSelection(task.id);
                          }}
                          className={cn(
                            "flex items-start px-8 py-4 cursor-pointer transition-all duration-200",
                            isSelected
                              ? "bg-blue-50/50 hover:bg-blue-50/70"
                              : "hover:bg-gray-50"
                          )}
                        >
                          {/* Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            className="flex-shrink-0 mr-4 mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                          />

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900 block">
                                  {formatTextWithTags(task.text)}
                                </span>
                                {hasDate && (
                                  <span
                                    className={cn(
                                      "text-xs font-medium mt-1.5 inline-block",
                                      isPastOrToday
                                        ? "text-red-600"
                                        : "text-gray-400"
                                    )}
                                  >
                                    {dateString}
                                    {timeString ? `, ${timeString}` : ""}
                                  </span>
                                )}
                              </div>

                              {/* Tags */}
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 justify-end">
                                  {task.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs font-medium flex items-center gap-0.5"
                                    >
                                      <span
                                        className={cn(
                                          "transition-colors font-semibold",
                                          getTagTextColor(tag)
                                        )}
                                      >
                                        #
                                      </span>
                                      <span className="text-gray-700">
                                        {tag}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
            {/* Scroll indicator - shows when there are more than 5 tasks */}
            {availableTasks.length > 5 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTaskIds.length === 0 ? (
                <span>No tasks selected</span>
              ) : (
                <span className="font-medium">
                  {selectedTaskIds.length}{" "}
                  {selectedTaskIds.length === 1 ? "task" : "tasks"} selected
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStart}
                disabled={selectedTaskIds.length === 0}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-all duration-200",
                  selectedTaskIds.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md"
                )}
              >
                Start Focus Session
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
