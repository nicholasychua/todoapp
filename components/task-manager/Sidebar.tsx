"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  showBacklog: boolean;
  showPomodoro: boolean;
  showCalendar: boolean;
  setShowBacklog: (show: boolean) => void;
  setShowPomodoro: (show: boolean) => void;
  setShowCalendar: (show: boolean) => void;
  handleBacklogToggle: () => void;
  handleLightSwitch: () => void;
  handleCalendarToggle: () => void;
  handleLogout: () => void;
}

export const Sidebar = memo(function Sidebar({
  showBacklog,
  showPomodoro,
  showCalendar,
  setShowBacklog,
  setShowPomodoro,
  setShowCalendar,
  handleBacklogToggle,
  handleLightSwitch,
  handleCalendarToggle,
  handleLogout,
}: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-gray-50 p-4 flex flex-col z-10">
      {/* Logo and Title */}
      <div className="flex items-center gap-2 mb-6 px-4 pt-6">
        <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <span className="text-lg font-semibold text-gray-900">subspace</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1 -translate-y-6">
        <button
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            !showBacklog && !showPomodoro && !showCalendar
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          )}
          onClick={() => {
            setShowBacklog(false);
            setShowPomodoro(false);
            setShowCalendar(false);
          }}
        >
          Home
        </button>
        <button
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            showBacklog ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
          onClick={handleBacklogToggle}
        >
          Subspaces
        </button>
        <button
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            showCalendar ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
          onClick={handleCalendarToggle}
        >
          Calendar
        </button>
        <button
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal",
            showPomodoro ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
          onClick={handleLightSwitch}
        >
          Focus Session
        </button>
        <button
          className="text-left px-4 py-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-normal"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </div>
  );
});

