"use client";

import React from "react";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function HeroSection() {
  return (
    <section className="section-atmosphere relative overflow-hidden pt-24 pb-20 bg-linear-to-b from-(--bg-secondary) via-(--bg-primary) to-(--bg-secondary) text-(--text-primary)">

      <div className="absolute left-[-18%] top-6 h-96 w-96 rounded-full bg-(--orb-cyan) blur-3xl transform -rotate-12" />
      <div className="absolute right-[-14%] top-24 h-80 w-80 rounded-full bg-(--orb-purple) blur-2xl" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent dark:via-black/10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6 border border-(--card-border) bg-(--bg-panel) backdrop-blur-md text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              SYSTEM INTERFACE · KERNELABS
            </div>

            <h1 className="mb-6 font-extrabold tracking-tight text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-(--text-secondary) to-(--text-primary)">About</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 text-glow-cyan">KerneLabs</span>
            </h1>

            <p className="mx-auto max-w-3xl text-(--text-secondary) font-mono leading-relaxed text-lg md:text-xl">
              KerneLabs is a premium OS learning environment. We design immersive
              simulations and interactive lessons that make kernel concepts tangible
              and approachable for learners and practitioners.
            </p>

            <div className="mx-auto mt-12 max-w-4xl rounded-3xl overflow-hidden border border-(--card-border) bg-(--bg-panel) backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="h-px bg-linear-to-r from-transparent via-cyan-500/60 to-transparent" />
              <div className="grid gap-0 md:grid-cols-3">
                {[
                  { label: "Platform", value: "OS Learning Lab" },
                  { label: "Mode", value: "Interactive Simulation" },
                  { label: "Experience", value: "Immersive & Practical" },
                ].map((item) => (
                  <div key={item.label} className="px-6 py-5 md:px-8 text-left border-t border-[rgba(255,255,255,0.06)] md:border-t-0 md:border-l first:border-l-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400 mb-2">{item.label}</div>
                    <div className="text-base font-semibold text-(--text-primary)">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
