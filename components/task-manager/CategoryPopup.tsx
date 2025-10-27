"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addCategory,
  setCategoryHiddenOnHome,
  type Category,
} from "@/lib/categories";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  categories: Category[];
  position: { top: number; left: number };
  inputValue: string;
  onInputChange: (value: string) => void;
  user: any;
}

export const CategoryPopup = memo(function CategoryPopup({
  isOpen,
  onClose,
  onSelect,
  categories,
  position,
  inputValue,
  onInputChange,
  user,
}: CategoryPopupProps) {
  const [customInput, setCustomInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCategories = categories.filter((cat) =>
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
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCategories.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCategories[selectedIndex]) {
            handleSelect(filteredCategories[selectedIndex].name);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
          {filteredCategories.map((category, index) => {
            const hidden = category.hiddenOnHome ?? false;
            return (
              <div
                key={category.id}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium flex items-center gap-3 group",
                  index === selectedIndex
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 border border-transparent"
                )}
              >
                <motion.button
                  onClick={() => handleSelect(category.name)}
                  className="flex items-center gap-3 flex-1 text-left"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === selectedIndex ? "bg-blue-500" : "bg-gray-400"
                    )}
                  ></span>
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

                {/* Eye Icon Toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await setCategoryHiddenOnHome(category.id, !hidden);
                            toast.success(
                              hidden
                                ? `${category.name} is now visible on Home`
                                : `${category.name} is now hidden from Home`
                            );
                          } catch (error) {
                            toast.error("Failed to update category visibility");
                          }
                        }}
                        className={cn(
                          "p-1 rounded-md transition-colors hover:bg-gray-50",
                          hidden
                            ? "text-gray-400 hover:text-gray-500"
                            : "text-gray-600 hover:text-gray-700"
                        )}
                        title={hidden ? "Show on Home" : "Hide on Home"}
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
                      <span className="text-xs">Toggle visibility on Home</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
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
                  if (e.key === "Enter") {
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
});
