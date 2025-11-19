"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Mic,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { useAuth } from "@/lib/auth-context";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingProps {
  onComplete: () => void;
  onStepComplete: (stepId: string) => void;
  completedSteps: string[];
  hasStarted?: boolean;
}

export function Onboarding({
  onComplete,
  onStepComplete,
  completedSteps,
  hasStarted = false,
}: OnboardingProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<
    "welcome" | "checklist" | "compact-checklist"
  >(hasStarted ? "compact-checklist" : "welcome");
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  const [onboardingStartTime] = useState(Date.now());
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "add-task",
      title: "Add your first task",
      description: "Type in a task and press Shift+Enter to auto-categorize",
      icon: <Check className="w-5 h-5" />,
      completed: completedSteps.includes("add-task"),
    },
    {
      id: "try-dictation",
      title: "Try dictation",
      description: "Hold control to use voice, then edit if needed",
      icon: <Mic className="w-5 h-5" />,
      completed: completedSteps.includes("try-dictation"),
    },
    {
      id: "explore-subspaces",
      title: "Explore Subspaces",
      description: "View organized tasks and create custom categories",
      icon: <Layers className="w-5 h-5" />,
      completed: completedSteps.includes("explore-subspaces"),
    },
  ]);

  // Track onboarding start
  useEffect(() => {
    if (user && !hasStarted) {
      analytics.onboardingStarted(user.uid);
    }
  }, [user, hasStarted]);

  // Update steps when completedSteps changes and track step completion
  useEffect(() => {
    setSteps((prev) => {
      const updated = prev.map((step) => {
        const isNowCompleted = completedSteps.includes(step.id);
        const wasCompleted = step.completed;

        // Track when a step is newly completed
        if (isNowCompleted && !wasCompleted && user) {
          analytics.onboardingStepCompleted(user.uid, step.id);
        }

        return {
          ...step,
          completed: isNowCompleted,
        };
      });
      return updated;
    });
  }, [completedSteps, user]);

  const allCompleted = steps.every((step) => step.completed);
  const completedCount = steps.filter((step) => step.completed).length;

  // Welcome Screen (Centered, letter-style like Calmi example)
  if (phase === "welcome") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Track onboarding skipped (clicked outside)
              if (user) {
                const completionTime =
                  (Date.now() - onboardingStartTime) / 1000;
                analytics.onboardingSkipped(
                  user.uid,
                  completedCount,
                  steps.length
                );
              }
              onComplete();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{
              // Wait for most of the backdrop fade (2s) before showing the card
              delay: 1.2,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-4 w-full max-w-xl h-[610px] rounded-3xl bg-white px-8 py-10 md:px-12 md:py-12 shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
          >
            {/* Top bar: logo + progress */}
            <div className="mb-6 flex items-center gap-4">
              {/* Subspace logo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: -4 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-center w-10"
              >
                <Image
                  src="/subspacelogo.png"
                  alt="Subspace logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full shadow-sm"
                  priority
                />
              </motion.div>

              {/* Step progress (2-step indicator) */}
              <div className="flex-1 flex items-center justify-center gap-2 -mt-2">
                <div className="h-1.5 w-14 md:w-16 rounded-full bg-slate-900" />
                <div className="h-1.5 w-14 md:w-16 rounded-full bg-slate-200" />
              </div>

              {/* Spacer to balance the logo and center the progress bar */}
              <div className="w-10" />
            </div>

            {/* Letter-style copy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="space-y-5 text-left"
            >
              <p className="max-w-md text-[15px] font-medium leading-7 text-slate-800">
                hi friend
              </p>

              <p className="max-w-md text-[15px] leading-7 text-slate-800">
                i built subspace because i know how it feels to be overwhelmed
                with work
              </p>

              <p className="max-w-md text-[15px] leading-7 text-slate-800">
                our days are filled with so much to do; that sometimes we don't
                even know where to start
              </p>

              <p className="max-w-md text-[15px] leading-7 text-slate-800">
                whether you're planning something big or just trying to remember
                the little things-
              </p>

              <p className="text-[15px] font-semibold leading-7 text-slate-900">
                subspace holds the details so your brain can breathe.
              </p>

              <div className="pt-2 space-y-1">
                <p className="text-sm text-slate-500">with care,</p>
                <p className="text-base font-medium text-slate-800">
                  <Link
                    href="https://x.com/nicholasychua"
                    className="underline underline-offset-2 decoration-slate-300 hover:decoration-slate-600"
                    target="_blank"
                    rel="noreferrer"
                  >
                    nicholas
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              className="mt-8 flex"
            >
              <button
                onClick={() => setPhase("checklist")}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
              >
                next →
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Checklist Screen (full-screen second step)
  return (
    <AnimatePresence>
      {phase === "checklist" && !allCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-4 w-full max-w-xl h-[610px] rounded-3xl bg-white px-8 py-10 md:px-12 md:py-12 shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
          >
            {/* Top bar: back + 2-step progress + close */}
            <div className="mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPhase("welcome")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                aria-label="Back to introduction"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="h-1.5 w-14 md:w-16 rounded-full bg-slate-200" />
                <div className="h-1.5 w-14 md:w-16 rounded-full bg-slate-900" />
              </div>

              {/* Spacer to balance the back button and center the progress bar */}
              <div className="w-8" />
            </div>

            {/* Header copy */}
            <div className="mb-4 space-y-1 text-left">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                Get started
              </h2>
              <p className="text-sm text-slate-500">
                Check these off at your own pace. Subspace will feel much more
                tuned to you once you&apos;ve done them.
              </p>
            </div>

            {/* Steps (read-only; completion is driven by real actions elsewhere) */}
            <div className="mt-5 space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.06 }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200",
                    step.completed
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-slate-200/80 bg-slate-50/60"
                  )}
                >
                  {/* Icon / check */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-200",
                      step.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    )}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : step.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium leading-5 text-slate-900",
                        step.completed && "line-through text-emerald-700"
                      )}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xs leading-5 text-slate-500",
                        step.completed && "text-emerald-700/80"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer - Always show "start organizing" button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-10 flex justify-start"
            >
              <button
                onClick={() => {
                  // Track onboarding completion or skip based on steps completed
                  if (user) {
                    const completionTime =
                      (Date.now() - onboardingStartTime) / 1000;
                    if (allCompleted) {
                      analytics.onboardingCompleted(user.uid, completionTime);
                    } else {
                      analytics.onboardingSkipped(
                        user.uid,
                        completedCount,
                        steps.length
                      );
                    }
                  }
                  setPhase("compact-checklist");
                  onComplete();
                }}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
              >
                start organizing →
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Compact Checklist - Appears in corner after "start organizing" */}
      {phase === "compact-checklist" && !allCompleted && (
        <motion.div
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -20, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-6 z-50 w-80"
        >
          <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Getting Started
                </h3>
                <span className="text-xs text-slate-500">
                  {completedCount}/{steps.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                  className="p-1 hover:bg-slate-200/60 rounded-md transition-colors"
                  aria-label={isChecklistExpanded ? "Collapse" : "Expand"}
                >
                  {isChecklistExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Checklist Items */}
            <AnimatePresence>
              {isChecklistExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-2">
                    {[...steps]
                      .sort((a, b) => {
                        // Uncompleted tasks first, completed tasks at the bottom
                        if (a.completed === b.completed) return 0;
                        return a.completed ? 1 : -1;
                      })
                      .map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + index * 0.05 }}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                            step.completed
                              ? "bg-emerald-50/70"
                              : "bg-slate-50/60"
                          )}
                        >
                          {/* Checkbox */}
                          <div
                            className={cn(
                              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                              step.completed
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-300 bg-white"
                            )}
                          >
                            {step.completed && (
                              <Check className="h-3.5 w-3.5 text-white" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-xs font-medium leading-4 text-slate-900",
                                step.completed &&
                                  "line-through text-emerald-700"
                              )}
                            >
                              {step.title}
                            </p>
                            {!step.completed && (
                              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            {isChecklistExpanded && (
              <div className="px-4 pb-3">
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedCount / steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
