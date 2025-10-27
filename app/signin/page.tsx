"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function SignInPage() {
  const { signIn, signInWithGoogle, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to log in";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google successfully!");
      router.push("/");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to sign in with Google";
      toast.error(errorMessage);
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6">
      {/* Logo at top left */}
      <div className="absolute top-10 left-8">
        <Link
          href="/landing"
          className="flex items-center gap-1.5 focus:outline-none"
        >
          <Image
            src="/subspacelogo.png"
            alt="Subspace"
            width={28}
            height={28}
            className="h-5 w-5 sm:h-7 sm:w-7"
          />
          <span className="text-lg sm:text-2xl font-semibold tracking-tight hover:underline transition-colors relative -top-[2px]">
            subspace
          </span>
        </Link>
      </div>
      {/* Centered form with animation */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key="signin"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="w-full max-w-xs flex flex-col gap-4"
          >
            {/* Heading (fixed height for consistency) */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-2"
              style={{ minHeight: "56px" }}
            >
              <h1 className="text-xl font-semibold mb-1">ready when you are</h1>
              <p className="text-muted-foreground text-base">
                all your tasks, all in one place
              </p>
            </motion.div>
            {/* Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {error && (
                <div
                  className="mb-2 px-4 py-2 rounded bg-red-50 text-red-600 text-sm border border-red-200 text-center"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  disabled={loading}
                  className="transition-opacity"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-opacity"
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="mt-2 transition-all"
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span>
                    logging in...
                  </span>
                ) : (
                  "log in"
                )}
              </Button>
            </motion.form>
            {/* Links (fixed height for consistency) */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-1 text-sm text-muted-foreground mb-0"
              style={{ minHeight: "40px" }}
            >
              <Link href="/forgot-password" className="hover:underline">
                forgot your password?
              </Link>
              <span>
                don't have an account?{" "}
                <Link href="/signup" className="hover:underline">
                  sign up
                </Link>
              </span>
            </motion.div>
            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mt-1 mb-2"
            >
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </motion.div>
            {/* Google button (logo inside button, button animates in) */}
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mt-0 mb-0 transition-all"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <span className="flex items-center justify-center mx-auto">
                  {loading ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <Image
                      src="/google.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      priority
                    />
                  )}
                </span>
              </Button>
            </motion.div>
            {/* Legal (fixed height for consistency) */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-center text-muted-foreground mt-0 mb-6"
              style={{ minHeight: "40px" }}
            >
              by signing up, you agree to our{" "}
              <Link href="#" className="underline">
                terms of service
              </Link>
              ,{" "}
              <Link href="#" className="underline">
                privacy policy
              </Link>
              , and acknowledge our{" "}
              <Link href="#" className="underline">
                ai disclaimer
              </Link>
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
