"use client";

import React from "react";
import Link from "next/link";

interface TopicCardProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export default function TopicCard({ icon, title, description, href = "#", className = "" }: TopicCardProps) {
  const content = (
    <div className={`group relative cursor-pointer overflow-hidden rounded-2xl
      border border-slate-200/60 dark:border-white/8
      bg-white/70 dark:bg-[#08142a]/65
      backdrop-blur-xl
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-lg hover:shadow-violet-500/10 dark:hover:shadow-violet-500/15
      hover:border-violet-300/60 dark:hover:border-violet-500/30
      neon-border-cyan
      p-5 sm:p-6 ${className}`}> 

      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-2xl
        bg-linear-to-br from-violet-500/0 to-purple-500/0
        group-hover:from-violet-500/4 dark:group-hover:from-violet-500/10
        group-hover:to-purple-500/2 dark:group-hover:to-purple-500/5
        transition-all duration-500" />

      {/* Top accent */}
      <div className="absolute top-0 left-4 right-4 h-px
        bg-linear-to-r from-transparent via-violet-400/50 dark:via-violet-500/30 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glow orb */}
      <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full
        bg-violet-400/10 dark:bg-violet-500/20 blur-xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Arrow */}
      <div className="absolute top-4 right-4
        opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
        transition-all duration-300">
        <svg className="w-4 h-4 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="relative z-10 pr-6">
        <div className="mb-3 text-3xl sm:text-2xl transition-transform duration-300 group-hover:scale-110 inline-block">{icon}</div>
        <h3 className="mb-1.5 font-semibold text-sm sm:text-base
          text-slate-800 dark:text-white
          group-hover:text-violet-700 dark:group-hover:text-violet-300
          transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  if (href === "#") {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}