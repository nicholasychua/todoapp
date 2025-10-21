import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, Check } from "lucide-react";

// Corner bracket frame component
function CornerBrackets() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Full border */}
      <div className="absolute inset-0 border border-gray-300"></div>

      {/* Top-left corner bracket (black highlights) */}
      <div className="absolute top-0 left-0 w-4 sm:w-6 h-4 sm:h-6">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-black"></div>
        <div className="absolute top-0 left-0 w-0.5 h-full bg-black"></div>
      </div>
      {/* Top-right corner bracket (black highlights) */}
      <div className="absolute top-0 right-0 w-4 sm:w-6 h-4 sm:h-6">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-black"></div>
        <div className="absolute top-0 right-0 w-0.5 h-full bg-black"></div>
      </div>
      {/* Bottom-left corner bracket (black highlights) */}
      <div className="absolute bottom-0 left-0 w-4 sm:w-6 h-4 sm:h-6">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-black"></div>
      </div>
      {/* Bottom-right corner bracket (black highlights) */}
      <div className="absolute bottom-0 right-0 w-4 sm:w-6 h-4 sm:h-6">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-black"></div>
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-black"></div>
      </div>
    </div>
  );
}

export function FeatureSection() {
  return (
    <section className="w-full bg-gray-50 text-gray-900 py-16 sm:py-20 px-4 border-t border-gray-100">
      <div className="max-w-7xl mx-auto relative px-8 sm:px-12 py-10 sm:py-12">
        {/* Outer frame with corner brackets */}
        <CornerBrackets />

        {/* Center divider line with T-bracket highlights */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
          {/* Vertical grey line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

          {/* Top T-bracket (black) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            {/* Horizontal line */}
            <div className="absolute left-1/2 top-0 w-4 sm:w-6 h-0.5 bg-black -translate-x-1/2"></div>
            {/* Vertical accent */}
            <div className="absolute left-1/2 top-0 w-0.5 h-4 sm:h-6 bg-black -translate-x-1/2"></div>
          </div>

          {/* Bottom T-bracket (black) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
            {/* Horizontal line */}
            <div className="absolute left-1/2 bottom-0 w-4 sm:w-6 h-0.5 bg-black -translate-x-1/2"></div>
            {/* Vertical accent */}
            <div className="absolute left-1/2 bottom-0 w-0.5 h-4 sm:h-6 bg-black -translate-x-1/2"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-20 items-start">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            className="flex flex-col md:pr-10"
          >
            <div className="text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4">
              AI Task Capture
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-6">
              Talk to track your tasks
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Just say what you need to do—AI listens and organizes it for you.
            </p>
            <Card className="bg-white border border-gray-200 p-3 sm:p-4 shadow-sm flex flex-col gap-2 h-44 sm:h-52 w-full overflow-hidden">
              {/* User voice command bubble */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-blue-500 font-semibold">
                  You
                </span>
                <div className="flex flex-nowrap items-center whitespace-nowrap bg-blue-100 rounded-lg px-2 sm:px-3 py-1 text-[9px] sm:text-xs text-gray-900 shadow-sm">
                  <svg
                    className="w-2 h-2 sm:w-3 sm:h-3 mr-1 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v2m0 0c-3.314 0-6-2.686-6-6v-2a6 6 0 1112 0v2c0 3.314-2.686 6-6 6z"
                    />
                  </svg>
                  <span>
                    "Remind me to finish the{" "}
                    <span className="font-semibold text-blue-600">
                      project report
                    </span>{" "}
                    by{" "}
                    <span className="font-semibold text-blue-600">Friday</span>{" "}
                    at <span className="font-semibold text-blue-600">2pm</span>
                    <span className="text-black">"</span>
                  </span>
                </div>
              </div>
              {/* AI response bubble */}
              <div className="flex items-center gap-1.5 self-end">
                <div className="flex flex-col bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-gray-800 text-[10px] sm:text-xs shadow-sm">
                  <span className="font-semibold text-blue-600">AI:</span>
                  <span>
                    Task tracked:{" "}
                    <span className="font-medium">Finish project report</span>
                  </span>
                  <span className="text-[9px] sm:text-xs text-gray-500 mt-0.5">
                    Due: Friday, 2:00pm
                  </span>
                </div>
                <span className="text-[9px] bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                  AI
                </span>
              </div>
              {/* Notion-like task card */}
              <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-2 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">📄</span>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                      Finish project report
                    </h3>
                  </div>
                  <span className="flex items-center gap-0.5 text-[9px] sm:text-xs font-medium px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                    Added
                  </span>
                </div>
                <div className="mt-1 text-[9px] sm:text-xs text-gray-500">
                  September 15, 2025 • 2:00 PM
                </div>
              </div>
            </Card>
          </motion.div>
          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col md:pl-10"
          >
            <div className="text-xs sm:text-sm font-medium text-purple-600 mb-3 sm:mb-4">
              Smart Scheduling & Collaboration
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-6">
              AI-Scheduled Day
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Let AI find the best time for your work—see your day fill up
              automatically.
            </p>
            <Card className="bg-white border border-gray-200 p-3 sm:p-4 shadow-sm flex flex-col gap-2 sm:gap-3 h-44 sm:h-52 w-full overflow-hidden">
              {/* Minimal Google Calendar-like day view */}
              <div className="relative w-full h-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col justify-between">
                {/* Time slots */}
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
                  <div
                    key={hour}
                    className="flex items-center h-1/10 border-b border-gray-100 last:border-b-0 px-2 sm:px-3 text-xs text-gray-400"
                  >
                    {hour}:00
                  </div>
                ))}
                {/* AI-slotted events */}
                <div className="absolute left-16 sm:left-24 top-[15%] w-3/4 sm:w-4/5 px-2 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-blue-900 bg-blue-100 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                  Gym
                </div>
                <div className="absolute left-16 sm:left-24 top-[30%] w-2/3 px-2 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-purple-900 bg-purple-100 border-l-4 border-purple-500 rounded-r-xl shadow-sm flex items-center gap-1 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  AI suggested: Finish project report
                </div>
                <div className="absolute left-16 sm:left-24 top-[45%] w-1/2 px-2 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-blue-900 bg-blue-100 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                  Sales Call
                </div>
                <div className="absolute left-16 sm:left-24 top-[60%] w-2/3 px-2 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-purple-900 bg-purple-100 border-l-4 border-purple-500 rounded-r-xl shadow-sm flex items-center gap-1 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  AI suggested: Start folding laundry
                </div>
                <div className="absolute left-16 sm:left-24 top-[75%] w-3/4 px-2 sm:px-4 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-blue-900 bg-blue-100 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                  Family Dinner
                </div>
                {/* AI label */}
                <div className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full shadow">
                  AI scheduled
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
