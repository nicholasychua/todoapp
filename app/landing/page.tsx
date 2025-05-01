"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 pt-12">
        <span className="text-3xl font-bold tracking-tight select-none">calmi</span>
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
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 pb-24">
        <div className="max-w-2xl mt-24">
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight text-foreground mb-2">
            it's not therapy.<br />it's just calmi.
          </h1>
          <p className="text-xl text-muted-foreground mt-6 mb-10 font-medium">
            your wise, witty AI built to help you explore your thoughts, emotions, and behaviors.
          </p>
          <Link href="/signup" passHref legacyBehavior>
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-black text-lg font-semibold px-8 py-4 rounded-xl shadow-none transition-colors duration-300">
              start yapping — <span className="font-normal ml-1">it's free</span>
            </Button>
          </Link>
          <div className="mt-8 text-muted-foreground text-base font-medium">
            loved by 100,000+ cool people
          </div>
        </div>
      </main>
    </div>
  )
} 