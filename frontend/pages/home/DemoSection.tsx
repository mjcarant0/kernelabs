"use client";

import React from "react";
import TopicCard from "../../ui/cards/TopicCard";
import CTAButton from "../../ui/buttons/CTAButton";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function DemoSection() {
  const demos = [
    {
      icon: "⚙️",
      title: "CPU Scheduling",
      description: "Visualize how the CPU scheduler manages processes with FCFS, SJF, Round Robin, and Priority algorithms.",
      href: "#",
    },
    {
      icon: "💾",
      title: "Memory Management",
      description: "Explore memory allocation strategies including First Fit, Best Fit, and Worst Fit in real-time.",
      href: "#",
    },
    {
      icon: "🔄",
      title: "Virtual Memory",
      description: "Simulate paging, segmentation, and page replacement algorithms with live visualizations.",
      href: "#",
    },
    {
      icon: "⛓️",
      title: "Deadlock",
      description: "Understand deadlock conditions and explore detection, prevention, and recovery strategies.",
      href: "#",
    },
  ];

  return (
    <section id="demo" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f] section-atmosphere">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-blue-500/20 to-transparent" />

      {/* Glow orbs */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full
        bg-cyan-300/10 dark:bg-cyan-500/12 blur-3xl pointer-events-none" />
      <div className="absolute -left-40 bottom-0 w-80 h-80 rounded-full
        bg-purple-300/8 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Heading */}
        <ScrollReveal delay={0}>
          <div className="mb-16 text-center">
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

        {/* Demo cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {demos.map((demo, index) => (
            <ScrollReveal key={demo.title} delay={index * 0.1 + 0.1}>
              <div className="group relative cursor-pointer overflow-hidden rounded-2xl
                border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50
                backdrop-blur-xl
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-lg hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/15
                hover:border-cyan-300/60 dark:hover:border-cyan-500/30
                p-6">

                <div className="absolute inset-0 rounded-2xl
                  bg-gradient-to-br from-cyan-500/0 to-blue-500/0
                  group-hover:from-cyan-500/5 dark:group-hover:from-cyan-500/10
                  group-hover:to-blue-500/3 dark:group-hover:to-blue-500/5
                  transition-all duration-500" />

                <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full
                  bg-cyan-400/10 dark:bg-cyan-500/20 blur-xl
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-4 right-4
                  opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                  transition-all duration-300">
                  <svg className="w-4 h-4 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="mb-3 text-2xl transition-transform duration-300 group-hover:scale-110 inline-block">
                    {demo.icon}
                  </div>
                  <h3 className="mb-1.5 font-semibold text-slate-900 dark:text-white text-sm
                    group-hover:text-cyan-700 dark:group-hover:text-cyan-300
                    transition-colors duration-200">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                    {demo.description}
                  </p>
                  <CTAButton label="Launch Simulator" href={demo.href} variant="secondary" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}