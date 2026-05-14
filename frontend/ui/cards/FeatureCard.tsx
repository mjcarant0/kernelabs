"use client";

import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "cyan" | "violet" | "blue" | "emerald" | "rose" | "amber";
  className?: string;
}

const accentMap = {
  cyan:    { border: "hover:border-cyan-300/60 dark:hover:border-cyan-500/30",    glow: "hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/15",    iconBg: "bg-cyan-50/80 dark:bg-cyan-950/50",     iconText: "text-cyan-600 dark:text-cyan-400",    titleHover: "group-hover:text-cyan-700 dark:group-hover:text-cyan-300",    line: "via-cyan-400/50 dark:via-cyan-500/30",    orb: "bg-cyan-400/10 dark:bg-cyan-500/20" },
  violet:  { border: "hover:border-violet-300/60 dark:hover:border-violet-500/30", glow: "hover:shadow-violet-500/10 dark:hover:shadow-violet-500/15", iconBg: "bg-violet-50/80 dark:bg-violet-950/50", iconText: "text-violet-600 dark:text-violet-400", titleHover: "group-hover:text-violet-700 dark:group-hover:text-violet-300", line: "via-violet-400/50 dark:via-violet-500/30", orb: "bg-violet-400/10 dark:bg-violet-500/20" },
  blue:    { border: "hover:border-blue-300/60 dark:hover:border-blue-500/30",    glow: "hover:shadow-blue-500/10 dark:hover:shadow-blue-500/15",    iconBg: "bg-blue-50/80 dark:bg-blue-950/50",     iconText: "text-blue-600 dark:text-blue-400",    titleHover: "group-hover:text-blue-700 dark:group-hover:text-blue-300",    line: "via-blue-400/50 dark:via-blue-500/30",    orb: "bg-blue-400/10 dark:bg-blue-500/20" },
  emerald: { border: "hover:border-emerald-300/60 dark:hover:border-emerald-500/30", glow: "hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/15", iconBg: "bg-emerald-50/80 dark:bg-emerald-950/50", iconText: "text-emerald-600 dark:text-emerald-400", titleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-300", line: "via-emerald-400/50 dark:via-emerald-500/30", orb: "bg-emerald-400/10 dark:bg-emerald-500/20" },
  rose:    { border: "hover:border-rose-300/60 dark:hover:border-rose-500/30",    glow: "hover:shadow-rose-500/10 dark:hover:shadow-rose-500/15",    iconBg: "bg-rose-50/80 dark:bg-rose-950/50",     iconText: "text-rose-600 dark:text-rose-400",    titleHover: "group-hover:text-rose-700 dark:group-hover:text-rose-300",    line: "via-rose-400/50 dark:via-rose-500/30",    orb: "bg-rose-400/10 dark:bg-rose-500/20" },
  amber:   { border: "hover:border-amber-300/60 dark:hover:border-amber-500/30",  glow: "hover:shadow-amber-500/10 dark:hover:shadow-amber-500/15",  iconBg: "bg-amber-50/80 dark:bg-amber-950/50",   iconText: "text-amber-600 dark:text-amber-400",  titleHover: "group-hover:text-amber-700 dark:group-hover:text-amber-300",  line: "via-amber-400/50 dark:via-amber-500/30",  orb: "bg-amber-400/10 dark:bg-amber-500/20" },
};

export default function FeatureCard({ icon, title, description, accent = "cyan", className = "" }: FeatureCardProps) {
  const a = accentMap[accent];

  return (
    <div className={`group relative overflow-hidden rounded-2xl
      border border-slate-200/60 dark:border-white/8
      bg-white/70 dark:bg-[#08142a]/65
      backdrop-blur-xl
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-lg ${a.glow}
      ${a.border}
      neon-border-cyan
      ${className}`}>

      {/* Top accent line */}
      <div className={`absolute top-0 left-4 right-4 h-px
        bg-gradient-to-r from-transparent ${a.line} to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Corner glow */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${a.orb} blur-xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10 p-6">
        <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl
          ${a.iconBg} ${a.iconText} text-xl
          transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <h3 className={`mb-2 text-sm font-semibold text-slate-800 dark:text-white
          transition-colors duration-200 ${a.titleHover}`}>
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}