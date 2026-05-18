"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Topics", href: "/#topics" },
    { label: "Demo", href: "/#demo" },
    { label: "About", href: "/about" },
  ];

  if (!mounted) {
    return <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-transparent" />;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-white/80 dark:bg-[#020b18]/85 backdrop-blur-2xl border-b border-cyan-300/30 dark:border-cyan-500/15 shadow-sm dark:shadow-[0_1px_40px_rgba(0,212,255,0.07)]"
        : "bg-transparent"
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-md
              border border-cyan-400/40 dark:border-cyan-400/30
              bg-cyan-50/80 dark:bg-cyan-950/50
              backdrop-blur-sm">
              <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-300">&gt;</span>
              <span className="font-mono font-black text-sm tracking-tight text-slate-800 dark:text-white">kerne</span>
              <span className="font-mono font-black text-sm tracking-tight text-cyan-600 dark:text-cyan-300">labs</span>
              <span className="w-0.5 h-3.5 bg-cyan-500 dark:bg-cyan-400 animate-blink ml-0.5" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 font-mono text-sm
                  text-slate-600 dark:text-slate-400
                  hover:text-cyan-700 dark:hover:text-cyan-300
                  hover:bg-cyan-50/60 dark:hover:bg-cyan-950/40
                  rounded-lg transition-all duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px w-0
                  bg-linear-to-r from-cyan-500 to-blue-500
                  group-hover:w-4 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl
                border border-slate-200 dark:border-white/10
                bg-white/80 dark:bg-white/5
                hover:bg-cyan-50 dark:hover:bg-cyan-950/50
                hover:border-cyan-300 dark:hover:border-cyan-500/30
                transition-all duration-200"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM17 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zm3 6v1a1 1 0 11-2 0v-1a1 1 0 112 0zm7.536-.464a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM6.343 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 5a5 5 0 110 10A5 5 0 0110 5z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Get Started */}
            <Link href="/#features"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl
                font-mono font-semibold text-sm text-white
                bg-linear-to-r from-cyan-500 to-blue-600
                hover:from-cyan-400 hover:to-blue-500
                shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                transition-all duration-300 hover:-translate-y-0.5">
              Get Started
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl
                border border-slate-200 dark:border-white/10
                bg-white/80 dark:bg-white/5
                text-slate-600 dark:text-slate-400
                transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="mt-3 pb-3 border-t border-slate-200 dark:border-cyan-500/10 pt-3 md:hidden flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 font-mono text-sm
                  text-slate-700 dark:text-slate-300
                  hover:text-cyan-600 dark:hover:text-cyan-400
                  hover:bg-cyan-50/60 dark:hover:bg-cyan-950/40
                  rounded-lg transition-all">
                <span className="text-cyan-500 dark:text-cyan-500 mr-1">&gt;</span> {link.label}
              </Link>
            ))}
            <Link href="/#features"
              className="mt-2 mx-4 py-2.5 text-center font-mono text-sm font-semibold
                bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}