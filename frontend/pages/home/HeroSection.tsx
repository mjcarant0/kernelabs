"use client";

import React, { useState, useEffect } from "react";
import CTAButton from "../../ui/buttons/CTAButton";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function HeroSection() {
  const [cpuValue, setCpuValue] = useState(34);
  const [memoryValue, setMemoryValue] = useState(52);
  const [processesValue, setProcessesValue] = useState(67);
  const [playBoot, setPlayBoot] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuValue(prev => Math.max(20, Math.min(80, prev + (Math.random() * 8 - 4))));
      setMemoryValue(prev => Math.max(30, Math.min(85, prev + (Math.random() * 6 - 3))));
      setProcessesValue(prev => Math.max(45, Math.min(90, prev + (Math.random() * 7 - 3.5))));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // play boot animation once
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem("kernelabs_booted");
      if (!seen) {
        setPlayBoot(true);
        localStorage.setItem("kernelabs_booted", "1");
      }
    } catch {
    }
  }, []);

  const stats = [
    {
      label: "CPU",
      pct: Math.round(cpuValue),
      color: "from-cyan-500 to-blue-500",
      dot: "bg-cyan-500 dark:bg-cyan-400",
      text: "text-cyan-600 dark:text-cyan-400",
      w: `${cpuValue}%`,
      unit: "% usage",
    },
    {
      label: "Memory",
      pct: Math.round(memoryValue),
      color: "from-violet-500 to-purple-500",
      dot: "bg-violet-500 dark:bg-violet-400",
      text: "text-violet-600 dark:text-violet-400",
      w: `${memoryValue}%`,
      unit: "% usage",
    },
    {
      label: "Processes",
      pct: Math.round(processesValue),
      color: "from-emerald-500 to-teal-500",
      dot: "bg-emerald-500 dark:bg-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      w: `${processesValue}%`,
      unit: " active",
    },
  ];

  return (
    <section className={`relative min-h-screen overflow-hidden pt-16
      bg-gradient-to-b from-[#e8f4f8] via-[#f0f4f8] to-[#e8eef5]
      dark:from-[#020b18] dark:via-[#030d1f] dark:to-[#020b18] hero-boot${playBoot ? " boot-run" : ""}`}>

      {/* grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 boot-grid os-grid opacity-100" />
        {/* Fade grid at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f0f4f8]/80 dark:to-[#020b18]/80" />
      </div>

      {/* glow orbs */}
      <div className="absolute -left-48 top-16 h-[500px] w-[500px] rounded-full
        bg-cyan-300/20 dark:bg-cyan-500/20 blur-[100px] animate-pulse boot-orb-1 pointer-events-none"
        style={{ animationDuration: "5s" }} />
      <div className="absolute -right-48 top-40 h-[400px] w-[400px] rounded-full
        bg-violet-300/15 dark:bg-violet-500/15 blur-[100px] animate-pulse boot-orb-2 pointer-events-none"
        style={{ animationDuration: "7s", animationDelay: "1s" }} />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[300px] w-[700px] rounded-full
        bg-blue-300/10 dark:bg-blue-500/12 blur-[80px] boot-orb-3 pointer-events-none" />

      {/* Corner HUD decorations */}
      <div className="absolute top-20 left-6 pointer-events-none boot-hud">
        <div className="w-8 h-8 border-l-2 border-t-2 border-cyan-400/30 dark:border-cyan-400/60 opacity-80" />
      </div>
      <div className="absolute top-20 right-6 pointer-events-none boot-hud">
        <div className="w-8 h-8 border-r-2 border-t-2 border-cyan-400/30 dark:border-cyan-400/60 opacity-80" />
      </div>
      {/* Bottom corners (hero only) */}
      <div className="absolute bottom-8 left-6 pointer-events-none boot-hud">
        <div className="w-6 h-6 border-l-2 border-b-2 border-cyan-400/30 dark:border-cyan-400/60 opacity-80" />
      </div>
      <div className="absolute bottom-8 right-6 pointer-events-none boot-hud">
        <div className="w-6 h-6 border-r-2 border-b-2 border-cyan-400/30 dark:border-cyan-400/60 opacity-80" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="text-center">

          {/* Status badge */}
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8
              border border-cyan-300/50 dark:border-cyan-500/30
              bg-white/60 dark:bg-cyan-950/40
              backdrop-blur-md
              text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold
              shadow-sm dark:shadow-[0_0_20px_rgba(0,212,255,0.08)]">
              {/* status badge anim */}
              <div className="boot-badge" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 dark:bg-cyan-400" />
              </span>
              SYSTEM ONLINE · KERNELABS v1.0.0
            </div>
          </ScrollReveal>

          {/* Main title */}
          <ScrollReveal delay={0.1}>
            <h1 className="mb-6 font-black tracking-tighter leading-none boot-title">
              <span
                className="inline text-5xl md:text-7xl lg:text-8xl
                bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800
                dark:from-white dark:via-slate-200 dark:to-slate-400
                bg-clip-text text-transparent"
              >
                KERNE
              </span>

              <span
                className="inline text-5xl md:text-7xl lg:text-8xl
                bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600
                dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400
                bg-clip-text text-transparent text-glow-cyan"
              >
                LABS
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={0.2}>
            <p className="mb-10 text-base md:text-xl boot-subtitle
              text-slate-600 dark:text-slate-400
              max-w-2xl mx-auto leading-relaxed font-mono">
              <span className="text-cyan-600 dark:text-cyan-400">&gt;</span>{" "}
              Simulate CPU scheduling, memory management, and advanced kernel
              concepts with real-time interactive visualizations.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.3}>
            <div className="mb-20 flex flex-col sm:flex-row justify-center gap-4 boot-cta">
              <CTAButton label="Get Started" href="#features" variant="primary" />
              <CTAButton label="Try Demo" href="#demo" variant="secondary" />
            </div>
          </ScrollReveal>

          {/* OS Dashboard Panel */}
          <ScrollReveal delay={0.4}>
            <div className="relative mx-auto max-w-3xl boot-panel">
              {/* Outer glow */}
              <div className="absolute -inset-1 rounded-2xl
                bg-gradient-to-r from-cyan-400/20 via-blue-400/15 to-violet-400/20
                dark:from-cyan-500/30 dark:via-blue-500/20 dark:to-violet-500/30
                blur-lg" />

              {/* Panel */}
              <div className="relative rounded-2xl overflow-hidden
                border border-cyan-300/40 dark:border-cyan-500/20
                bg-white/80 dark:bg-[#020d1a]/90
                backdrop-blur-2xl
                shadow-2xl shadow-cyan-500/10 dark:shadow-[0_20px_80px_rgba(0,212,255,0.12)]">

                {/* Terminal title bar */}
                <div className="flex items-center gap-3 px-5 py-3
                  border-b border-slate-200/60 dark:border-cyan-500/10
                  bg-slate-50/80 dark:bg-[#010810]/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80 dark:bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80 dark:bg-green-500/70" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-mono text-xs text-slate-500 dark:text-cyan-500/70">
                      kernelabs@system:~$ monitor --live
                    </span>
                    <span className="w-1.5 h-3.5 bg-cyan-600 dark:bg-cyan-400 animate-blink rounded-sm" />
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">LIVE</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="p-6 md:p-8 grid grid-cols-3 gap-6 md:gap-8 text-left">
                  {stats.map(({ label, pct, color, dot, text, w, unit }) => (
                    <div key={label}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />
                        <span className="font-mono text-slate-500 dark:text-slate-500 text-xs uppercase tracking-widest">
                          {label}
                        </span>
                      </div>
                      {/* Track */}
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
                          style={{ width: w }}
                        />
                      </div>
                      <div className={`mt-2 font-mono font-bold text-sm ${text}`}>
                        {pct}{unit}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom status bar */}
                <div className="px-6 md:px-8 pb-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs
                  border-t border-slate-100/80 dark:border-white/5 pt-4">
                  {[
                    { k: "SCHEDULER", v: "Round Robin", c: "text-cyan-600 dark:text-cyan-400" },
                    { k: "ALGORITHM", v: "FCFS active", c: "text-violet-600 dark:text-violet-400" },
                    { k: "UPTIME", v: "14d 6h 22m", c: "text-blue-600 dark:text-blue-400" },
                    { k: "STATUS", v: "● Running", c: "text-emerald-600 dark:text-emerald-400" },
                  ].map(({ k, v, c }) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-600">{k}</span>
                      <span className={`font-semibold ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce boot-scroll">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xs text-slate-400 dark:text-slate-600">SCROLL</span>
          <svg className="h-5 w-5 text-cyan-500 dark:text-cyan-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
