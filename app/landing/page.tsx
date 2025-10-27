"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Inconsolata } from "next/font/google";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export default function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[1400px] mx-auto px-8 pt-8 pb-5 flex items-center justify-between">
          <div className="lg:ml-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Image
                src="/subspacelogo.png"
                alt="Subspace"
                width={28}
                height={28}
                className="h-5 w-5 sm:h-7 sm:w-7"
              />
              <span className="text-lg sm:text-2xl font-semibold text-[#134e4a] relative -top-[2px]">
                Subspace
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-10">
            <a
              href="https://x.com/nicholasychua"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wide ${inconsolata.className}`}
            >
              CONTACT
            </a>
            <Link
              href="/signin"
              className={`text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wide ${inconsolata.className}`}
            >
              LOG IN
            </Link>
            <Link href="/signup">
              <Button
                className={`bg-[#2d5f5d] hover:bg-[#234948] text-white font-medium text-[13px] px-5 py-2 rounded-md transition-colors uppercase tracking-wide shadow-none h-auto ${inconsolata.className}`}
              >
                SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 overflow-hidden">
        <div className="relative py-24 lg:py-32 min-h-[70vh] lg:min-h-[80vh]">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Column - Content */}
              <motion.div
                className="flex flex-col space-y-8 max-w-xl mt-24 lg:mt-52 lg:ml-2 relative z-10"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
                  },
                }}
              >
                <motion.h1
                  className="text-[48px] sm:text-[64px] leading-[1.15] font-normal text-[#134e4a] tracking-tight"
                  variants={fadeInUp}
                >
                  All of your tasks,
                  <br />
                  tracked faster
                </motion.h1>

                <motion.p
                  className="text-[19px] leading-relaxed text-gray-600 max-w-xl"
                  variants={fadeInUp}
                >
                  Subspace is a powerful end-to-end platform to draft, plan, and
                  schedule your tasks and content.
                </motion.p>

                <motion.div
                  className="flex items-center gap-4 pt-2"
                  variants={fadeInUp}
                >
                  <Link href="/signup">
                    <Button
                      className={`bg-[#2d5f5d] hover:bg-[#234948] text-white font-semibold text-[13px] px-6 py-3 rounded-md transition-colors uppercase tracking-wide shadow-none h-auto ${inconsolata.className}`}
                    >
                      START TRACKING
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Column - Product Screenshot - Extends to edge */}
              <motion.div
                className="relative mt-8 lg:mt-0 lg:absolute lg:left-[48%] lg:top-[10%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[52vw] lg:max-w-[900px] lg:z-0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="relative w-full">
                  {/* Play button overlay */}
                  <a
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-[#2d5f5d] flex items-center justify-center cursor-pointer shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </motion.div>
                  </a>

                  {/* Demo text overlay */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-center">
                    <div className="text-[12px] font-medium text-gray-600 uppercase tracking-wide mb-1">
                      WATCH A DEMO
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                      04:24
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                    <img
                      src="/demo-product.png"
                      alt="Product demo screenshot"
                      className="w-full h-auto opacity-90"
                    />
                    {/* Enhanced fade overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent via-40% to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/60 via-40% to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/30 to-transparent pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
