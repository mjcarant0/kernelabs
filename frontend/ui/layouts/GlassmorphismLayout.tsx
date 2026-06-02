"use client";

import React from "react";

interface GlassmorphismLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassmorphismLayout({
  children,
  className = "",
}: GlassmorphismLayoutProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-linear-to-br from-white/5 to-white/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
