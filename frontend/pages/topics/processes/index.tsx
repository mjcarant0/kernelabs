/* Processes Topic - Main Page */

"use client";

import React, { useState } from "react";
import ModuleSection from "../shared/ModuleSection";
import QuizSection from "../shared/QuizSection";
import QuizContent from "../shared/QuizContent";
import ThemeToggle from "../../home/ThemeToggle";
import { processesConfig } from "./topicMeta";
import { quizQuestions } from "./quiz/quizData";
import { module3Sections } from "./modules/Module3";

type PageSection = "modules" | "quiz";

export default function ProcessesTopic() {
  const [currentSection, setCurrentSection] = useState<PageSection>("modules");

  const handleStartQuiz = () => {
    setCurrentSection("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-(--bg-primary) via-[color-mix(in_srgb,var(--bg-primary)_80%,var(--bg-secondary))] to-(--bg-secondary) text-(--text-primary) section-atmosphere">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--glow-cyan)_18%,transparent)]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--glow-blue)_16%,transparent)]" />
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-20 backdrop-blur-2xl bg-(--nav-bg) border-b border-(--nav-border)">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-300 mb-1">
                Kernelabs / Processes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="/topics"
                className="px-4 py-2 text-sm text-(--text-primary) border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 rounded-lg hover:bg-white/10 dark:hover:bg-white/20 transition-all"
              >
                Back to Topics
              </a>
            </div>
          </div>
        </div>

        <div className="border-b border-(--card-border) bg-linear-to-b from-[color-mix(in_srgb,var(--section-glow-1)_35%,transparent)] to-transparent">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border border-(--card-border) bg-(--card-bg) font-mono text-xs text-cyan-700 dark:text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                FOCUSED STUDY MODE
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-(--text-primary) leading-tight">
                {processesConfig.name}
              </h1>
              <p className="text-lg text-(--text-secondary) max-w-3xl leading-relaxed">
                {processesConfig.description}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {currentSection === "modules" ? (
            <ModuleSection
              title={processesConfig.name}
              content=""
              sections={module3Sections}
              moduleNumber={3}
              totalModules={1}
              isLastModule
              onQuizStart={handleStartQuiz}
            />
          ) : (
            <QuizSection>
              <QuizContent
                questions={quizQuestions}
                onComplete={() => {
                  // Quiz completion is handled within QuizContent
                }}
              />
            </QuizSection>
          )}
        </div>

        <div className="border-t border-white/10 dark:border-white/5 mt-16 py-12 bg-linear-to-b from-transparent to-white/5 dark:to-black/20">
          <div className="max-w-6xl mx-auto px-6 text-center text-(--text-muted) text-sm">
            <p>© 2026 Kernelabs. A premium educational platform for operating systems learning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
