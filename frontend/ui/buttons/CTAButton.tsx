"use client";

import React from "react";

interface CTAButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function CTAButton({ label, onClick, href, variant = "primary", className = "" }: CTAButtonProps) {
  const primary =
    "inline-flex items-center justify-center px-6 py-3 rounded-xl font-mono font-semibold text-sm text-white " +
    "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 " +
    "hover:from-cyan-400 hover:via-blue-400 hover:to-violet-500 " +
    "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 " +
    "border border-cyan-400/30 " +
    "transition-all duration-300 hover:-translate-y-0.5";

  const secondary =
    "inline-flex items-center justify-center px-6 py-3 rounded-xl font-mono font-semibold text-sm " +
    "text-cyan-700 dark:text-cyan-300 " +
    "border-2 border-cyan-400/50 dark:border-cyan-500/40 " +
    "bg-white/70 dark:bg-cyan-950/30 " +
    "hover:bg-cyan-50 dark:hover:bg-cyan-950/60 " +
    "hover:border-cyan-500 dark:hover:border-cyan-400/60 " +
    "hover:shadow-md hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/15 " +
    "backdrop-blur transition-all duration-300 hover:-translate-y-0.5";

  const style = variant === "primary" ? primary : secondary;

  if (href) return <a href={href} className={`${style} ${className}`}>{label}</a>;
  return <button onClick={onClick} className={`${style} ${className}`}>{label}</button>;
}