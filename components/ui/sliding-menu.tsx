import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface SlidingMenuProps {
  children: React.ReactNode
  className?: string
}

export function SlidingMenu({ children, className }: SlidingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
      {/* Container with hidden overflow except for the tab handle */}
      <div className="relative">
        {/* Menu panel with tab attached */}
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ 
            x: isOpen ? 0 : "100%" 
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="relative flex"
        >
          {/* Tab handle */}
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-full h-16 w-8 flex items-center justify-center bg-background border border-l border-t border-b border-border rounded-l-lg shadow-md cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </div>
          
          {/* Menu content */}
          <div className={cn(
            "w-[280px] bg-background border border-border rounded-l-lg shadow-lg p-4",
            className
          )}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 