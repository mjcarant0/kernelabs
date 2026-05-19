/* Container for quiz display with cleaner, educational styling */

import React, { ReactNode } from "react";

interface QuizSectionProps {
  children: ReactNode;
  title?: string;
}

export default function QuizSection({ children, title = "Knowledge Assessment" }: QuizSectionProps) {
  return (
    <div className="relative space-y-8">
      {title && (
        <div className="pb-8 border-b border-slate-200 dark:border-white/5">
          <h2 className="text-4xl md:text-5xl font-bold text-(--text-primary) mb-3">
            {title}
          </h2>
          <p className="text-(--text-secondary) text-lg max-w-3xl leading-relaxed">
            Test your understanding with 10 questions. You need 70% to pass.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-black/20 backdrop-blur-sm border border-slate-200 dark:border-white/5 p-8">
        {children}
      </div>
    </div>
  );
}
