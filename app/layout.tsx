import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { GlassFilter } from "@/components/ui/liquid-glass";
import { Geist } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://usesubspace.live"
  ),
  title: {
    default: "Subspace",
    template: "%s • Subspace",
  },
  description:
    "AI-powered task manager for focused work. Plan, track, and ship faster.",
  keywords: [
    "task manager",
    "productivity",
    "AI",
    "focus",
    "pomodoro",
    "calendar",
  ],
  openGraph: {
    title: "Subspace",
    description:
      "AI-powered task manager for focused work. Plan, track, and ship faster.",
    url: "/",
    siteName: "Subspace",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/newlog.png?v=2",
        width: 1200,
        height: 630,
        alt: "Subspace - AI-powered task manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Subspace",
    description:
      "AI-powered task manager for focused work. Plan, track, and ship faster.",
    images: ["/newlog.png?v=2"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/subspacelogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-gray-50`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            {/* Provide the SVG filter once at the root for liquid glass effects */}
            <GlassFilter />
            <Toaster />
            <GoogleAnalytics />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
