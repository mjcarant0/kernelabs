"use client";

import React from "react";
import { useTheme } from "next-themes";

interface ThemeToggleSwitchProps {
  isDark?: boolean;
  onToggle?: () => void;
  small?: boolean;
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function ThemeToggleSwitch({ isDark: controlledDark, onToggle, small }: ThemeToggleSwitchProps) {
  const { setTheme, resolvedTheme } = useTheme();

  const isDark = controlledDark !== undefined ? controlledDark : resolvedTheme === "dark";
  const handleToggle = onToggle || (() => setTheme(isDark ? "light" : "dark"));

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative inline-flex items-center rounded-full
        transition-all duration-500 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        ${small ? "h-6 w-11" : "h-7 w-[52px]"}
        ${isDark
          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-slate-700 shadow-[0_0_12px_rgba(99,102,241,0.25),inset_0_1px_2px_rgba(255,255,255,0.06)]"
          : "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 shadow-[0_0_12px_rgba(251,191,36,0.25),inset_0_1px_2px_rgba(255,255,255,0.3)]"
        }
        backdrop-blur-sm
      `}
      suppressHydrationWarning
    >
      <span
        className={`
          pointer-events-none relative z-10 inline-flex items-center justify-center
          rounded-full bg-white/95 dark:bg-white/95
          shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]
          transition-all duration-500 ease-out
          ${small ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]"}
          ${small
            ? isDark ? "translate-x-[23px]" : "translate-x-[3px]"
            : isDark ? "translate-x-[26px]" : "translate-x-[3px]"
          }
        `}
      >
        <span
          className={`
            transition-all duration-500 ease-out
            ${small ? "h-2.5 w-2.5" : "h-3 w-3"}
            ${isDark
              ? "text-indigo-600 opacity-100"
              : "text-amber-500 opacity-100"
            }
          `}
        >
          {isDark ? <MoonIcon className="h-full w-full" /> : <SunIcon className="h-full w-full" />}
        </span>
      </span>

      <span
        className={`
          pointer-events-none absolute inset-0 rounded-full
          transition-opacity duration-500
          ${isDark
            ? "opacity-100 bg-gradient-to-r from-indigo-400/20 via-purple-400/10 to-transparent blur-sm"
            : "opacity-100 bg-gradient-to-r from-amber-400/20 via-orange-400/10 to-transparent blur-sm"
          }
        `}
        aria-hidden
      />
    </button>
  );
}
