"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Check, Zap, Brain, Clock } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { addToWaitlist } from "@/lib/waitlist"
import { useState } from "react"
import { FeatureSection } from "@/components/FeatureSection"

export default function ComingSoonPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20
      } 
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      } 
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">subspace</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 px-2 sm:px-3">
            Coming Soon
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
            Get Notified
          </Button>
        </div>
      </motion.header>
      
      {/* Hero Section */}
      <motion.section 
        className="px-0 pt-2 sm:pt-4 pb-16 sm:pb-24 w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="w-full flex justify-center"
        >
          <div className="w-full bg-white py-6 sm:py-8 px-4 md:px-0">
            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                AI-Powered Task Management
              </span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight text-center px-4" style={{wordBreak: 'break-word'}}>
              All your tasks.<br />Tracked faster.
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto text-center px-4">
              Think Notion + Wispr Flow. Subspace is your intelligent workspace for tasks, notes, and focus.
            </p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 sm:gap-8">
          <WaitlistInlineForm />
        </motion.div>
      </motion.section>
      <FeatureSection />

      {/* Social Proof */}
      {/* (Removed the Trusted by teams section) */}

      {/* Features Grid */}
      <motion.section 
        className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="group">
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">AI-Powered Intelligence</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Automatically categorize and prioritize tasks using advanced AI. Just describe what you need to do, and let subspace handle the rest.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="group">
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 transition-colors">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Smart Scheduling</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Intelligent time management that adapts to your workflow. Get personalized recommendations for when to tackle each task.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="group">
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-200 transition-colors">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Built for speed and performance. Experience instant task creation, real-time updates, and seamless synchronization across all your devices.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="px-4 sm:px-6 py-16 sm:py-20 bg-blue-50/60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Ready to transform your productivity?
          </motion.h2>
          
          <motion.p 
            className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed px-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Join thousands of developers and teams who are already building the future with subspace.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            <WaitlistCTA />
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="px-4 sm:px-6 py-8 sm:py-12 border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">subspace</span>
            </div>
            <div className="flex justify-center">
              <div className="flex gap-4 sm:gap-6">
                <a href="https://x.com/nicholasychua" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter-x w-5 h-5 sm:w-6 sm:h-6"><path d="M17.5 6.5L6.5 17.5"/><path d="m6.5 6.5 11 11"/></svg>
                </a>
                <a href="mailto:nicholaschua@berkeley.edu" className="text-gray-500 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-5 h-5 sm:w-6 sm:h-6"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 6-8.97 6.66a2 2 0 0 1-2.36 0L2 6"/></svg>
                </a>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 text-center md:text-right">
              © 2025 subspace. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

function WaitlistInlineForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
    <div className="w-full max-w-xl flex flex-col items-center px-4">
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 w-full">
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-2" />
          <div className="text-base sm:text-lg font-semibold mb-1">You're on the waitlist!</div>
          <div className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">We'll let you know when we launch.</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-6 rounded-xl sm:rounded-2xl border border-gray-300 bg-white placeholder:text-gray-400 focus:border-gray-400 transition-all"
            required
            autoFocus
          />
          <Button
            type="submit"
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-gray-100 text-base sm:text-lg font-semibold shadow-none border border-gray-200 flex items-center gap-2 transition-all duration-200 w-full sm:w-auto"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Joining..." : <>Join waitlist <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
          </Button>
        </form>
      )}
      {error && <div className="text-red-500 text-xs sm:text-sm mt-2">{error}</div>}
      <div className="flex items-center gap-2 mt-4 sm:mt-6">
        <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 inline-block"></span>
        <span className="text-gray-500 text-sm sm:text-base font-medium">128 people already joined</span>
      </div>
    </div>
  );
}

function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
      <div className="flex flex-col items-center justify-center py-2 w-full">
        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-1" />
        <div className="text-sm sm:text-base font-semibold mb-1">You're on the waitlist!</div>
        <div className="text-gray-500 text-xs sm:text-sm mb-2">We'll let you know when we launch.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="h-10 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-gray-300 bg-white placeholder:text-gray-400 focus:border-gray-400 text-sm sm:text-base font-semibold transition-all w-full sm:w-[180px]"
        required
        autoFocus
        disabled={status === "loading"}
      />
      <button
        type="submit"
        className="h-10 sm:h-11 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-black text-white text-sm sm:text-base font-semibold shadow-none border border-black hover:bg-gray-900 flex items-center gap-2 transition-all duration-200 w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Joining..." : <>Join <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
      </button>
      {error && <div className="text-red-500 text-xs sm:text-sm mt-2 w-full text-center">{error}</div>}
    </form>
  );
} 