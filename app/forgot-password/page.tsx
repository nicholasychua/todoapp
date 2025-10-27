"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      toast.error("Please enter your email address");
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
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
      setEmailSent(true);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to send password reset email";
      toast.error(errorMessage);
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
          {!emailSent ? (
            <motion.div
              key="reset-form"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="w-full max-w-xs flex flex-col gap-4"
            >
              {/* Heading */}
              <motion.div
                variants={itemVariants}
                className="text-center mb-2"
                style={{ minHeight: "56px" }}
              >
                <h1 className="text-xl font-semibold mb-1">
                  reset your password
                </h1>
                <p className="text-muted-foreground text-base">
                  we'll send you a link to reset it
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
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
                <Button
                  type="submit"
                  className="mt-2 transition-all"
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span>
                      sending...
                    </span>
                  ) : (
                    "send reset link"
                  )}
                </Button>
              </motion.form>

              {/* Links */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-1 text-sm text-muted-foreground mb-0"
                style={{ minHeight: "40px" }}
              >
                <span>
                  remember your password?{" "}
                  <Link href="/signin" className="hover:underline">
                    sign in
                  </Link>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="w-full max-w-xs flex flex-col gap-4"
            >
              {/* Success message */}
              <motion.div variants={itemVariants} className="text-center mb-2">
                <div className="mb-4 text-4xl">✓</div>
                <h1 className="text-xl font-semibold mb-2">check your email</h1>
                <p className="text-muted-foreground text-base mb-4">
                  we've sent a password reset link to
                </p>
                <p className="text-sm font-medium mb-4">{email}</p>
                <p className="text-muted-foreground text-sm mb-4">
                  click the link in the email to reset your password.
                </p>
                <div className="text-left text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
                  <p className="font-medium">didn't receive the email?</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>check your spam/junk folder</li>
                    <li>verify you entered the correct email</li>
                    <li>wait a few minutes for delivery</li>
                  </ul>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="transition-all"
                >
                  send another email
                </Button>
                <Button variant="ghost" asChild className="transition-all">
                  <Link href="/signin">back to sign in</Link>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
