import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
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
    images: [
      {
        url: "/demo-product.png",
        width: 1200,
        height: 630,
        alt: "Subspace task manager",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subspace",
    description:
      "AI-powered task manager for focused work. Plan, track, and ship faster.",
    images: ["/demo-product.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/circle1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
