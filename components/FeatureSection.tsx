import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Sparkles, Check } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full bg-gray-50 text-gray-900 py-16 sm:py-20 px-4 border-t border-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-16 items-start">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          viewport={{ once: true }}
          className="flex flex-col"
        >
          <div className="text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4">AI Task Capture</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-6">Talk to track your tasks</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 min-h-[48px] sm:min-h-[56px]">Just say what you need to do—AI listens and organizes it for you.</p>
          <Card className="bg-white border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col gap-3 sm:gap-4 h-64 sm:h-80 w-full">
            {/* User voice command bubble */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-500 font-semibold mr-1">You</span>
              <div className="flex flex-nowrap items-center whitespace-nowrap bg-blue-100 rounded-xl px-2 sm:px-4 py-1 sm:py-2 text-[9px] sm:text-xs md:text-sm text-gray-900 shadow-sm">
                <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6v-2a6 6 0 1112 0v2c0 3.314-2.686 6-6 6z" /></svg>
                <span>
                  "Remind me to finish the{' '}
                  <span className="font-semibold text-blue-600">project report</span>{' '}
                  by{' '}
                  <span className="font-semibold text-blue-600">Friday</span>{' '}
                  at{' '}
                  <span className="font-semibold text-blue-600">2pm</span>
                  <span className="text-black">"</span>
                </span>
              </div>
            </div>
            {/* AI response bubble */}
            <div className="flex items-center gap-2 self-end">
              <div className="flex flex-col bg-gray-100 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-sm sm:text-base shadow-sm">
                <span className="font-semibold text-blue-600">AI:</span>
                <span>Task tracked: <span className="font-medium">Finish project report</span></span>
                <span className="text-xs text-gray-500 mt-1">Due: Friday, 2:00pm</span>
              </div>
              <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 ml-1">AI</span>
            </div>
            {/* Notion-like task card */}
            <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📄</span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Finish project report</h3>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-600 rounded-full">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />Added
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">September 15, 2025 • 2:00 PM</div>
            </div>
          </Card>
        </motion.div>
        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col"
        >
          <div className="text-xs sm:text-sm font-medium text-purple-600 mb-3 sm:mb-4">Smart Scheduling & Collaboration</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-6">AI-Scheduled Day</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 min-h-[48px] sm:min-h-[56px]">Let AI find the best time for your work—see your day fill up automatically.</p>
          <Card className="bg-white border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col gap-2 sm:gap-3 h-64 sm:h-80 w-full">
            {/* Minimal Google Calendar-like day view */}
            <div className="relative w-full h-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col justify-between">
              {/* Time slots */}
              {[8,9,10,11,12,13,14,15,16,17].map(hour => (
                <div key={hour} className="flex items-center h-1/10 border-b border-gray-100 last:border-b-0 px-2 sm:px-3 text-xs text-gray-400">
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
              <div className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full shadow">AI scheduled</div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureSection 