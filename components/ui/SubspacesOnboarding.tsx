"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Layers,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { Button } from "./button";

interface SubspacesOnboardingProps {
  onComplete: () => void;
}

export function SubspacesOnboarding({ onComplete }: SubspacesOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "intro",
      title: "Welcome to Subspaces!",
      description:
        "Here is where all of your subspaces will be stored. Each subspace organizes tasks by category, helping you keep everything neat and focused.",
      icon: <Layers className="w-5 h-5 text-slate-700" />,
      highlights: ["category-cards"],
      position: "top-20 md:top-32 right-6 md:right-12", // Top right, won't block category cards
    },
    {
      id: "manage",
      title: "Manage Your Subspaces",
      description:
        "Add new categories using the text box at the top. You can hide or show categories from the main page for increased focus using the eye icon on each card.",
      icon: <Plus className="w-5 h-5 text-slate-700" />,
      highlights: ["create-category", "visibility-toggle"],
      position: "top-20 md:top-32 right-6 md:right-12", // Same position as step 1
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onComplete(); // Close if on first step
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {/* Tour Card - positioned near relevant UI elements */}
      <motion.div
        key="subspaces-tour-card"
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed z-50 w-72 md:w-80 ${currentStepData.position}`}
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden relative">
          {/* Back/Close Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
            title={currentStep === 0 ? "Close" : "Back"}
          >
            {currentStep === 0 ? (
              <X className="w-4 h-4 text-slate-500" />
            ) : (
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 border border-slate-200/60"
            >
              {currentStepData.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-xl font-semibold text-slate-900 mb-2"
            >
              {currentStepData.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm text-slate-600 leading-relaxed mb-6"
            >
              {currentStepData.description}
            </motion.p>

            {/* Visual Indicator for Step 2 */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">
                      Show on main page
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      Hide from main
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progress Dots */}
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-slate-900"
                      : index < currentStep
                      ? "w-1.5 bg-slate-400"
                      : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="sm"
                className="flex-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
              >
                {currentStep === steps.length - 1 ? (
                  "Get Started"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Step Counter */}
            <p className="text-center text-xs text-slate-400 mt-3">
              {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
