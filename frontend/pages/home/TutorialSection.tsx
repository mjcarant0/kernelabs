"use client";

import React from "react";
import TutorialCard from "../../ui/cards/TutorialCard";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function TutorialSection() {
  const steps = [
    { number: 1, title: "Read Modules", description: "Start by exploring comprehensive OS concepts with detailed tutorials and visualizations.", icon: "📚" },
    { number: 2, title: "Open Demo", description: "Choose an interactive demo for CPU scheduling, memory management, or other topics.", icon: "🎮" },
    { number: 3, title: "Input Values", description: "Enter parameters specific to your simulation like process count, memory size, or time quantum.", icon: "⚙️" },
    { number: 4, title: "Generate Results", description: "Run the simulation and get instant Gantt charts, timing diagrams, and detailed computations.", icon: "⚡" },
    { number: 5, title: "Analyze Output", description: "Study the generated results with real-time visualizations and performance metrics.", icon: "📊" },
    { number: 6, title: "Master Concepts", description: "Experiment with different values and deepen your understanding of OS algorithms.", icon: "🧠" },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#e8eef5] via-[#eef4f8] to-[#e8eef5]
      dark:from-[#020b18] dark:via-[#030d1f] dark:to-[#020b18] section-atmosphere">
      {/* Section separator top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />

      {/* Glow orb */}
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full
        bg-blue-300/10 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="mb-16 text-center">
            {/* Section label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
              border border-blue-300/50 dark:border-blue-500/25
              bg-blue-50/70 dark:bg-blue-950/40
              font-mono text-xs text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
              PROCESS · 6 STEPS
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              <span className="text-cyan-500 dark:text-cyan-500">&gt;</span> A 6-step process to learn and master Operating System concepts
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 0.08 + 0.1}>
              <TutorialCard
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}