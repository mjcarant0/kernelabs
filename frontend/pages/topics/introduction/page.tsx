"use client";

import React from "react";
import {Poppins} from "next/font/google";
import Link from "next/link";
import Navbar from "../../ui/navbar/Navbar";
import Footer from "../../ui/footer/Footer";
import ScrollReveal from "../../ui/animations/ScrollReveal";

const poppins = Poppins({
    subsets: ['latin'],
    weight: ["400", "500", "600", "700"]
});

interface BulletListProps {
    items:string[];
}

interface SubSectionProps {
    number: string;
    title: string;
    description: string;
    bullets: string[];
}

interface SectionProps {
    number: string;
    title: string;
    children: React.ReactNode;
}

function BulletList({ items }: BulletListProps) {
  return (
    <ul className="mt-3 space-y-2 ml-2">
      {items.map((item, i) => {
        if (typeof item === "string") {
          return (
            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0 mt-2" />
              {item}
            </li>
          );
        }
        return (
          <li key={i} className="text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0 mt-2" />
              {item.text}
            </div>
            {item.sub && (
              <ul className="ml-7 mt-1 space-y-1">
                {item.sub.map((s, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0 mt-2" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SubSection({ number, title, description, bullets, children }: SubSectionProps) {
  return (
    <div className="mt-6 pl-4 border-l-2 border-cyan-500/20 dark:border-cyan-500/20">
      <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-1">{number}</p>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
          {description}
        </p>
      )}
      {bullets && <BulletList items={bullets} />}
      {children}
    </div>
  );
}

function Section({ number, title, children }: SectionProps) {
  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800
      bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-8 mb-8
      hover:border-cyan-300/50 dark:hover:border-cyan-500/30 transition-colors duration-300">
      <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full
        bg-white dark:bg-slate-950
        border border-cyan-300/60 dark:border-cyan-500/30
        font-mono text-xs text-cyan-600 dark:text-cyan-400">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

const pages = [

  <>
    <Section number="1.1" title="Introduction">
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        An <em className="text-slate-800 dark:text-slate-200 not-italic font-medium">operating system</em> is
        a program that acts as an{" "}
        <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">intermediary</strong> or
        interface between a user of a computer and the computer hardware. It controls and coordinates
        the use of the hardware among the various application programs for the various users.
      </p>
    </Section>

    <Section number="1.2" title="Computer System Components">
      <SubSection
        number="1.2.1"
        title="Hardware Components"
        description="These provide basic computing resources."
        bullets={["CPU", "Memory", "I/O Devices"]}
      />
      <SubSection
        number="1.2.2"
        title="Operating System Components"
        description="These provide an environment in which a user may execute programs."
        bullets={["Windows", "Linux", "UNIX", "MS-DOS", "MacOS"]}
      />
      <SubSection
        number="1.2.3"
        title="Application Programs"
        description="These define ways in which the system resources are used to solve the computing problems of the users."
        bullets={["Compilers", "Database systems", "Video games", "Business programs"]}
      />
      <SubSection
        number="1.2.4"
        title="Users of Computer System"
        description="These include people, machines, and other computers."
      />
    </Section>