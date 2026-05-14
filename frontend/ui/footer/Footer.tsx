"use client";

import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden py-14 px-6
      bg-gradient-to-b from-[#e8eef5] to-[#dde6f0]
      dark:from-[#020b18] dark:to-[#010810]
      border-t border-cyan-300/30 dark:border-cyan-500/10">

      {/* Grid overlay */}
      <div className="absolute inset-0 os-grid opacity-40 pointer-events-none" />

      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px
        bg-gradient-to-r from-transparent via-cyan-400/50 dark:via-cyan-500/30 to-transparent" />

      {/* Corner HUD */}
      <div className="absolute bottom-8 left-6 hidden dark:block pointer-events-none">
        <div className="w-6 h-6 border-l border-b border-cyan-500/20" />
      </div>
      <div className="absolute bottom-8 right-6 hidden dark:block pointer-events-none">
        <div className="w-6 h-6 border-r border-b border-cyan-500/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="font-mono font-bold text-lg text-cyan-600 dark:text-cyan-400">&gt;</span>
              <h3 className="font-mono font-black text-lg
                bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300
                bg-clip-text text-transparent">
                kernelabs
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
              Interactive OS learning platform for students and developers.
            </p>
            {/* Status dot */}
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-500">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono font-semibold text-xs text-cyan-600 dark:text-cyan-400 mb-4 tracking-widest uppercase">
              &gt; quick_links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-500">
              {["Home", "Modules", "Demo", "About"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors font-mono">
                    <span className="text-slate-400 dark:text-slate-700 mr-1">./</span>{item.toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono font-semibold text-xs text-blue-600 dark:text-blue-400 mb-4 tracking-widest uppercase">
              &gt; resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-500">
              {["Documentation", "Tutorials", "FAQ", "Support"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-mono">
                    <span className="text-slate-400 dark:text-slate-700 mr-1">./</span>{item.toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono font-semibold text-xs text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase">
              &gt; connect
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-500">
              {["GitHub", "Twitter", "Discord", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors font-mono">
                    <span className="text-slate-400 dark:text-slate-700 mr-1">./</span>{item.toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 dark:border-white/5 my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-400 dark:text-slate-600">
            © {currentYear} Kernelabs. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-xs text-slate-400 dark:text-slate-600 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-mono text-xs text-slate-400 dark:text-slate-600 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}