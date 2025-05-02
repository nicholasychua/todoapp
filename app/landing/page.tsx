"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 pt-6 md:pt-8 pb-2 md:pb-4">
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
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row justify-center items-center px-8 pb-24 gap-8 md:gap-16 mt-2 md:mt-6">
        {/* Left: Text */}
        <div className="w-full md:w-1/2 max-w-xl mt-16 md:mt-0 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground mb-2">
            the simplest way<br />to get things done.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-5 mb-8 font-medium">
            Meet tami — your minimal, modern to-do list app. Organize tasks, set priorities, and stay locked in.
          </p>
          <Link href="/signup" passHref legacyBehavior>
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-black text-base font-bold px-6 py-3 rounded-xl shadow-none transition-colors duration-300 flex items-center justify-center min-w-[200px]">
              <span className="font-bold">start planning</span>
              <span className="font-normal text-sm ml-2">— it's free</span>
            </Button>
          </Link>
          <div className="mt-10 text-muted-foreground text-base font-medium opacity-60 tracking-tight" style={{letterSpacing: '-0.01em'}}>
            loved by 100,000+ cool people
          </div>
        </div>
        {/* Right: Product Demo Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center mt-12 md:mt-0">
          <div className="rounded-2xl shadow-lg bg-white/80 border border-gray-100 p-2 md:p-4 max-w-[350px] md:max-w-[400px]">
            <img
              src="/demo-product.png"
              alt="tami product demo"
              className="rounded-xl w-full h-auto object-cover"
              style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.07)' }}
            />
          </div>
        </div>
      </main>
    </div>
  )
} 