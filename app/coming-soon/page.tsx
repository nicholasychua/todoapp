"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap, Brain, Clock } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addToWaitlist } from "@/lib/waitlist";
import { useState } from "react";
import { FeatureSection } from "@/components/FeatureSection";
import SideShadedFrame from "@/components/ui/side-shaded-frame";

export default function ComingSoonPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-[clamp(24px,8vw,120px)] py-6 border-b border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">
            subspace
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 px-2 sm:px-3"
          >
            Coming Soon
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-black">
            Get Notified
          </Button>
        </div>
      </motion.header>

      <SideShadedFrame>
        {/* Hero Section */}
        <motion.section
          className="relative z-10 border-b border-gray-200 py-20 sm:py-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div variants={itemVariants} className="text-center">
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Zap className="w-4 h-4 text-blue-600" />
                  AI-Powered Task Management
                </span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight mb-6">
                All your tasks.
                <br />
                Tracked faster.
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Think Notion + Wispr Flow. Subspace is your intelligent
                workspace for tasks, notes, and focus.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 flex justify-center"
            >
              <WaitlistInlineForm />
            </motion.div>
          </div>
        </motion.section>

        <div className="relative z-10">
          <FeatureSection />
        </div>

        {/* Social Proof */}
        {/* (Removed the Trusted by teams section) */}

        {/* Features Grid */}
        <motion.section
          className="relative z-10 border-b border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border-r border-gray-200 p-8 sm:p-12 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-gray-300 transition-colors">
                  <Brain className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Intelligence
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Automatically categorize and prioritize tasks using advanced AI.
                Just describe what you need to do, and let subspace handle the
                rest.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border-r border-gray-200 p-8 sm:p-12 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-gray-300 transition-colors">
                  <Clock className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Scheduling
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Intelligent time management that adapts to your workflow. Get
                personalized recommendations for when to tackle each task.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-8 sm:p-12 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-gray-300 transition-colors">
                  <Zap className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Built for speed and performance. Experience instant task
                creation, real-time updates, and seamless synchronization across
                all your devices.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="relative z-10 border-b border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-4 sm:px-6 lg:px-12 py-20 sm:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Ready to transform your productivity?
              </motion.h2>

              <motion.p
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Join thousands of developers and teams who are already building
                the future with subspace.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <WaitlistCTA />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="relative z-10 px-4 sm:px-6 lg:px-12 py-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                subspace
              </span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://x.com/nicholasychua"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M17.5 6.5L6.5 17.5" />
                  <path d="m6.5 6.5 11 11" />
                </svg>
              </a>
              <a
                href="mailto:nicholaschua@berkeley.edu"
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 6-8.97 6.66a2 2 0 0 1-2.36 0L2 6" />
                </svg>
              </a>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 subspace. All rights reserved.
            </div>
          </div>
        </motion.footer>
      </SideShadedFrame>
    </div>
  );
}

function WaitlistInlineForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        setStatus("idle");
        return;
      }
      await addToWaitlist(email);
      setStatus("success");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center py-8 w-full border border-gray-200 rounded-lg px-8">
          <Check className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-lg font-semibold mb-2 text-gray-900">
            You're on the waitlist!
          </div>
          <div className="text-gray-600 text-sm">
            We'll let you know when we launch.
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col sm:flex-row items-center gap-3"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 text-base px-5 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 transition-all"
            required
            autoFocus
          />
          <Button
            type="submit"
            className="h-12 px-8 rounded-lg bg-black text-white hover:bg-gray-900 text-base font-medium shadow-none border border-black flex items-center gap-2 transition-all duration-200 w-full sm:w-auto"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              "Joining..."
            ) : (
              <>
                Join waitlist <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <div className="flex items-center gap-2 mt-6 px-4 py-2 border border-gray-200 rounded-full">
        <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
        <span className="text-gray-600 text-sm font-medium">
          128 people already joined
        </span>
      </div>
    </div>
  );
}

function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        setStatus("idle");
        return;
      }
      await addToWaitlist(email);
      setStatus("success");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-lg px-12">
        <Check className="w-6 h-6 text-green-600 mb-2" />
        <div className="text-base font-semibold mb-1 text-gray-900">
          You're on the waitlist!
        </div>
        <div className="text-gray-600 text-sm">
          We'll let you know when we launch.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-md mx-auto"
    >
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 px-4 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0 text-base transition-all w-full flex-1"
        required
        autoFocus
        disabled={status === "loading"}
      />
      <button
        type="submit"
        className="h-11 px-6 rounded-lg bg-black text-white text-base font-medium shadow-none border border-black hover:bg-gray-900 flex items-center gap-2 transition-all duration-200 w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          "Joining..."
        ) : (
          <>
            Join <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-2 w-full text-center">
          {error}
        </div>
      )}
    </form>
  );
}
