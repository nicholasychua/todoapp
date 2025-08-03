"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  time?: string | null
  setTime?: (time: string | null) => void
}

export function DatePicker({ date, setDate, className, time: controlledTime, setTime: setControlledTime }: DatePickerProps) {
  // Local state for time input, default to null (shows '--:--')
  const [time, setTime] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  // Sync time input with date or controlledTime
  React.useEffect(() => {
    if (controlledTime !== undefined) {
      setTime(controlledTime);
    } else {
      setTime(null);
    }
  }, [controlledTime, date]);

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTime(value);
    if (setControlledTime) setControlledTime(value);
    // Don't call setDate here as it might override the original date
    // The time will be applied when the task is created
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 flex items-center justify-center", className)}
          aria-label="Select date"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        {/* Time Picker - Always visible */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
          <label htmlFor="time-picker" className="text-xs font-medium text-gray-700 mr-2">Time</label>
          <Input
            id="time-picker"
            type="time"
            value={time ?? ""}
            placeholder="--:--"
            onChange={handleTimeChange}
            className="w-32 h-8 text-xs px-2 py-1 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
} 