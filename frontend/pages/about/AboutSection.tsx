"use client";

import React from "react";
import ScrollReveal from "../../ui/animations/ScrollReveal";

export default function AboutSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-(--card-border) bg-(--bg-panel) backdrop-blur-3xl p-10 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.08)] glass-card">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_38%)]" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-(--card-border) bg-white/50 dark:bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-700 dark:text-cyan-300 mb-5">
                  Overview
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5 text-(--text-primary)">What is KerneLabs?</h3>
                <p className="text-(--text-secondary) mb-6 leading-relaxed font-mono text-base md:text-lg max-w-3xl">
                  KerneLabs is an immersive Operating System learning platform that
                  blends interactive simulations, guided exercises, and system-level
                  visualizations. Learners can experiment with scheduling, memory
                  models, and process management in a controlled, realistic UI.
                </p>
                <p className="text-(--text-muted) leading-relaxed font-mono text-sm md:text-base max-w-3xl">
                  The goal is not to overwhelm with raw metrics. It is to create a
                  polished, futuristic environment where the interface itself helps
                  the learner understand how the system behaves.
                </p>
              </div>

              <div className="grid gap-4 self-start">
                {[
                  {
                    label: "Vision",
                    value: "Make systems education cinematic, practical, and memorable.",
                  },
                  {
                    label: "Purpose",
                    value: "Bridge theory and practice with reproducible simulations.",
                  },
                  {
                    label: "Approach",
                    value: "Hands-on labs, curated modules, and visual debuggers.",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-(--card-border) bg-white/55 dark:bg-white/5 p-5 backdrop-blur-xl shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-700 dark:text-cyan-300 mb-3">{item.label}</div>
                    <div className="text-sm md:text-base leading-relaxed text-(--text-primary)">{item.value}</div>
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
