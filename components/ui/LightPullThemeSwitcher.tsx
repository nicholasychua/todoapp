import { motion } from "framer-motion";

export function LightPullThemeSwitcher({ 
  onSwitch,
  "data-pomodoro": dataPomodoro 
}: { 
  onSwitch: () => void;
  "data-pomodoro": boolean;
}) {
  // Play click sound
  const handleSwitch = () => {
    const audio = new Audio("/paper.mp3");
    audio.play();
    if (onSwitch) onSwitch();
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, duration: 0.4 }}
      className="relative py-16 p-6"
    >
      <motion.div
        drag="y"
        dragDirectionLock
        onDragEnd={(event, info) => {
          if (info.offset.y > 0) {
            handleSwitch();
          }
        }}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
        dragElastic={0.075}
        whileDrag={{ cursor: "grabbing" }}
        className="relative bottom-0 w-8 h-8 rounded-full 
             bg-[radial-gradient(circle_at_center,_#facc15,_#fcd34d,_#fef9c3)] 
             data-[pomodoro=true]:bg-[radial-gradient(circle_at_center,_#4b5563,_#1f2937,_#000)] 
             shadow-[0_0_20px_8px_rgba(250,204,21,0.5)] 
             data-[pomodoro=true]:shadow-[0_0_20px_6px_rgba(31,41,55,0.7)]"
        data-pomodoro={dataPomodoro}
      >
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-[9999px] bg-neutral-200 dark:bg-neutral-700"></div>
      </motion.div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground font-medium">
        {dataPomodoro ? "Pull down to add tasks" : "Pull down to lock in"}
      </div>
    </motion.div>
  );
}