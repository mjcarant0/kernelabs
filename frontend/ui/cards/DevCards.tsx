import React from "react";
import Image from "next/image";

type DevCardProps = {
  image?: string;
  name: string;
  role: string;
  intro: string;
  accent: "cyan" | "blue" | "violet" | "emerald";
  github?: string;
  linkedin?: string;
  facebook?: string;
};

const accentMap = {
  cyan: {
    ring: "from-cyan-400/50 to-blue-400/20",
    roleColor: "text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.7)]",
    topLine: "via-cyan-400/50 dark:via-cyan-500/30",
    hoverShadow: "group-hover:shadow-[0_12px_40px_rgba(0,212,255,0.12)] dark:group-hover:shadow-[0_12px_40px_rgba(0,212,255,0.18)]",
    hoverBorder: "group-hover:border-cyan-300/50 dark:group-hover:border-cyan-500/30",
    iconHover: "hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10",
  },
  blue: {
    ring: "from-blue-400/50 to-cyan-400/20",
    roleColor: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.7)]",
    topLine: "via-blue-400/50 dark:via-blue-500/30",
    hoverShadow: "group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.12)] dark:group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.18)]",
    hoverBorder: "group-hover:border-blue-300/50 dark:group-hover:border-blue-500/30",
    iconHover: "hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10",
  },
  violet: {
    ring: "from-violet-400/50 to-purple-400/20",
    roleColor: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.7)]",
    topLine: "via-violet-400/50 dark:via-violet-500/30",
    hoverShadow: "group-hover:shadow-[0_12px_40px_rgba(139,92,246,0.12)] dark:group-hover:shadow-[0_12px_40px_rgba(139,92,246,0.18)]",
    hoverBorder: "group-hover:border-violet-300/50 dark:group-hover:border-violet-500/30",
    iconHover: "hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10",
  },
  emerald: {
    ring: "from-emerald-400/50 to-teal-400/20",
    roleColor: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]",
    topLine: "via-emerald-400/50 dark:via-emerald-500/30",
    hoverShadow: "group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] dark:group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.18)]",
    hoverBorder: "group-hover:border-emerald-300/50 dark:group-hover:border-emerald-500/30",
    iconHover: "hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
  },
} as const;

export default function DevCard({
  image,
  name,
  role,
  intro,
  accent,
  github = "#",
  linkedin = "#",
  facebook = "#",
}: DevCardProps) {
  const a = accentMap[accent];
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl
      border border-slate-200/60 dark:border-white/8
      bg-white/75 dark:bg-[#07111f]/80
      backdrop-blur-xl
      shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
      transition-all duration-300
      hover:-translate-y-1.5
      ${a.hoverShadow}
      ${a.hoverBorder}`}
    >
      
      <div className={`absolute top-0 left-0 right-0 h-px
        bg-gradient-to-r from-transparent ${a.topLine} to-transparent`} />

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full
        opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-white/20 dark:bg-white/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-7 gap-4 flex-1">

        {/* Avatar */}
        <div className="relative">
          {/* Glow ring */}
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${a.ring} blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />

          <div className="relative w-20 h-20 rounded-full overflow-hidden
            border border-white/60 dark:border-white/10
            bg-slate-100 dark:bg-slate-800
            flex items-center justify-center">
            {image && !image.includes("placeholder") ? (
              <Image
                src={image}
                alt={name}
                width={80}
                height={80}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="font-mono font-bold text-xl text-slate-400 dark:text-slate-500">
                {initials}
              </span>
            )}
          </div>

          <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full
            border-2 border-white dark:border-[#07111f] ${a.dot}`} />
        </div>

        {/* Name + role */}
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
            {name}
          </h3>
          <p className={`mt-1 font-mono text-xs ${a.roleColor}`}>
            {role}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/8 to-transparent" />

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
          {intro}
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {/* GitHub */}
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={`p-2.5 rounded-xl
              border border-slate-200/80 dark:border-white/8
              bg-white/60 dark:bg-white/4
              text-slate-500 dark:text-slate-400
              transition-all duration-200 hover:scale-110
              ${a.iconHover}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.9 3.17 9.06 7.58 10.53.55.1.75-.24.75-.53v-1.86c-3.08.67-3.73-1.49-3.73-1.49-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.55 1.18 3.17.9.1-.7.38-1.18.7-1.45-2.46-.28-5.05-1.23-5.05-5.47 0-1.21.43-2.2 1.13-2.98-.12-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13.88-.24 1.82-.36 2.76-.36.94 0 1.88.12 2.76.36 2.1-1.44 3.02-1.13 3.02-1.13.6 1.52.23 2.64.11 2.92.7.78 1.13 1.77 1.13 2.98 0 4.25-2.59 5.19-5.06 5.47.39.33.73.98.73 1.98v2.94c0 .29.2.64.76.53C19.08 20.81 22.25 16.65 22.25 11.75 22.25 5.48 17.27.5 12 .5z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={`p-2.5 rounded-xl
              border border-slate-200/80 dark:border-white/8
              bg-white/60 dark:bg-white/4
              text-slate-500 dark:text-slate-400
              transition-all duration-200 hover:scale-110
              ${a.iconHover}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 1.98 1.98 1.98h.02C6.08 7.46 7 6.58 7 5.48 7 4.38 6.12 3.5 4.98 3.5zM3.5 8.98H6.5V20H3.5zM9.5 8.98h2.86v1.48h.04c.4-.76 1.37-1.56 2.82-1.56 3.02 0 3.58 1.98 3.58 4.56V20h-3V14.5c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92V20h-3z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className={`p-2.5 rounded-xl
              border border-slate-200/80 dark:border-white/8
              bg-white/60 dark:bg-white/4
              text-slate-500 dark:text-slate-400
              transition-all duration-200 hover:scale-110
              ${a.iconHover}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.62.77-1.62 1.56v1.88h2.77l-.44 2.89h-2.33V21.9C18.34 21.13 22 17 22 12z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}