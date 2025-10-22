"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar as CalendarIcon, Tag } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category } from "@/lib/categories";

interface TaskCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    text: string;
    date: Date;
    category?: string;
  }) => void;
  initialDate?: Date;
  categories: Category[];
  getTagTextColor: (tag: string) => string;
}

export function TaskCreationDialog({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  categories,
  getTagTextColor,
}: TaskCreationDialogProps) {
  const [taskText, setTaskText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setTaskText("");
      setSelectedTime("");
      setSelectedCategory("");
      if (initialDate) {
        setSelectedDate(initialDate);
      }
    }
  }, [isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    // Combine date and time
    let finalDate = new Date(selectedDate);
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(":");
      finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // Set to midnight if no time specified
      finalDate.setHours(0, 0, 0, 0);
    }

    // Add category to task text if selected
    const taskWithCategory = selectedCategory
      ? `${taskText} #${selectedCategory}`
      : taskText;

    onSubmit({
      text: taskWithCategory,
      date: finalDate,
      category: selectedCategory,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Task
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name
                  </label>
                  <Input
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="What do you need to do?"
                    className="w-full text-base"
                    autoFocus
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full pl-10"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category.name;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            setSelectedCategory(
                              isSelected ? "" : category.name
                            )
                          }
                          className={cn(
                            "px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 border-2",
                            isSelected
                              ? "bg-gray-900 text-white border-gray-900 shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              getTagTextColor(category.name).replace(
                                "text-",
                                "bg-"
                              )
                            )}
                          />
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!taskText.trim()}
                    className="flex-1"
                  >
                    Create Task
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

