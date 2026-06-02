// Topics page
"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "../home/ThemeToggle";
import TopicCard from "../../ui/cards/TopicCard";

interface TopicCardData {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  href: string;
}

export default function TopicsPage() {
  const topics: TopicCardData[] = [
    {
      id: "introduction",
      name: "Introduction to Operating Systems",
      shortDescription: "Foundations of Operating Systems",
      description:
        "Learn the fundamental concepts of Operating Systems. Understand what an OS is, its history, and core functions in modern computing. Perfect for beginners!",
      href: "/topics/introduction",
    },
    {
      id: "structures",
      name: "Operating System Structure",
      shortDescription: "OS Architecture and Components",
      description:
        "Explore how operating systems are organized, from the kernel and system calls to user space services and core subsystems.",
      href: "/topics/structures",
    },
    {
      id: "processes",
      name: "Processes",
      shortDescription: "Lifecycle and Control",
      description:
        "Understand process creation, scheduling states, context switching, and how the OS manages running programs.",
      href: "/topics/processes",
    },
    {
      id: "scheduling",
      name: "CPU Scheduling",
      shortDescription: "CPU Allocation Algorithms",
      description:
        "Compare scheduling strategies such as FCFS, SJF, priority, and round robin to see how the OS shares processor time.",
      href: "/topics/scheduling",
    },
    {
      id: "management",
      name: "Memory Management",
      shortDescription: "Main Memory Allocation",
      description:
        "Learn how operating systems allocate, protect, and share memory using paging, segmentation, and allocation strategies.",
      href: "/topics/management",
    },
    {
      id: "virtual",
      name: "Virtual Memory",
      shortDescription: "Paging and Demand Paging",
      description:
        "Discover how virtual memory extends physical memory with page tables, swapping, and demand paging.",
      href: "/topics/virtual",
    },
    {
      id: "mass",
      name: "Mass Storage Management",
      shortDescription: "Storage Devices and File Systems",
      description:
        "Study disks, SSDs, storage organization, disk scheduling, and the techniques used to manage long-term data storage.",
      href: "/topics/mass",
    },
    {
      id: "deadlock",
      name: "Deadlock",
      shortDescription: "Detection, Prevention, Recovery",
      description:
        "Understand how deadlocks happen, how to prevent them, how to detect them, and the ways an OS can recover safely.",
      href: "/topics/deadlock",
    },
  ];

  const topicEmojis: Record<string, string> = {
    introduction: "📖",
    structures: "🏗️",
    processes: "⚙️",
    scheduling: "🧵",
    management: "🧠",
    virtual: "🪟",
    mass: "💾",
    deadlock: "⛓️",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-(--bg-primary) via-[color-mix(in_srgb,var(--bg-primary)_82%,var(--bg-secondary))] to-(--bg-secondary) text-(--text-primary) section-atmosphere">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--glow-cyan)_22%,transparent)]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--glow-blue)_18%,transparent)]" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-20 backdrop-blur-2xl bg-(--nav-bg) border-b border-(--nav-border)">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-300 mb-1">Kernelabs</p>
              <h1 className="text-2xl font-bold text-(--text-primary)">Topics</h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/"
                className="px-4 py-2 text-sm text-(--text-primary) border border-(--card-border) bg-(--card-bg) rounded-xl hover:border-(--card-border-hover) hover:bg-(--card-bg-hover) transition-all"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>

        <div className="border-b border-(--card-border) bg-linear-to-b from-[color-mix(in_srgb,var(--section-glow-1)_58%,transparent)] to-transparent">
          <div className="max-w-6xl mx-auto px-6 py-16 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 border border-(--card-border) bg-(--card-bg) font-mono text-xs text-cyan-700 dark:text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                FUTURISTIC OS COURSE MAP
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-cyan-600 via-blue-600 to-cyan-500 dark:from-cyan-300 dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
                Learning Topics
              </h1>
              <p className="text-lg text-(--text-secondary) max-w-3xl leading-relaxed">
                Master Operating Systems through a premium, immersive learning flow that feels like a modern system dashboard.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-(--text-muted)">Topics</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-300">{topics.length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-(--text-muted)">Mode</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-300">Dual</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-(--text-muted)">Flow</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-300">Study</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-(--text-primary)">Available Topic</h2>
              <p className="text-sm text-(--text-secondary) mt-1">
                All {topics.length} topics are available for study.
              </p>
            </div>
            <div className="hidden sm:block text-xs font-mono uppercase tracking-[0.25em] text-(--text-muted)">
              Interactive study dashboard
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-6">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                icon={topicEmojis[topic.id]}
                title={topic.name}
                description={`${topic.shortDescription} · 1 module · immersive study flow`}
                href={topic.href}
                className="w-full p-7"
              />
            ))}
          </div>


        </div>

        <div className="border-t border-(--card-border) mt-12 py-8 bg-linear-to-b from-transparent to-[color-mix(in_srgb,var(--bg-secondary)_70%,transparent)]">
          <div className="max-w-6xl mx-auto px-6 text-center text-(--text-muted) text-sm">
            <p>© 2026 Kernelabs. Educational Platform for Operating Systems Learning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
