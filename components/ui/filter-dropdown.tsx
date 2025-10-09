"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FilterDropdownProps = {
  options: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
  children: React.ReactNode;
};

const FilterDropdown = ({ options, children }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        onClick={toggleDropdown}
        className="h-8 px-3 py-1 text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg shadow-sm transition-all"
      >
        {children ?? "Menu"}
        <>
          <motion.span
            className="ml-1.5"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -5, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 z-10 w-40 mt-2 p-1 bg-white rounded-lg border border-gray-200 shadow-lg flex flex-col gap-1"
          >
            {options && options.length > 0 ? (
              options.map((option, index) => {
                if (option.label === "separator") {
                  return (
                    <div
                      key={`separator-${index}`}
                      className="h-px bg-gray-200 my-1 mx-2"
                    />
                  );
                }
                return (
                  <motion.button
                    initial={{
                      opacity: 0,
                      x: -5,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      backgroundColor: "rgb(243, 244, 246)",
                      scale: 1.01,
                      transition: {
                        duration: 0.2,
                        ease: "easeOut",
                      },
                    }}
                    whileTap={{
                      scale: 0.97,
                      backgroundColor: "rgb(229, 231, 235)",
                      transition: {
                        duration: 0.1,
                      },
                    }}
                    key={option.label}
                    onClick={() => {
                      option.onClick();
                      setIsOpen(false);
                    }}
                    className="px-3 py-2 cursor-pointer text-gray-700 text-xs rounded-md w-full text-left flex items-center gap-x-2 transition-colors duration-200"
                  >
                    {option.Icon}
                    {option.label}
                  </motion.button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-400 text-xs">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FilterDropdown };
