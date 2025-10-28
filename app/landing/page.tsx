"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Zap, Target, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Organization",
      description: "Categorize tasks with AI-powered suggestions",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Calendar Integration",
      description: "Seamlessly plan and schedule your workflow",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick Capture",
      description: "Voice input for instant task creation",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Visualize your productivity journey",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white to-blue-50/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Image
                  src="/subspacelogo.png"
                  alt="Subspace"
                  width={32}
                  height={32}
                  className="transition-transform group-hover:scale-105"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Subspace
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <a
                href="https://x.com/nicholasychua"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <Link
                href="/signin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log In
              </Link>
              <Link href="/signup">
                <Button
                  variant="default"
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="flex flex-col items-center text-center pt-20 pb-32"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <motion.div variants={fadeInUp} className="inline-flex mb-6">
              <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm text-sm text-gray-700">
                Organize your life, effortlessly
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-8 max-w-4xl leading-tight"
              variants={fadeInUp}
            >
              Task management that
              <br />
              <span className="font-medium">actually works</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-600 max-w-2xl mb-12 leading-relaxed font-light"
              variants={fadeInUp}
            >
              A minimalist platform to organize, track, and complete
              <br className="hidden sm:block" />
              your tasks with elegant simplicity.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4"
              variants={fadeInUp}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 text-base h-auto group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 rounded-full px-8 py-6 text-base h-auto hover:bg-gray-50"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 max-w-6xl w-full"
              variants={fadeInUp}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:border-gray-300 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-900 mb-4 transition-colors">
                    <div className="text-gray-700 group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
