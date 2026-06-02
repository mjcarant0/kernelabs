"use client";

import React from "react";
import FeatureCard from "../../ui/cards/FeatureCard";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function FeaturesSection() {
  const features = [
    { icon: "⚙️", title: "CPU Scheduling", description: "Visualize FCFS, SJF, Round Robin, and Priority scheduling algorithms with interactive Gantt charts.", accent: "cyan" as const },
    { icon: "💾", title: "Memory Management", description: "Explore memory allocation techniques including First Fit, Best Fit, and Worst Fit strategies.", accent: "violet" as const },
    { icon: "🔄", title: "Virtual Memory", description: "Simulate paging, segmentation, and page replacement algorithms with real-time visualizations.", accent: "blue" as const },
    { icon: "💿", title: "Disk Scheduling", description: "Experiment with FCFS, SCAN, and LOOK disk scheduling algorithms for optimal I/O performance.", accent: "emerald" as const },
    { icon: "🔗", title: "Deadlock Simulation", description: "Understand deadlock conditions and explore prevention strategies with visual resource allocation.", accent: "rose" as const },
    { icon: "📈", title: "Real-Time Computation", description: "Get instant performance metrics, calculations, and detailed analysis of algorithm behavior.", accent: "amber" as const },
  ];

  return (
    <section id="features" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#eef4f8] via-[#f0f4f8] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#040f22] dark:to-[#030d1f] section-atmosphere">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-500/20 to-transparent" />

      {/* Glow orbs */}
      <div className="absolute left-1/4 top-1/3 w-72 h-72 rounded-full
        bg-violet-300/10 dark:bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/3 w-60 h-60 rounded-full
        bg-pink-300/8 dark:bg-pink-500/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
              border border-violet-300/50 dark:border-violet-500/25
              bg-violet-50/70 dark:bg-violet-950/40
              font-mono text-xs text-violet-600 dark:text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              KERNEL MODULES · 6 SYSTEMS
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-300 dark:to-pink-300 bg-clip-text text-transparent">
                Core Features
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              <span className="text-violet-500 dark:text-violet-500">&gt;</span> Master OS concepts through interactive simulations
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.08 + 0.1}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                accent={feature.accent}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}