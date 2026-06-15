"use client";

import React from "react";
import Link from "next/link";
import ScrollReveal from "../../ui/animations/ScrollReveal";

interface Glow {
  border: string;
  text: string;
  badge: string;
  shadowRgb: string;
}

const glows: Glow[] = [
  { border: "border-cyan-200/70 hover:border-cyan-400 dark:border-cyan-500/20 dark:hover:border-cyan-400/50", text: "text-cyan-600 dark:text-cyan-400", badge: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", shadowRgb: "6,182,212" },
  { border: "border-emerald-200/70 hover:border-emerald-400 dark:border-emerald-500/20 dark:hover:border-emerald-400/50", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", shadowRgb: "16,185,129" },
  { border: "border-violet-200/70 hover:border-violet-400 dark:border-violet-500/20 dark:hover:border-violet-400/50", text: "text-violet-600 dark:text-violet-400", badge: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", shadowRgb: "139,92,246" },
  { border: "border-amber-200/70 hover:border-amber-400 dark:border-amber-500/20 dark:hover:border-amber-400/50", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400", shadowRgb: "245,158,11" },
  { border: "border-rose-200/70 hover:border-rose-400 dark:border-rose-500/20 dark:hover:border-rose-400/50", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400", shadowRgb: "244,63,94" },
];

export default function DemoSection() {
  const demos = [
    {
      icon: "⚙️",
      title: "CPU Scheduling",
      description: "Compare FCFS, SJF, Round Robin, and Priority algorithms side-by-side with real-time Gantt chart visualizations and detailed performance metrics for each scheduling strategy.",
      href: "/demo/cpu-scheduling",
    },
    {
      icon: "💾",
      title: "Memory Management",
      description: "Simulate First Fit, Best Fit, and Worst Fit allocation strategies with dynamic memory block visualization, fragmentation analysis, and compaction techniques.",
      href: "/demo/memory-management",
    },
    {
      icon: "🔄",
      title: "Virtual Memory",
      description: "Explore paging, segmentation, and page replacement algorithms including LRU, FIFO, and Optimal with live fault-rate tracking and TLB simulation.",
      href: "/demo/virtual-memory",
    },
    {
      icon: "💽",
      title: "Disk Scheduling",
      description: "Visualize how FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK algorithms minimize seek time with animated disk arm movement and performance comparison charts.",
      href: "/demo/disk-scheduling",
    },
    {
      icon: "⛓️",
      title: "Deadlock",
      description: "Detect and resolve deadlocks using the Banker's Algorithm, resource allocation graphs, and real-time prevention strategies with interactive scenario modeling.",
      href: "/demo/deadlock",
    },
  ];

  return (
    <section id="demo" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f] section-atmosphere">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-blue-500/20 to-transparent" />

      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full
        bg-cyan-300/10 dark:bg-cyan-500/12 blur-3xl pointer-events-none" />
      <div className="absolute -left-40 bottom-0 w-80 h-80 rounded-full
        bg-purple-300/8 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
              border border-cyan-300/50 dark:border-cyan-500/25
              bg-cyan-50/70 dark:bg-cyan-950/40
              font-mono text-xs text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              SIMULATORS · LIVE ENVIRONMENT
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
                Try a Demo
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              <span className="text-cyan-500 dark:text-cyan-500">&gt;</span> Experience interactive OS simulations in action
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {demos.map((demo, i) => {
            const g = glows[i];
            return (
              <ScrollReveal key={demo.title} delay={i * 0.1 + 0.1}>
                <Link
                  href={demo.href}
                  className={`group relative block rounded-2xl border ${g.border} bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] shadow-sm overflow-hidden`}
                  style={{
                    boxShadow: `0 0 0 0 rgba(${g.shadowRgb},0)`,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains("dark");
                    e.currentTarget.style.boxShadow = isDark
                      ? `0 0 24px rgba(${g.shadowRgb},0.25), 0 0 60px rgba(${g.shadowRgb},0.10)`
                      : `0 0 20px rgba(${g.shadowRgb},0.15), 0 0 40px rgba(${g.shadowRgb},0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 rgba(${g.shadowRgb},0)`;
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/[0.03] dark:from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />

                  <div
                    className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
                    style={{ background: `radial-gradient(circle, rgba(${g.shadowRgb},0.15), transparent)` }}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-3 text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 inline-block w-fit">
                      {demo.icon}
                    </div>
                    <h3 className="font-semibold text-base text-slate-800 dark:text-white mb-1.5 transition-colors duration-300">
                      {demo.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3 flex-1">
                      {demo.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono ${g.badge}`}>
                        <span className={`w-1 h-1 rounded-full ${g.text} animate-pulse`} />
                        Interactive
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-mono font-medium ${g.text} opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300`}>
                        Launch
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
