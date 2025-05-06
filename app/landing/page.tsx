"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
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
        className="flex items-center justify-between px-8 pt-6 md:pt-8 pb-2 md:pb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="text-3xl font-bold tracking-tight select-none">tami</span>
        <div className="flex gap-4">
          <Link href="/signin" passHref legacyBehavior>
            <Button variant="secondary" className="px-6 py-2 text-base font-semibold shadow-none bg-muted hover:bg-muted/80 text-foreground">
              log in
            </Button>
          </Link>
          <Link href="/signup" passHref legacyBehavior>
            <Button className="px-6 py-2 text-base font-semibold bg-yellow-400 hover:bg-yellow-300 text-black shadow-none">
              sign up
            </Button>
          </Link>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row justify-center items-center px-8 pb-24 gap-8 md:gap-16 mt-2 md:mt-6">
        {/* Left: Text */}
        <motion.div 
          className="w-full md:w-1/2 max-w-xl mt-16 md:mt-0 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground mb-2"
            variants={itemVariants}
          >
            the simplest way<br />to get things done.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mt-5 mb-8 font-medium"
            variants={itemVariants}
          >
            Meet tami — your minimal, modern to-do list app. Organize tasks, set priorities, and stay locked in.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link href="/signup" passHref legacyBehavior>
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black text-base font-bold px-6 py-3 rounded-xl shadow-none transition-colors duration-300 flex items-center justify-center min-w-[200px]">
                <span className="font-bold">start planning</span>
                <span className="font-normal text-sm ml-2">— it's free</span>
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-10 text-muted-foreground text-base font-medium opacity-60 tracking-tight" 
            style={{letterSpacing: '-0.01em'}}
            variants={itemVariants}
          >
            loved by 100,000+ cool people
          </motion.div>
        </motion.div>
        
        {/* Right: Product Demo Image */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center items-center mt-12 md:mt-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.7, 
            duration: 0.8, 
            ease: [0.165, 0.84, 0.44, 1]  // ease-out-cubic
          }}
        >
          <div className="rounded-2xl shadow-lg bg-white/80 border border-gray-100 p-2 md:p-4 max-w-[350px] md:max-w-[400px]">
            <img
              src="/demo-product.png"
              alt="tami product demo"
              className="rounded-xl w-full h-auto object-cover"
              style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.07)' }}
            />
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
} 