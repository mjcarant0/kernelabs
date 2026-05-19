"use client";

import React from "react";
import DevCard from "../../ui/cards/DevCards";
import ScrollReveal from "../../ui/animations/ScrollReveal";

const devs = [
  {
    name: "Marjoy M. Caranto",
    role: "Full Stack Developer",
    intro: "Architected and built the core platform — bridging frontend and backend to power the full Kernelabs simulation engine.",
    accent: "cyan" as const,
    image: "https://via.placeholder.com/160",
    github: "https://github.com/mjcarant0",
    linkedin: "https://www.linkedin.com/in/marjoycaranto/",
    facebook: "https://www.facebook.com/marjoycarantoaccount/",
  },
  {
    name: "Julian Wyne G. Cartalla",
    role: "Frontend Developer",
    intro: "Designed and built the interactive Demo section — creating the CPU scheduling and memory management simulation interfaces.",
    accent: "blue" as const,
    image: "https://via.placeholder.com/160",
    github: "https://github.com/wynepew",
    linkedin: "#",
    facebook: "https://www.facebook.com/wyne.cartalla",
  },
  {
    name: "John Reydo A. Tinawin",
    role: "Frontend Developer",
    intro: "Built the Modules section — crafting the structured learning interface where students explore OS concepts and theory.",
    accent: "violet" as const,
    image: "https://via.placeholder.com/160",
    github: "https://github.com/jrtinawin16",
    linkedin: "https://www.linkedin.com/in/john-reydo-tinawin-97b26617b/",
    facebook: "https://www.facebook.com/johnreydo.tinawin",
  },
  {
    name: "Xyrene Jade R. Torralba",
    role: "Backend Developer",
    intro: "Engineered the backend infrastructure — developing the server logic and data pipelines that power Kernelabs simulations.",
    accent: "emerald" as const,
    image: "https://via.placeholder.com/160",
    github: "https://github.com/xytorralba",
    linkedin: "https://www.linkedin.com/in/xyrene-jade-torralba-a8a98940a/",
    facebook: "https://www.facebook.com/xytorralba",
  },
];

export default function DevSection() {
  return (
    <section id="about" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#eef4f8] via-[#f0f4f8] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#040f22] dark:to-[#030d1f]">

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full
        bg-cyan-300/8 dark:bg-cyan-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full
        bg-violet-300/6 dark:bg-violet-500/8 blur-3xl pointer-events-none" />

      {/* Section separators */}
      <div className="absolute top-0 left-0 right-0 h-px
        bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px
        bg-gradient-to-r from-transparent via-slate-300/40 dark:via-white/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Heading */}
        <ScrollReveal delay={0}>
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5
              border border-cyan-300/50 dark:border-cyan-500/25
              bg-cyan-50/70 dark:bg-cyan-950/40
              font-mono text-xs text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              TEAM · 4 MEMBERS
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
                Meet the Developers
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-mono">
              <span className="text-cyan-500 dark:text-cyan-500">&gt;</span> A focused team building Kernelabs — crafted for systems learners
            </p>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {devs.map((dev, index) => (
            <ScrollReveal key={dev.name} delay={index * 0.1 + 0.1}>
              <DevCard
                image={dev.image}
                name={dev.name}
                role={dev.role}
                intro={dev.intro}
                accent={dev.accent}
                github={dev.github}
                linkedin={dev.linkedin}
                facebook={dev.facebook}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}