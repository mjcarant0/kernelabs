"use client";

import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden py-10 px-6
      bg-gradient-to-b from-[#e8eef5] to-[#dde6f0]
      dark:from-[#020b18] dark:to-[#010810]
      border-t border-cyan-300/30 dark:border-cyan-500/10 section-atmosphere">

      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px
        bg-gradient-to-r from-transparent via-cyan-400/50 dark:via-cyan-500/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="font-mono font-bold text-base text-cyan-600 dark:text-cyan-400">{'>'}</span>
              <h3 className="font-mono font-black text-base
                bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300
                bg-clip-text text-transparent">
                kernelabs
              </h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs">
              Interactive OS learning platform for students and developers.
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-500">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono font-semibold text-xs text-cyan-600 dark:text-cyan-400 mb-3 tracking-widest uppercase">
              quick_links
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-400 dark:text-slate-500">
              {[
                { label: "Home", href: "/#home" },
                { label: "Topics", href: "/#topics" },
                { label: "Demo", href: "/#demo" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors font-mono">
                    <span className="text-slate-400 dark:text-slate-700 mr-1">./</span>{item.label.toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60 dark:border-white/5 mb-4" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-slate-400 dark:text-slate-600">
            &copy; {currentYear} Kernelabs. All rights reserved.
          </p>
          <div className="flex gap-4 text-[11px] font-mono text-slate-400 dark:text-slate-600">
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}