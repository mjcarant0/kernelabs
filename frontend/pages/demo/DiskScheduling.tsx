"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type Algorithm = "FCFS" | "SSTF" | "SCAN" | "CSCAN" | "LOOK" | "CLOOK";
type Direction = "left" | "right";

const algorithmInfo: Record<Algorithm, { label: string; description: string; needsDirection: boolean }> = {
  FCFS: { label: "FCFS (First Come First Serve)", description: "The disk arm services requests in the exact order they arrive in the queue, regardless of their position on the disk.", needsDirection: false },
  SSTF: { label: "SSTF (Shortest Seek Time First)", description: "The disk arm always moves to the request closest to its current position, minimizing seek time for each step.", needsDirection: false },
  SCAN: { label: "SCAN", description: "The disk arm moves in one direction servicing requests until it reaches the end of the disk, then reverses direction.", needsDirection: true },
  CSCAN: { label: "C-SCAN (Circular SCAN)", description: "The disk arm moves in one direction servicing requests until the end of the disk, then jumps back to the beginning and continues in the same direction.", needsDirection: true },
  LOOK: { label: "LOOK", description: "Similar to SCAN, but the arm only goes as far as the last request in each direction instead of going all the way to the end of the disk.", needsDirection: true },
  CLOOK: { label: "C-LOOK (Circular LOOK)", description: "Similar to C-SCAN, but the arm jumps back to the lowest (or highest) pending request instead of the actual end of the disk.", needsDirection: true },
};

function totalMovement(seq: number[]): number {
  let total = 0;
  for (let i = 0; i < seq.length - 1; i++) total += Math.abs(seq[i + 1] - seq[i]);
  return total;
}

function runFCFS(requests: number[], head: number) {
  return [head, ...requests];
}

function runSSTF(requests: number[], head: number) {
  const remaining = [...requests];
  const seq = [head];
  let current = head;
  while (remaining.length > 0) {
    let closestIdx = 0;
    let closestDist = Math.abs(remaining[0] - current);
    for (let i = 1; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - current);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    }
    current = remaining[closestIdx];
    seq.push(current);
    remaining.splice(closestIdx, 1);
  }
  return seq;
}

function runSCAN(requests: number[], head: number, diskSize: number, direction: Direction) {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  if (direction === "left") {
    return [head, ...[...less].reverse(), 0, ...greater];
  } else {
    return [head, ...greater, diskSize - 1, ...[...less].reverse()];
  }
}

function runLOOK(requests: number[], head: number, direction: Direction) {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  if (direction === "left") {
    return [head, ...[...less].reverse(), ...greater];
  } else {
    return [head, ...greater, ...[...less].reverse()];
  }
}

function runCSCAN(requests: number[], head: number, diskSize: number, direction: Direction) {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  if (direction === "left") {
    return [head, ...[...less].reverse(), 0, diskSize - 1, ...[...greater].reverse()];
  } else {
    return [head, ...greater, diskSize - 1, 0, ...less];
  }
}

function runCLOOK(requests: number[], head: number, direction: Direction) {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  if (direction === "left") {
    if (greater.length === 0) return [head, ...[...less].reverse()];
    return [head, ...[...less].reverse(), ...[...greater].reverse()];
  } else {
    if (less.length === 0) return [head, ...greater];
    return [head, ...greater, ...less];
  }
}

function computeSequence(algo: Algorithm, requests: number[], head: number, diskSize: number, direction: Direction): number[] {
  const valid = requests.filter((r) => !isNaN(r) && r >= 0 && r <= diskSize - 1);
  if (valid.length === 0) return [head];
  switch (algo) {
    case "FCFS": return runFCFS(valid, head);
    case "SSTF": return runSSTF(valid, head);
    case "SCAN": return runSCAN(valid, head, diskSize, direction);
    case "CSCAN": return runCSCAN(valid, head, diskSize, direction);
    case "LOOK": return runLOOK(valid, head, direction);
    case "CLOOK": return runCLOOK(valid, head, direction);
  }
}

const POINT_COLOR = "#06b6d4"; // cyan-500
const LINE_COLOR_LIGHT = "#94a3b8"; // slate-400
const LINE_COLOR_DARK = "#64748b";

export default function DiskScheduling() {
  const [selected, setSelected] = useState<Algorithm>("FCFS");
  const [requestStr, setRequestStr] = useState("");
  const [head, setHead] = useState("");
  const [maxCylinder, setMaxCylinder] = useState("");
  const [direction, setDirection] = useState<Direction>("right");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);
  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) { html.classList.remove("dark"); setIsDark(false); }
    else { html.classList.add("dark"); setIsDark(true); }
  }

  const requests = requestStr.trim().split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => !isNaN(n));
  const headNum = Number(head) || 0;
  const diskSizeNum = Math.max(2, (Number(maxCylinder) || 199) + 1);
  const info = algorithmInfo[selected];

  const sequence = computeSequence(selected, requests, headNum, diskSizeNum, direction);
  const total = totalMovement(sequence);
  const hasInput = requests.length > 0 && head !== "" && maxCylinder !== "";

  // ── SVG chart ──
  const chartWidth = 760;
  const chartHeight = sequence.length * 46 + 60;
  const marginX = 40;
  const usableWidth = chartWidth - marginX * 2;

  function xPos(cyl: number) {
    return marginX + (cyl / (diskSizeNum - 1)) * usableWidth;
  }

  // Axis tick marks: requests + head + 0 + max, sorted, deduped
  const tickValues = [...new Set([0, diskSizeNum - 1, headNum, ...requests])].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8] dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link href="/#demo" className="inline-flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />SIMULATOR · LIVE
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">💽</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">Disk Scheduling</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Visualize how different disk scheduling algorithms order seek requests to minimize head movement
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">
        {/* Left panel */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Algorithms</p>
            <div className="flex flex-col gap-1">
              {(Object.keys(algorithmInfo) as Algorithm[]).map((algo) => (
                <button key={algo} onClick={() => setSelected(algo)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${selected === algo ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"}`}>
                  <span className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-0.5">
                    {algo === "FCFS" ? "FCFS" : algo === "SSTF" ? "SSTF" : algo === "SCAN" ? "SCAN" : algo === "CSCAN" ? "C-SCAN" : algo === "LOOK" ? "LOOK" : "C-LOOK"}
                  </span>
                  {algorithmInfo[algo].label.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{info.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{info.description}</p>
          </div>

          {/* Inputs */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Configuration</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Request Queue (cylinder numbers, space or comma separated)
                </label>
                <input value={requestStr} onChange={(e) => setRequestStr(e.target.value)}
                  placeholder="e.g. 98 183 37 122 14 124 65 67"
                  className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-48">
                  <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Initial Head Position</label>
                  <input type="number" min={0} value={head} onChange={(e) => setHead(e.target.value)}
                    placeholder="e.g. 53"
                    className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>
                <div className="md:w-48">
                  <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Max Cylinder Value</label>
                  <input type="number" min={1} value={maxCylinder} onChange={(e) => setMaxCylinder(e.target.value)}
                    placeholder="e.g. 199"
                    className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>
                {info.needsDirection && (
                  <div className="md:w-56">
                    <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Initial Direction</label>
                    <div className="flex gap-2">
                      <button onClick={() => setDirection("left")}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono transition-all ${direction === "left" ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40" : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                        ← Toward 0
                      </button>
                      <button onClick={() => setDirection("right")}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono transition-all ${direction === "right" ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40" : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                        Toward Max →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {hasInput ? (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-4 text-xs font-mono">
                <span className="text-cyan-600 dark:text-cyan-400">Total Head Movement: <span className="font-bold">{total}</span> cylinders</span>
                <span className="text-slate-400">Requests Serviced: {sequence.length - 1}</span>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-mono text-slate-400 dark:text-slate-600">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in the fields above to see results
              </div>
            )}
          </div>

          {/* Seek Sequence */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Seek Sequence</p>
            {hasInput ? (
              <>
                <div className="flex flex-wrap items-center gap-1">
                  {sequence.map((cyl, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${i === 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/30" : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-400/30"}`}>
                        {cyl}
                      </span>
                      {i < sequence.length - 1 && <span className="text-slate-400 text-xs">→</span>}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                  <span className="text-amber-500">●</span> Starting head position &nbsp;&nbsp; <span className="text-cyan-500">●</span> Serviced requests in order
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in the configuration above to generate the sequence
              </div>
            )}
          </div>

          {/* Seek Graph */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Seek Graph</p>
            {hasInput ? (
              <>
                <div className="overflow-x-auto">
                  <svg width={chartWidth} height={chartHeight} className="min-w-[600px]">
                    {/* Top axis line */}
                    <line x1={marginX} y1={20} x2={chartWidth - marginX} y2={20}
                      stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />

                    {/* Tick marks and labels */}
                    {tickValues.map((val, i) => (
                      <g key={i}>
                        <line x1={xPos(val)} y1={15} x2={xPos(val)} y2={25}
                          stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />
                        <text x={xPos(val)} y={12} textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill={isDark ? "#cbd5e1" : "#475569"}>
                          {val}
                        </text>
                      </g>
                    ))}

                    {/* Zigzag path connecting sequence */}
                    {sequence.map((cyl, i) => {
                      if (i === sequence.length - 1) return null;
                      const x1 = xPos(cyl);
                      const y1 = 20 + i * 46 + 10;
                      const x2 = xPos(sequence[i + 1]);
                      const y2 = 20 + (i + 1) * 46 + 10;
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={POINT_COLOR} strokeWidth={2} markerEnd="url(#arrowhead)" />
                      );
                    })}

                    {/* Arrowhead marker */}
                    <defs>
                      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                        <path d="M0,0 L8,4 L0,8 Z" fill={POINT_COLOR} />
                      </marker>
                    </defs>

                    {/* Points + labels */}
                    {sequence.map((cyl, i) => {
                      const x = xPos(cyl);
                      const y = 20 + i * 46 + 10;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r={5} fill={i === 0 ? "#f59e0b" : POINT_COLOR} />
                          <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="monospace"
                            fill={isDark ? "#e2e8f0" : "#1e293b"}>
                            {cyl}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                  Horizontal axis = cylinder position (0 – {diskSizeNum - 1}). Each row down represents the next step in the seek sequence.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center h-20 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in the configuration above to generate the seek graph
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
