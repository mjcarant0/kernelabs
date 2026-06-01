// Module section: expandable lessons and progress

"use client";

import React, { useState, useMemo } from "react";

export interface ModuleSectionItem {
  id: string;
  title: string;
  content: string;
}

interface ModuleSectionProps {
  title: string;
  content: string;
  moduleNumber: number;
  totalModules: number;
  sections?: ModuleSectionItem[];
  onNext?: () => void;
  onPrevious?: () => void;
  isLastModule?: boolean;
  onQuizStart?: () => void;
}

// Identify main topics (X.Y format)
const isMainTopic = (id: string): boolean => {
  const parts = id.split("-").filter((p) => /^\d+$/.test(p));
  return parts.length === 2;
};

// Get main topic id (e.g., "1-2-1" -> "1-2")
const getMainTopicId = (id: string): string => {
  const parts = id.split("-").filter((p) => /^\d+$/.test(p));
  return parts.slice(0, 2).join("-");
};

export default function ModuleSection({
  title,
  content,
  moduleNumber,
  totalModules,
  sections = [],
  onNext,
  onPrevious,
  isLastModule = false,
  onQuizStart,
}: ModuleSectionProps) {
  // content sections
  const contentSections = useMemo(
    () => sections.filter((s) => s.content.trim().length > 0),
    [sections]
  );

  // main topics
  const mainTopics = useMemo(
    () => contentSections.filter((s) => isMainTopic(s.id)),
    [contentSections]
  );

  // completed topics state
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  // active lesson id
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // progress percentage
  const progressPercentage = useMemo(() => {
    const totalMainTopics = mainTopics.length || 1;
    return Math.round((completedTopics.size / totalMainTopics) * 100);
  }, [completedTopics]);

  const handleLessonClick = (sectionId: string) => {
    // mark previous lesson completed
    if (activeLessonId && activeLessonId !== sectionId) {
      const mainTopicId = getMainTopicId(activeLessonId);
      setCompletedTopics((prev) => {
        const updated = new Set(prev);
        updated.add(mainTopicId);
        return updated;
      });
    }

    // toggle lesson
    setActiveLessonId(activeLessonId === sectionId ? null : sectionId);

    // smooth scroll to lesson
    setTimeout(() => {
      const element = document.getElementById(`lesson-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const isLessonActive = (sectionId: string) => activeLessonId === sectionId;

  const isMainTopicCompleted = (sectionId: string) => {
    const mainTopicId = getMainTopicId(sectionId);
    return completedTopics.has(mainTopicId);
  };

  return (
    <div className="relative">
      {/* layout grid */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* sidebar */}
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-2xl bg-white dark:bg-black/20 backdrop-blur-sm border border-slate-200 dark:border-white/5 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-400 mb-6">
              Module Guide
            </h3>

            <nav className="space-y-2">
              {contentSections.map((section) => {
                const isMain = isMainTopic(section.id);
                const isActive = isLessonActive(section.id);
                const isCompleted = isMainTopicCompleted(section.id);

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleLessonClick(section.id)}
                    className={`w-full text-left rounded-lg px-4 py-3 transition-all duration-200 relative group ${
                      isActive
                        ? "bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-400/50 text-slate-900 dark:text-(--text-primary) shadow-lg shadow-cyan-500/10"
                        : isCompleted
                          ? "border border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 text-slate-900 dark:text-(--text-primary)"
                          : "border border-slate-200 dark:border-transparent text-slate-700 dark:text-(--text-secondary) hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-tight truncate">{section.title}</p>
                      {isMain && isCompleted && (
                        <span className="text-xs text-emerald-400 font-bold shrink-0">✓</span>
                      )}
                      {isActive && !isCompleted && (
                        <span className="text-xs text-cyan-400 font-bold shrink-0">◉</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* progress info */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-(--text-muted) mb-3">
                Progress
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-(--text-secondary)">Topics completed</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {completedTopics.size} / {mainTopics.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-(--text-muted)">
                  {progressPercentage}% complete
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* lessons accordion */}
        <main className="space-y-3">
          {contentSections.map((section, index) => {
            const isActive = isLessonActive(section.id);
            const isMain = isMainTopic(section.id);
            const isCompleted = isMainTopicCompleted(section.id);

            return (
              <div
                key={section.id}
                id={`lesson-${section.id}`}
                className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10"
              >
                {/* lesson header */}
                <button
                  onClick={() => handleLessonClick(section.id)}
                  className={`w-full px-6 py-5 flex items-center justify-between gap-4 transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-50 dark:bg-cyan-500/15 border-b border-cyan-200 dark:border-cyan-400/20"
                      : "hover:bg-slate-50 dark:hover:bg-black/30"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Lesson Number */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-100 dark:bg-cyan-500/30 border border-cyan-300 dark:border-cyan-400/40 text-cyan-600 dark:text-cyan-400"
                          : isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/5 text-slate-600 dark:text-(--text-muted)"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Lesson Title */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-lg font-semibold transition-colors duration-200 ${
                          isActive
                            ? "text-cyan-400"
                            : isCompleted
                              ? "text-emerald-400"
                              : "text-(--text-primary)"
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div
                    className={`flex shrink-0 text-cyan-400 transition-transform duration-300 ${
                      isActive ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </button>

                {/* lesson content */}
                {isActive && (
                  <div className="overflow-hidden border-t border-slate-200 dark:border-white/5">
                    <div className="px-6 py-8 space-y-6 animate-in fade-in duration-300">
                      {/* reading */}
                      <div className="max-w-3xl">
                        <div className="whitespace-pre-wrap font-sans text-lg leading-8 text-(--text-secondary)">
                          {section.content}
                        </div>
                      </div>

                      {/* actions */}
                      {isMain && (
                        <div className="flex items-center gap-3 pt-4">
                          <button
                            onClick={() => {
                              const mainTopicId = getMainTopicId(section.id);
                              setCompletedTopics((prev) => {
                                const updated = new Set(prev);
                                if (updated.has(mainTopicId)) {
                                  updated.delete(mainTopicId);
                                } else {
                                  updated.add(mainTopicId);
                                }
                                return updated;
                              });
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                              isCompleted
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-400/40 hover:bg-emerald-200 dark:hover:bg-emerald-500/30"
                                : "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-400/30 hover:bg-cyan-200 dark:hover:bg-cyan-500/25"
                            }`}
                          >
                            {isCompleted ? "✓ Mark as Done" : "Mark as Done"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* quiz call-to-action */}
          {onQuizStart && (
            <div className="mt-8 rounded-2xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-400/20 p-8 text-center">
              <h3 className="text-xl font-semibold text-(--text-primary) mb-3">
                Ready to Test Your Knowledge?
              </h3>
              <p className="text-(--text-secondary) mb-6">
                Complete the quiz to assess your understanding of this module.
              </p>
              <button
                onClick={onQuizStart}
                className="px-8 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
              >
                Start Quiz
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
