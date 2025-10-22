"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export const SoundWave = memo(function SoundWave() {
  return (
    <div className="flex items-center gap-0.5 h-3">
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["60%", "100%", "60%"],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0,
        }}
      />
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["100%", "60%", "100%"],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
      <motion.div
        className="w-0.5 h-full bg-red-500 rounded-full"
        animate={{
          height: ["60%", "100%", "60%"],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />
    </div>
  );
});

