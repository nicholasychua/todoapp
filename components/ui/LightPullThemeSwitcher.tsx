import { motion } from "framer-motion";
import { useState } from "react";

export function LightPullThemeSwitcher({ 
  onSwitch,
  "data-pomodoro": dataPomodoro 
}: { 
  onSwitch: () => void;
  "data-pomodoro": boolean;
}) {
  const [dragYPosition, setDragYPosition] = useState(0);
  const dragThreshold = 20; // Threshold in pixels to trigger the switch
  
  // Play sound and trigger switch
  const handleSwitch = () => {
    const audio = new Audio("/paper.mp3");
    audio.play();
    if (onSwitch) onSwitch();
  };

  return (
    <div className="relative py-16 p-6 overflow-visible select-none">
      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 50 }}
        dragElastic={0.2}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onDrag={(_, info) => {
          setDragYPosition(info.offset.y);
        }}
        onDragEnd={() => {
          // If dragged past threshold, trigger switch
          if (dragYPosition > dragThreshold) {
            handleSwitch();
          }
          // Reset position
          setDragYPosition(0);
        }}
        onClick={handleSwitch}
        className="relative bottom-0 w-8 h-8 rounded-full 
             bg-[radial-gradient(circle_at_center,_#facc15,_#fcd34d,_#fef9c3)] 
             data-[pomodoro=true]:bg-[radial-gradient(circle_at_center,_#4b5563,_#1f2937,_#000)] 
             shadow-[0_0_20px_8px_rgba(250,204,21,0.5)] 
             data-[pomodoro=true]:shadow-[0_0_20px_6px_rgba(31,41,55,0.7)]
             cursor-pointer 
             transition-colors duration-200"
        data-pomodoro={dataPomodoro}
      >
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-[9999px] bg-neutral-200 dark:bg-neutral-700"></div>
      </motion.div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground font-medium w-auto px-3 py-1.5">
        {dataPomodoro ? "Pull down or click to add tasks" : "Pull down or click to lock in"}
      </div>
    </div>
  );
}