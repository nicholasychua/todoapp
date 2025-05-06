"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } },
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signUp(email, password)
      toast.success("Account created successfully!")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast.success("Signed in with Google successfully!")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background px-6">
      {/* Logo at top left */}
      <div className="pt-10 pl-8 pb-2">
        <Link href="/landing" className="focus:outline-none">
          <span className="text-3xl font-bold tracking-tight hover:underline transition-colors">tami</span>
        </Link>
      </div>
      {/* Centered form with animation */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="signup"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="w-full max-w-xs flex flex-col gap-4"
          >
            {/* Heading (fixed height for consistency) */}
            <motion.div variants={itemVariants} className="text-center mb-2" style={{ minHeight: '56px' }}>
              <h1 className="text-xl font-semibold mb-1">create your account</h1>
              <p className="text-muted-foreground text-base">all your tasks, all in one place</p>
            </motion.div>
            {/* Form */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  autoComplete="email" 
                  placeholder="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  autoComplete="new-password" 
                  placeholder="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
              <Button type="submit" className="mt-2" disabled={loading} variant="outline">
                {loading ? "signing up..." : "sign up"}
              </Button>
            </motion.form>
            {/* Links (fixed height for consistency) */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-1 text-sm text-muted-foreground mb-0" style={{ minHeight: '40px' }}>
              <span>already have an account? <Link href="/signin" className="hover:underline">sign in</Link></span>
            </motion.div>
            {/* Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 mt-1 mb-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </motion.div>
            {/* Google button (logo inside button, button animates in) */}
            <motion.div variants={itemVariants}>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 mt-0 mb-0" 
                type="button"
                onClick={handleGoogleSignIn}
              >
                <span className="flex items-center justify-center mx-auto">
                  <Image src="/google.svg" alt="Google" width={20} height={20} />
                </span>
              </Button>
            </motion.div>
            {/* Legal (fixed height for consistency) */}
            <motion.p variants={itemVariants} className="text-xs text-center text-muted-foreground mt-0 mb-6" style={{ minHeight: '40px' }}>
              by signing up, you agree to our <Link href="#" className="underline">terms of service</Link>, <Link href="#" className="underline">privacy policy</Link>, and acknowledge our <Link href="#" className="underline">ai disclaimer</Link>
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 