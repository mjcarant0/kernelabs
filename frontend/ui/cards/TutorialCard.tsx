"use client";

import React from "react";

interface TutorialCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export default function TutorialCard({ number, title, description, icon, className = "" }: TutorialCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl
      border border-slate-200/60 dark:border-white/8
      bg-white/70 dark:bg-[#08142a]/65
      backdrop-blur-xl
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/15
      hover:border-blue-300/60 dark:hover:border-blue-500/25
      neon-border-cyan
      p-6 ${className}`}>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl
        bg-gradient-to-br from-blue-500/0 to-cyan-500/0
        group-hover:from-blue-500/4 dark:group-hover:from-blue-500/8
        group-hover:to-cyan-500/2 dark:group-hover:to-cyan-500/4
        transition-all duration-500" />

      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px
        bg-gradient-to-r from-transparent via-blue-400/40 dark:via-blue-500/30 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Step badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl
          border border-blue-300/50 dark:border-blue-500/25
          bg-blue-50/80 dark:bg-blue-950/50
          flex items-center justify-center
          font-mono font-black text-sm text-blue-600 dark:text-blue-300">
          {number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1 text-lg leading-none">{icon}</div>
          <h3 className="mb-1.5 font-semibold text-sm
            text-slate-800 dark:text-white
            group-hover:text-blue-700 dark:group-hover:text-blue-300
            transition-colors duration-200">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}