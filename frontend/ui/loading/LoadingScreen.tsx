"use client";

import React from "react";

interface LoadingScreenProps {
  fadeOut: boolean;
}

export default function LoadingScreen({ fadeOut }: LoadingScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-slate-50 dark:bg-[#020b18]
        transition-all duration-500 ease-in-out
        ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-1 mb-10 animate-fade-in">
        <span className="font-mono font-bold text-2xl text-cyan-600 dark:text-cyan-400">{'>'}</span>
        <h1
          className="font-mono font-black text-2xl
            bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600
            dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400
            bg-clip-text text-transparent"
        >
          kernelabs
        </h1>
      </div>

      {/* Thin progress line */}
      <div className="w-40 h-[2px] bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600
          dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400 rounded-full animate-load-bar" />
      </div>
    </div>
  );
}
