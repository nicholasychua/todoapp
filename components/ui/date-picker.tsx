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
    if (date && value) {
      const [h, m] = value.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(h);
      newDate.setMinutes(m);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setDate(newDate);
    }
  };

  return (
    <Popover>
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
        {/* Time Picker */}
        {date && (
          <div className="p-3 border-t flex items-center gap-2">
            <label htmlFor="time-picker" className="text-xs text-muted-foreground mr-2">Time</label>
            <Input
              id="time-picker"
              type="time"
              value={time ?? ""}
              placeholder="--:--"
              onChange={handleTimeChange}
              className="w-28 h-8 text-xs px-2 py-1"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 