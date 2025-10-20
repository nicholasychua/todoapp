"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category } from "@/lib/categories";
import type { Task } from "@/lib/tasks";

interface TaskEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  task: Task | null;
  categories: Category[];
  getTagTextColor: (tag: string) => string;
}

export function TaskEditDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  categories,
  getTagTextColor,
}: TaskEditDialogProps) {
  const [taskText, setTaskText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when task changes
  useEffect(() => {
    if (task && isOpen) {
      setTaskText(task.text.replace(/#\w+/g, "").trim());
      setSelectedDate(task.createdAt);

      // Extract time from task if it exists
      const timeMatch = task.text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const ampm = timeMatch[3]?.toLowerCase();

        if (ampm === "pm" && hours !== 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;

        setSelectedTime(`${hours.toString().padStart(2, "0")}:${minutes}`);
      } else {
        setSelectedTime("");
      }

      // Extract category from tags
      setSelectedCategory(task.tags[0] || "");
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !taskText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Combine date and time
      let finalDate = new Date(selectedDate);
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(":");
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        // Keep original time if no time specified
        finalDate.setHours(
          task.createdAt.getHours(),
          task.createdAt.getMinutes(),
          task.createdAt.getSeconds(),
          task.createdAt.getMilliseconds()
        );
      }

      // Add category to task text if selected
      const taskWithCategory = selectedCategory
        ? `${taskText} #${selectedCategory}`
        : taskText;

      await onSave(task.id, {
        text: taskWithCategory,
        createdAt: finalDate,
        tags: selectedCategory ? [selectedCategory] : [],
      });

      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete || isLoading) return;

    setIsLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Task
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Task Name */}
                <div>
                  <Input
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="Add title"
                    className="w-full text-lg font-medium border-0 border-b border-gray-200 rounded-none px-0 py-2 focus:ring-0 focus-visible:outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  />
                </div>

                {/* Date and Time Section */}
                <div className="space-y-4">
                  {/* Date Picker */}
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-left font-normal p-0 h-auto hover:bg-transparent"
                        >
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-auto border-0 border-b border-gray-200 rounded-none px-0 py-1 focus:border-blue-500 focus:ring-0"
                      />
                      {selectedTime && (
                        <button
                          type="button"
                          onClick={() => setSelectedTime("")}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Category</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 ml-8">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category.name;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            setSelectedCategory(isSelected ? "" : category.name)
                          }
                          className={cn(
                            "px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 border",
                            isSelected
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getTagTextColor(category.name).replace(
                                "text-",
                                "bg-"
                              )
                            )}
                          />
                          <span>{category.name}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 ml-auto text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t border-gray-100">
                  {onDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 text-sm px-3 py-1.5 h-auto min-w-[100px] text-red-600 border-red-300 hover:text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!taskText.trim() || isLoading}
                    className="px-3 py-1.5 h-auto text-sm min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
