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