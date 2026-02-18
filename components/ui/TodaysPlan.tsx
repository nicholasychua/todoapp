"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ChevronUp,
  Plus,
  Sparkles,
  GripVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyPlanItem } from "@/lib/daily-plan";

interface TodaysPlanProps {
  isOpen: boolean;
  items: DailyPlanItem[];
  onAddItem: (text: string) => void;
  onToggleItem: (id: string, completed: boolean) => void;
  onDeleteItem: (id: string) => void;
  onReorder: (items: DailyPlanItem[]) => void;
  onClose: () => void;
}

function PlanCheckbox({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div
      className={cn(
        "h-4 w-4 min-h-4 min-w-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors cursor-pointer",
        checked ? "border-gray-400" : "bg-white"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange();
      }}
    >
      {checked && (
        <div
          className="h-3.5 w-3.5 rounded-full bg-gray-400"
          style={{ boxShadow: "0 0 0 1px white inset" }}
        />
      )}
    </div>
  );
}

export function TodaysPlan({
  isOpen,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onReorder,
  onClose,
}: TodaysPlanProps) {
  const [newItemText, setNewItemText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const handleAddItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    onAddItem(text);
    setNewItemText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  // Stable reorder handler
  const handleReorder = useCallback(
    (newOrder: DailyPlanItem[]) => {
      onReorder(newOrder);
    },
    [onReorder]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div className="border border-gray-200 rounded-xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  Today&apos;s Plan
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {/* Empty state */}
              {items.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Plan your day &mdash; add action items or pull in existing
                  tasks.
                </p>
              )}

              {/* Items list */}
              {items.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={items}
                  onReorder={handleReorder}
                  className="space-y-1 py-2"
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2.5 group rounded-lg px-2 py-1.5 -mx-2 hover:bg-gray-50 transition-colors"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0" />
                        <PlanCheckbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            onToggleItem(item.id, !item.completed)
                          }
                        />
                        <span
                          className={cn(
                            "text-sm flex-1 transition-all duration-200",
                            item.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          )}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-0.5 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-gray-300 transition-colors">
                  <Plus className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add action item..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
