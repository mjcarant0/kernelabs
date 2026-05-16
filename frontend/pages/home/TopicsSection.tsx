"use client";

import React from "react";
import TopicCard from "../../ui/cards/TopicCard";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function TopicsSection() {
  const topics = [
    { icon: "📖", title: "Introduction", description: "Fundamentals of operating systems and kernel concepts." },
    { icon: "⚡", title: "Processes", description: "Process creation, states, and lifecycle management." },
    { icon: "🔀", title: "CPU Scheduling", description: "Scheduling algorithms and performance evaluation." },
    { icon: "🧠", title: "Memory Management", description: "Main memory allocation and management techniques." },
    { icon: "📚", title: "Virtual Memory", description: "Paging, segmentation, and demand paging strategies." },
    { icon: "⛓️", title: "Deadlocks", description: "Deadlock detection, prevention, and recovery mechanisms." },
  ];

  return (
    <section id="topics" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#e8eef5] via-[#edf2f8] to-[#e8eef5]
      dark:from-[#020b18] dark:via-[#030d1f] dark:to-[#020b18] section-atmosphere">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 dark:via-purple-500/20 to-transparent" />

      {/* Glow orb */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full
        bg-purple-300/10 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
              border border-cyan-300/50 dark:border-cyan-500/25
              bg-cyan-50/70 dark:bg-cyan-950/40
              font-mono text-xs text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              CURRICULUM · 6 MODULES
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-300 dark:to-purple-300 bg-clip-text text-transparent">
                Explore Topics
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              <span className="text-cyan-500 dark:text-cyan-500">&gt;</span> A comprehensive curriculum covering major OS concepts
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <ScrollReveal key={index} delay={index * 0.08 + 0.1}>
              <TopicCard
                icon={topic.icon}
                title={topic.title}
                description={topic.description}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}