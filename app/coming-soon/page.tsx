"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ComingSoonPage() {
  // Subtle animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 50, 
        mass: 0.5,
        damping: 10
      } 
    }
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6 md:pt-8 pb-2 md:pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="text-2xl sm:text-3xl font-bold tracking-tight select-none">subspace</span>
        <div className="flex gap-2 sm:gap-4">
          <Button variant="secondary" className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-semibold shadow-none bg-muted hover:bg-muted/80 text-foreground cursor-not-allowed opacity-50">
            coming soon
          </Button>
          <Button className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-semibold bg-yellow-400 hover:bg-yellow-300 text-black shadow-none cursor-not-allowed opacity-50">
            coming soon
          </Button>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row justify-center items-center px-4 sm:px-8 pb-16 sm:pb-24 gap-8 md:gap-16 mt-2 md:mt-6">
        {/* Left: Text */}
        <motion.div 
          className="w-full md:w-1/2 max-w-xl mt-8 sm:mt-16 md:mt-0 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground mb-2"
            variants={itemVariants}
          >
            the simplest way<br />to get things done.
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground mt-4 sm:mt-5 mb-6 sm:mb-8 font-medium"
            variants={itemVariants}
          >
            Meet subspace — your minimal to-do list; supercharged with AI. Automate tasks, set priorities, and stay locked in.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Button 
              className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm sm:text-base font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-none transition-colors duration-300 flex items-center justify-center min-w-[160px] sm:min-w-[200px] cursor-not-allowed opacity-50"
              disabled
            >
              <span className="font-bold">coming soon</span>
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-8 sm:mt-10 text-muted-foreground text-sm sm:text-base font-medium opacity-60 tracking-tight" 
            style={{letterSpacing: '-0.01em'}}
            variants={itemVariants}
          >
            launching soon :)
          </motion.div>
        </motion.div>
        
        {/* Right: Product Demo Image */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center items-center mt-8 sm:mt-12 md:mt-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.7, 
            duration: 0.8, 
            ease: [0.165, 0.84, 0.44, 1]  // ease-out-cubic
          }}
        >
          <div className="rounded-2xl shadow-lg bg-white/80 border border-gray-100 p-2 sm:p-3 md:p-4 max-w-[280px] sm:max-w-[350px] md:max-w-[400px] w-full">
            <img
              src="/demo-product.png"
              alt="subspace product demo"
              className="rounded-xl w-full h-auto object-cover"
              style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.07)' }}
            />
          </div>
        </motion.div>
      </main>

      {/* Subspace Feature Section */}
      <motion.section
        className="w-full flex flex-col items-center px-4 md:px-0 mt-0 mb-16 sm:mb-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="w-full flex justify-center mb-6 sm:mb-8">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center shadow-sm">
              {/* Placeholder icon: replace with your own SVG/icon if desired */}
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-7 sm:h-7">
                <rect x="4" y="8" width="20" height="12" rx="6" fill="#FDE68A" />
                <rect x="9" y="4" width="10" height="20" rx="5" fill="#F59E42" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight text-foreground">Subspace organizes your digital world.</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center max-w-xl mb-0 font-medium">
            Subspace intelligently groups your tasks, notes, and resources into focused workspaces—so you always know where everything lives, and context-switching is effortless.
          </p>
        </div>
      </motion.section>

      
      {/* AI Feature Section - Redesigned for mobile */}
      <motion.section
        className="w-full flex flex-col items-center px-4 md:px-0 mb-16 sm:mb-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="w-full max-w-4xl">
          {/* Feature 1: Automated task tracking */}
          <div className="mb-12 sm:mb-16">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
              {/* Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="rounded-xl bg-muted border border-gray-100 w-full max-w-[280px] sm:max-w-[320px] h-[160px] sm:h-[180px] flex justify-center items-center">
                  {/* Dashboard SVG mockup */}
                  <svg width="200" height="100" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[240px] sm:h-[120px]">
                    <rect width="400" height="220" rx="24" fill="#FAFAF9"/>
                    <rect x="32" y="32" width="336" height="32" rx="8" fill="#E5E7EB"/>
                    <rect x="32" y="80" width="240" height="20" rx="6" fill="#F3F4F6"/>
                    <rect x="32" y="110" width="180" height="20" rx="6" fill="#F3F4F6"/>
                    <rect x="32" y="140" width="120" height="20" rx="6" fill="#F3F4F6"/>
                    <rect x="32" y="170" width="200" height="20" rx="6" fill="#F3F4F6"/>
                    <rect x="280" y="80" width="88" height="110" rx="12" fill="#FDE68A"/>
                    <rect x="300" y="100" width="48" height="12" rx="4" fill="#F59E42"/>
                  </svg>
                </div>
              </div>
              {/* Text */}
              <div className="w-full md:w-1/2 flex flex-col text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-3">
                  <div className="h-6 w-0.5 bg-blue-500 mr-3" style={{ minWidth: '2px' }} />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Automated task tracking</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Tired of writing down your tasks? Subspace writes and categorizes your tasks; all from a simple sentence.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2: AI-powered task prioritization */}
          <div className="mb-12 sm:mb-16">
            <div className="flex flex-col md:flex-row-reverse items-center gap-6 sm:gap-8 md:gap-12">
              {/* Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="rounded-xl bg-muted border border-gray-100 w-full max-w-[280px] sm:max-w-[320px] h-[70px] sm:h-[80px] flex justify-center items-center">
                  {/* Waveform SVG */}
                  <svg width="240" height="50" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[280px] sm:h-[60px]">
                    <rect x="10" y="40" width="10" height="30" rx="5" fill="#F59E42"/>
                    <rect x="30" y="30" width="10" height="50" rx="5" fill="#FDE68A"/>
                    <rect x="50" y="20" width="10" height="60" rx="5" fill="#36C5F0"/>
                    <rect x="70" y="10" width="10" height="70" rx="5" fill="#2EB67D"/>
                    <rect x="90" y="20" width="10" height="60" rx="5" fill="#10B981"/>
                    <rect x="110" y="30" width="10" height="50" rx="5" fill="#6366F1"/>
                    <rect x="130" y="40" width="10" height="30" rx="5" fill="#F43F5E"/>
                    <rect x="150" y="50" width="10" height="10" rx="5" fill="#F59E42"/>
                    <rect x="170" y="40" width="10" height="30" rx="5" fill="#FDE68A"/>
                    <rect x="190" y="30" width="10" height="50" rx="5" fill="#36C5F0"/>
                    <rect x="210" y="20" width="10" height="60" rx="5" fill="#2EB67D"/>
                    <rect x="230" y="10" width="10" height="70" rx="5" fill="#10B981"/>
                    <rect x="250" y="20" width="10" height="60" rx="5" fill="#6366F1"/>
                    <rect x="270" y="30" width="10" height="50" rx="5" fill="#F43F5E"/>
                    <rect x="290" y="40" width="10" height="30" rx="5" fill="#F59E42"/>
                  </svg>
                </div>
              </div>
              {/* Text */}
              <div className="w-full md:w-1/2 flex flex-col text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-3">
                  <div className="h-6 w-0.5 bg-blue-500 mr-3" style={{ minWidth: '2px' }} />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">AI-powered task prioritization</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Subspace takes all of of your projects and tasks — their priorities, deadlines, durations, and more — and builds an optimized plan based on your preferences. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Subspace Integrations Section */}
      <section className="w-full flex flex-col items-center justify-center px-4" style={{ background: '#fcfbf7', minHeight: '280px' }}>
        <div className="relative max-w-6xl w-full flex flex-col items-center text-center h-full justify-center py-12 sm:py-16">
          {/* Integration Icons Cloud - Hidden on mobile for cleaner look */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
            {/* Far left, various vertical positions */}
            <div className="absolute left-0 top-[12%]">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#F59E42"/></svg>
              </div>
            </div>
            <div className="absolute left-0 top-[65%]">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#FDE68A"/></svg>
              </div>
            </div>
            {/* Left, mid-high */}
            <div className="absolute left-[8%] top-[28%]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><rect x="9" y="3" width="4" height="16" rx="2" fill="#36C5F0"/><rect x="3" y="9" width="16" height="4" rx="2" fill="#2EB67D"/></svg>
              </div>
            </div>
            {/* Left, mid-low */}
            <div className="absolute left-[10%] bottom-[28%]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md">
                <svg width="14" height="14" fill="none"><circle cx="7" cy="7" r="7" fill="#6366F1"/></svg>
              </div>
            </div>
            {/* Right, various vertical positions */}
            <div className="absolute right-0 top-[18%]">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#10B981"/></svg>
              </div>
            </div>
            <div className="absolute right-0 bottom-[25%]">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#F43F5E"/></svg>
              </div>
            </div>
            {/* Right, mid-high */}
            <div className="absolute right-[8%] top-[38%]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><rect x="9" y="3" width="4" height="16" rx="2" fill="#36C5F0"/><rect x="3" y="9" width="16" height="4" rx="2" fill="#2EB67D"/></svg>
              </div>
            </div>
            {/* Right, mid-low */}
            <div className="absolute right-[10%] bottom-[35%]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md">
                <svg width="14" height="14" fill="none"><circle cx="7" cy="7" r="7" fill="#F59E42"/></svg>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Ready to organize 10x faster?</h2>
            <button className="px-4 sm:px-5 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-sm sm:text-base shadow-sm opacity-60 cursor-not-allowed" disabled>coming soon</button>
          </div>
        </div>
      </section>

    </motion.div>
  )
} 