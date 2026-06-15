"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import TopicCard from "../../ui/cards/TopicCard";
import ScrollReveal from "../../ui/animations/ScrollReveal";
import Link from "next/link";

export default function TopicsSection() {
  const topics = [
    { icon: "📖", title: "Introduction", description: "Fundamentals of operating systems and kernel concepts." },
    { icon: "🏗️", title: "Operating System Structure", description: "Components and architecture of an operating system." },
    { icon: "⚡", title: "Processes", description: "Process creation, states, and lifecycle management." },
    { icon: "🔀", title: "CPU Scheduling", description: "Scheduling algorithms and performance evaluation." },
  ];

  const topicRoutes: Record<string, string> = {
    "Introduction": "/topics/introduction",
    "Operating System Structure": "/topics/structures",
    "Processes": "/topics/processes",
    "CPU Scheduling": "/topics/scheduling",
  };

  const slides = topics;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [slideWidth, setSlideWidth] = useState(0);
  const [gap] = useState(20);
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const extended = React.useMemo(() => {
    const before = slides.slice(-visibleCount);
    const after = slides.slice(0, visibleCount);
    return [...before, ...slides, ...after];
  }, [slides, visibleCount]);

  const measure = useCallback(() => {
    const w = window.innerWidth;
    const vc = w < 640 ? 1 : w < 1024 ? 2 : 3;
    setVisibleCount(vc);

    // compute available width from layout constraints instead of reading
    // viewport's clientWidth (which gets stuck at old size after resize)
    const sectionPadding = 48; // px-6 = 24px per side
    const maxContainerWidth = 1152; // max-w-6xl
    const availableWidth = Math.min(w - sectionPadding, maxContainerWidth);

    const totalGaps = gap * (vc - 1);
    const computedSlide = Math.floor((availableWidth - totalGaps) / vc);
    setSlideWidth(computedSlide);

    setIndex(vc);
  }, [gap]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // snap to real slides after clone transitions
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function onEnd() {
      const track = trackRef.current;
      if (!track) return;
      setIsTransitioning(false);
      const realStart = visibleCount;
      const realEnd = visibleCount + slides.length - 1;
      if (slideWidth === 0) return;

      if (index > realEnd) {
        const newIndex = index - slides.length;
        track.style.transition = "none";
        const x = -(newIndex * (slideWidth + gap));
        track.style.transform = `translateX(${x}px)`;
        void track.offsetHeight;
        setIndex(newIndex);
        requestAnimationFrame(() => {
          track.style.transition = "transform 600ms ease";
        });
      } else if (index < realStart) {
        const newIndex = index + slides.length;
        track.style.transition = "none";
        const x = -(newIndex * (slideWidth + gap));
        track.style.transform = `translateX(${x}px)`;
        void track.offsetHeight;
        setIndex(newIndex);
        requestAnimationFrame(() => {
          track.style.transition = "transform 600ms ease";
        });
      }
    }

    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [index, slides.length, visibleCount, slideWidth, gap]);

  // auto-play
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setIndex((i) => i + 1);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  function advance() {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((i) => i - 1);
  }

  return (
    <section id="topics" className="relative overflow-hidden py-24 px-6
      bg-gradient-to-b from-[#e8eef5] via-[#edf2f8] to-[#e8eef5]
      dark:from-[#020b18] dark:via-[#030d1f] dark:to-[#020b18] section-atmosphere">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-cyan-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 dark:via-purple-500/20 to-transparent" />

      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full
        bg-purple-300/10 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScrollReveal delay={0}>
          <div className="mb-12 sm:mb-16 text-center">
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

        <ScrollReveal delay={0.1}>
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative flex justify-center items-center">
              <div
                ref={viewportRef}
                className="overflow-x-hidden overflow-y-visible"
                style={{ width: slideWidth ? `${slideWidth * visibleCount + gap * (visibleCount - 1)}px` : undefined, maxWidth: '100%' }}
              >
                <div
                  ref={trackRef}
                  className="flex items-stretch transition-transform duration-[600ms] ease-in-out"
                  style={{
                    gap: `${gap}px`,
                    transform: slideWidth ? `translateX(-${index * (slideWidth + gap)}px)` : undefined,
                  }}
                >
                  {extended.map((topic, i) => (
                    <div
                      key={i}
                      className="slide shrink-0"
                      style={{
                        flex: slideWidth ? `0 0 ${slideWidth}px` : undefined,
                      }}
                    >
                      <TopicCard
                        icon={topic.icon}
                        title={topic.title}
                        description={topic.description}
                        href={topicRoutes[topic.title]}
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* dot indicators */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const targetIdx = visibleCount + i;
                      if (targetIdx === index) return;
                      setIsTransitioning(true);
                      setIndex(targetIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      (index - visibleCount + slides.length) % slides.length === i
                        ? "w-6 bg-gradient-to-r from-cyan-500 to-blue-500"
                        : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* subtle arrows on hover */}
              <button
                onClick={goBack}
                aria-label="Previous"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3
                  opacity-0 group-hover:opacity-100 hover:opacity-100
                  transition-opacity duration-300
                  w-10 h-10 flex items-center justify-center rounded-full
                  bg-white/70 dark:bg-slate-900/70 backdrop-blur
                  border border-slate-200 dark:border-white/10
                  text-slate-600 dark:text-slate-300
                  hover:bg-white dark:hover:bg-slate-800
                  shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={advance}
                aria-label="Next"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3
                  opacity-0 group-hover:opacity-100 hover:opacity-100
                  transition-opacity duration-300
                  w-10 h-10 flex items-center justify-center rounded-full
                  bg-white/70 dark:bg-slate-900/70 backdrop-blur
                  border border-slate-200 dark:border-white/10
                  text-slate-600 dark:text-slate-300
                  hover:bg-white dark:hover:bg-slate-800
                  shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div className="mt-16 sm:mt-12 flex justify-center">
            <Link href="/topics">
              <button className="relative group px-8 py-3 text-base font-semibold
                bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400
                text-white dark:text-slate-900
                rounded-lg
                transition-all duration-300
                hover:shadow-lg hover:shadow-cyan-500/50 dark:hover:shadow-cyan-500/40
                hover:-translate-y-0.5
                active:translate-y-0">
                <div className="absolute inset-0 rounded-lg
                  bg-gradient-to-r from-cyan-400/0 to-blue-400/0
                  group-hover:from-cyan-400/20 group-hover:to-blue-400/20
                  transition-all duration-300 blur-lg" />
                <span className="relative flex items-center gap-2">
                  See All Topics
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}