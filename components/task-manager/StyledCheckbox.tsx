"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface StyledCheckboxProps {
  checked: boolean;
  onCheckedChange: () => void;
  className?: string;
}

export const StyledCheckbox = memo(function StyledCheckbox({
  checked,
  onCheckedChange,
  className,
}: StyledCheckboxProps) {
  return (
    <div
      className={cn(
        "h-4 w-4 min-h-4 min-w-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors cursor-pointer",
        checked ? "border-gray-400" : "bg-white",
        className
      )}
      onClick={onCheckedChange}
      data-task-checkbox
    >
      {checked && (
        <div
          className="h-3.5 w-3.5 rounded-full bg-gray-400"
          style={{ boxShadow: "0 0 0 1px white inset" }}
        />
      )}
    </div>
  );
});

