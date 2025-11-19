"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Button as HoverButton } from "@/components/ui/hover-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Brain, Clock } from "lucide-react";
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
import { FeatureSection } from "@/components/FeatureSection";
import SideShadedFrame from "@/components/ui/side-shaded-frame";

export default function HomePage() {
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
        type: "spring" as const,
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
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#fdfcfb" }}
    >
      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-[clamp(24px,8vw,120px)] py-6 border-b border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-1.5">
          <Image
            src="/subspacelogo.png"
            alt="Subspace"
            width={28}
            height={28}
            className="h-5 w-5 sm:h-7 sm:w-7"
          />
          <span className="text-lg sm:text-2xl font-semibold text-gray-900 relative -top-[2px]">
            subspace
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/signin">
            <HoverButton
              variant="outline"
              size="default"
              className="text-xs sm:text-sm border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 py-2 px-3 sm:py-2.5 sm:px-4"
              neon={false}
            >
              Log In
            </HoverButton>
          </Link>
          <Link href="/signup">
            <HoverButton
              variant="default"
              size="default"
              className="text-xs sm:text-sm bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 px-3 py-2 sm:px-5 sm:py-2.5 flex items-center gap-1 sm:gap-2"
            >
              Get Started
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </HoverButton>
          </Link>
        </div>
      </motion.header>

      <SideShadedFrame>
        {/* Hero Section */}
        <motion.section
          className="relative z-10 border-b border-gray-200 pt-12 sm:pt-20 pb-16 sm:pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div variants={itemVariants} className="text-center">
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="whitespace-nowrap">
                    AI-Powered Task Management
                  </span>
                </span>
              </motion.div>
              <h1
                className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-black leading-tight tracking-tight mb-6 sm:mb-8 md:mb-10"
                style={{ fontFamily: "EB Garamond, serif" }}
              >
                All your tasks.
                <br />
                Tracked faster.
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
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
          className="relative z-10 border-t border-gray-200 border-b border-gray-200"
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
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                AI-Powered Intelligence
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Smart Scheduling
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Lightning Fast
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-4 sm:mb-6 text-gray-900 px-4 sm:px-0"
                style={{ fontFamily: "EB Garamond, serif" }}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Ready to transform your productivity?
              </motion.h2>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0"
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
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="flex items-center gap-1.5">
              <Image
                src="/subspacelogo.png"
                alt="Subspace"
                width={28}
                height={28}
                className="h-5 w-5 sm:h-7 sm:w-7"
              />
              <span className="text-lg sm:text-2xl font-semibold text-gray-900 relative -top-[2px]">
                subspace
              </span>
            </div>
            <div className="flex gap-6 justify-center w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2">
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
                href="https://instagram.com/nicholaschuas"
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
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <Link href="/signup">
        <ShimmerButton
          className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
          background="rgba(0, 0, 0, 1)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
        >
          Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </ShimmerButton>
      </Link>
      <div className="flex items-center gap-2 mt-4 sm:mt-6 px-3 sm:px-4 py-2 border border-gray-200 rounded-full">
        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 inline-block"></span>
        <span className="text-gray-600 text-xs sm:text-sm font-medium">
          128 people already joined
        </span>
      </div>
    </div>
  );
}

function WaitlistCTA() {
  return (
    <div className="flex justify-center items-center w-full max-w-md mx-auto">
      <Link href="/signup">
        <ShimmerButton
          className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
          background="rgba(0, 0, 0, 1)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
        >
          Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </ShimmerButton>
      </Link>
    </div>
  );
}
