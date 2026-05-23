"use client";

import Link from "next/link";

export default function Deadlock() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">

      {/* Top bar with back button */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3">
        <Link
          href="/#demo"
          className="inline-flex items-center gap-2 text-sm font-mono
            text-slate-500 dark:text-slate-400
            hover:text-cyan-600 dark:hover:text-cyan-400
            transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Demos
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 text-6xl">⛓️</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
            border border-cyan-300/50 dark:border-cyan-500/25
            bg-cyan-50/70 dark:bg-cyan-950/40
            font-mono text-xs text-cyan-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
            SIMULATOR · LIVE ENVIRONMENT
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
              Deadlock
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Understand deadlock conditions and explore detection, prevention, and recovery strategies.
          </p>
        </div>

        {/* ================================================= */}
        {/* ADD YOUR DEADLOCK SIMULATOR COMPONENT BELOW HERE  */}
        {/* ================================================= */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
          bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-10
          flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-4xl mb-4">⛓️</div>
            <p className="font-mono text-slate-400 dark:text-slate-500 text-sm">
              <span className="text-cyan-500">&gt;</span> Deadlock simulator coming soon...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
              Replace this block with your actual simulator component
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
