"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getClientAuth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetComplete, setResetComplete] = useState(false);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        toast.error("Invalid password reset link");
        setVerifying(false);
        return;
      }

      const auth = getClientAuth();
      if (!auth) {
        toast.error("Authentication not available");
        setVerifying(false);
        return;
      }

      try {
        // Verify the password reset code is valid
        const email = await verifyPasswordResetCode(auth, oobCode);
        setUserEmail(email);
        setValidCode(true);
      } catch (error: any) {
        console.error("Error verifying reset code:", error);
        let errorMsg = "Invalid or expired reset link";

        if (error.code === "auth/expired-action-code") {
          errorMsg = "This reset link has expired. Please request a new one.";
        } else if (error.code === "auth/invalid-action-code") {
          errorMsg = "This reset link is invalid or has already been used.";
        }

        toast.error(errorMsg);
        setValidCode(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset code");
      return;
    }

    setLoading(true);

    try {
      const auth = getClientAuth();
      if (!auth) {
        throw new Error("Authentication not available");
      }

      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password reset successfully!");
      setResetComplete(true);

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMsg = "Failed to reset password";

      if (error.code === "auth/weak-password") {
        errorMsg = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/expired-action-code") {
        errorMsg = "This reset link has expired. Please request a new one.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMsg = "This reset link is invalid or has already been used.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6">
      {/* Logo at top left */}
      <div className="absolute top-10 left-8">
        <Link href="/landing" className="focus:outline-none">
          <span className="text-3xl font-bold tracking-tight hover:underline transition-colors">
            subspace
          </span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {verifying ? (
            <motion.div
              key="verifying"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="w-full max-w-xs flex flex-col gap-4 text-center"
            >
              <motion.div variants={itemVariants}>
                <div className="animate-spin text-4xl mb-4">⟳</div>
                <p className="text-muted-foreground">Verifying reset link...</p>
              </motion.div>
            </motion.div>
          ) : !validCode ? (
            <motion.div
              key="invalid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="w-full max-w-xs flex flex-col gap-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-2">
                <div className="mb-4 text-4xl">✕</div>
                <h1 className="text-xl font-semibold mb-2">
                  Invalid Reset Link
                </h1>
                <p className="text-muted-foreground text-base mb-4">
                  This password reset link is invalid or has expired.
                </p>
                <div className="text-left text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1 mb-4">
                  <p className="font-medium">didn't receive the email?</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>check your spam/junk folder</li>
                    <li>verify you entered the correct email</li>
                    <li>wait a few minutes for delivery</li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2"
              >
                <Button variant="outline" asChild>
                  <Link href="/forgot-password">Request New Reset Link</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Back to Sign In</Link>
                </Button>
              </motion.div>
            </motion.div>
          ) : resetComplete ? (
            <motion.div
              key="success"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="w-full max-w-xs flex flex-col gap-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-2">
                <div className="mb-4 text-4xl">✓</div>
                <h1 className="text-xl font-semibold mb-2">Password Reset!</h1>
                <p className="text-muted-foreground text-base">
                  Your password has been successfully reset.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Redirecting to sign in...
                </p>
              </motion.div>
            </motion.div>
          ) : (
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
                  create new password
                </h1>
                <p className="text-muted-foreground text-sm">for {userEmail}</p>
              </motion.div>

              {/* Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor="password">new password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="transition-opacity"
                    minLength={6}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="confirmPassword">confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      resetting password...
                    </span>
                  ) : (
                    "reset password"
                  )}
                </Button>
              </motion.form>

              {/* Link */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-1 text-sm text-muted-foreground"
              >
                <Link href="/signin" className="hover:underline">
                  back to sign in
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
