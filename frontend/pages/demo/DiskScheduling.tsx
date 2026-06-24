"use client";

import ExportButton from "@/backend/save_and_export/ExportButton";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggleSwitch from "../../ui/buttons/ThemeToggleSwitch";

type Algorithm = "FCFS" | "SSTF" | "SCAN" | "CSCAN" | "LOOK" | "CLOOK";
type Direction = "left" | "right";
type SeekStep = { value: number | "?"; broken?: boolean; unknownGap?: boolean };

const algorithmInfo: Record<Algorithm, { label: string; description: string; needsDirection: boolean }> = {
  FCFS: { label: "FCFS (First Come First Serve)", description: "The disk arm services requests in the exact order they arrive in the queue, regardless of their position on the disk.", needsDirection: false },
  SSTF: { label: "SSTF (Shortest Seek Time First)", description: "The disk arm always moves to the request closest to its current position, minimizing seek time for each step.", needsDirection: false },
  SCAN: { label: "SCAN", description: "The disk arm moves in one direction servicing requests until it reaches the end of the disk, then reverses direction.", needsDirection: true },
  CSCAN: { label: "C-SCAN (Circular SCAN)", description: "The disk arm moves in one direction servicing requests until the end of the disk, then jumps back to the beginning and continues in the same direction.", needsDirection: true },
  LOOK: { label: "LOOK", description: "Similar to SCAN, but the arm only goes as far as the last request in each direction instead of going all the way to the end of the disk.", needsDirection: true },
  CLOOK: { label: "C-LOOK (Circular LOOK)", description: "Similar to C-SCAN, but the arm jumps back to the lowest (or highest) pending request instead of the actual end of the disk.", needsDirection: true },
};

function totalMovement(seq: SeekStep[]): { total: number; hasUnknown: boolean } {
  let total = 0;
  let hasUnknown = false;
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i].value;
    const b = seq[i + 1].value;
    if (a === "?" || b === "?") {
      hasUnknown = true;
      continue;
    }
    if (seq[i + 1].unknownGap) {
      // C-SCAN wrap with an unknown disk size: the real path goes
      // a -> (unknown disk edge) -> 0 -> b. Whatever the edge's true position,
      // the detour can never cost less than a + b (that minimum is reached when
      // the edge sits exactly at whichever of a/b is farther out), so that sum
      // is the guaranteed lower bound for this hop. The actual total could be
      // higher, hence hasUnknown stays true and the UI shows a "+".
      total += Math.abs(a) + Math.abs(b);
      hasUnknown = true;
      continue;
    }
    total += Math.abs(b - a);
  }
  return { total, hasUnknown };
}

function runFCFS(requests: number[], head: number): SeekStep[] {
  return [{ value: head }, ...requests.map((v) => ({ value: v }))];
}

function runSSTF(requests: number[], head: number): SeekStep[] {
  const remaining = [...requests];
  const seq: SeekStep[] = [{ value: head }];
  let current = head;
  while (remaining.length > 0) {
    let closestIdx = 0, closestDist = Math.abs(remaining[0] - current);
    for (let i = 1; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - current);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    }
    current = remaining[closestIdx];
    seq.push({ value: current });
    remaining.splice(closestIdx, 1);
  }
  return seq;
}

function runSCAN(requests: number[], head: number, diskSize: number | null, direction: Direction): SeekStep[] {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  const lowEnd: SeekStep = { value: 0 };
  const highEnd: SeekStep = { value: diskSize === null ? "?" : diskSize - 1 };

  if (direction === "left") {
    return [{ value: head }, ...less.reverse().map((v) => ({ value: v })), lowEnd, ...greater.map((v) => ({ value: v }))];
  }
  return [{ value: head }, ...greater.map((v) => ({ value: v })), highEnd, ...less.reverse().map((v) => ({ value: v }))];
}

function runLOOK(requests: number[], head: number, direction: Direction): SeekStep[] {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);
  if (direction === "left") {
    return [{ value: head }, ...less.reverse().map((v) => ({ value: v })), ...greater.map((v) => ({ value: v }))];
  }
  return [{ value: head }, ...greater.map((v) => ({ value: v })), ...less.reverse().map((v) => ({ value: v }))];
}

function runCSCAN(requests: number[], head: number, diskSize: number | null, direction: Direction): SeekStep[] {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);

  if (direction === "left") {
    const seq: SeekStep[] = [{ value: head }, ...less.reverse().map((v) => ({ value: v }))];
    if (diskSize === null) {
      if (greater.length > 0) {
        const rev = [...greater].reverse();
        seq.push({ value: rev[0], broken: true, unknownGap: true });
        seq.push(...rev.slice(1).map((v) => ({ value: v })));
      }
    } else {
      seq.push({ value: 0 });
      seq.push({ value: diskSize - 1, broken: true });
      seq.push(...[...greater].reverse().map((v) => ({ value: v })));
    }
    return seq;
  }

  const seq: SeekStep[] = [{ value: head }, ...greater.map((v) => ({ value: v }))];
  if (diskSize === null) {
    if (less.length > 0) {
      seq.push({ value: less[0], broken: true, unknownGap: true });
      seq.push(...less.slice(1).map((v) => ({ value: v })));
    }
  } else {
    seq.push({ value: diskSize - 1 });
    seq.push({ value: 0, broken: true });
    seq.push(...less.map((v) => ({ value: v })));
  }
  return seq;
}

function runCLOOK(requests: number[], head: number, direction: Direction): SeekStep[] {
  const sorted = [...requests].sort((a, b) => a - b);
  const less = sorted.filter((r) => r < head);
  const greater = sorted.filter((r) => r >= head);

  if (direction === "left") {
    if (less.length === 0) return [{ value: head }, ...[...greater].reverse().map((v) => ({ value: v }))];
    if (greater.length === 0) return [{ value: head }, ...[...less].reverse().map((v) => ({ value: v }))];
    const lessSeq = [...less].reverse().map((v) => ({ value: v }));
    const greaterSeq = [...greater].reverse().map((v, i) => ({ value: v, broken: i === 0 }));
    return [{ value: head }, ...lessSeq, ...greaterSeq];
  }

  if (greater.length === 0) return [{ value: head }, ...less.map((v) => ({ value: v }))];
  if (less.length === 0) return [{ value: head }, ...greater.map((v) => ({ value: v }))];
  const greaterSeq = greater.map((v) => ({ value: v }));
  const lessSeq = less.map((v, i) => ({ value: v, broken: i === 0 }));
  return [{ value: head }, ...greaterSeq, ...lessSeq];
}

function computeSequence(algo: Algorithm, requests: number[], head: number, diskSize: number | null, direction: Direction): SeekStep[] {
  const maxForFilter = diskSize === null ? Infinity : diskSize - 1;
  const valid = requests.filter((r) => !isNaN(r) && r >= 0 && r <= maxForFilter);
  if (valid.length === 0) return [{ value: head }];
  switch (algo) {
    case "FCFS": return runFCFS(valid, head);
    case "SSTF": return runSSTF(valid, head);
    case "SCAN": return runSCAN(valid, head, diskSize, direction);
    case "CSCAN": return runCSCAN(valid, head, diskSize, direction);
    case "LOOK": return runLOOK(valid, head, direction);
    case "CLOOK": return runCLOOK(valid, head, direction);
  }
}

const POINT_COLOR = "#06b6d4";
const LINE_COLOR_LIGHT = "#94a3b8";
const LINE_COLOR_DARK = "#64748b";

export default function DiskScheduling() {
  const [selected, setSelected] = useState<Algorithm>("FCFS");
  const [requestStr, setRequestStr] = useState("");
  const [head, setHead] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [direction, setDirection] = useState<Direction>("right");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);

  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) { html.classList.remove("dark"); setIsDark(false); }
    else { html.classList.add("dark"); setIsDark(true); }
  }

  function loadExample() {
    setSelected("FCFS");
    setRequestStr("30 67 37 167 14 124 69 143");
    setHead("1");
    setMaxValue("200");
    setDirection("right");
  }

  function clearAll() {
    setRequestStr("");
    setHead("");
    setMaxValue("");
    setDirection("right");
  }

  const requests = requestStr.trim().split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => !isNaN(n));
  const headNum = Number(head) || 0;
  const maxValueTrimmed = maxValue.trim();
  const isUnknownMax = maxValueTrimmed === "?";
  const maxValueNum = Number(maxValueTrimmed);
  const hasValidMaxInput = isUnknownMax || (maxValueTrimmed !== "" && !isNaN(maxValueNum) && maxValueNum >= 1);
  const diskSizeNum: number | null = isUnknownMax ? null : (hasValidMaxInput ? Math.max(2, maxValueNum + 1) : null);
  const info = algorithmInfo[selected];

  const sequence = hasValidMaxInput
    ? computeSequence(selected, requests, headNum, diskSizeNum, direction)
    : [{ value: headNum } as SeekStep];

  const { total, hasUnknown } = totalMovement(sequence);
  const hasInput = requests.length > 0 && head !== "" && hasValidMaxInput;
  const knownValues = sequence.map((s) => s.value).filter((v): v is number => v !== "?");
  const fallbackMax = knownValues.length > 0 ? Math.max(...knownValues, headNum) : headNum;
  const axisMax = diskSizeNum !== null ? diskSizeNum - 1 : Math.max(fallbackMax, 1);

  const chartWidth = 760;
  const chartHeight = sequence.length * 46 + 80;
  const marginX = 40;
  const usableWidth = chartWidth - marginX * 2;

  function xPos(cyl: number) {
    return marginX + (cyl / (axisMax || 1)) * usableWidth;
  }

  const tickValues = [...new Set([0, axisMax, headNum, ...requests, ...knownValues])].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8] dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link href="/#demo" className="inline-flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={loadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Load Example
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-rose-400/40 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
          <ExportButton
            targetId="disk-export-snapshot"
            title="Disk Scheduling Simulation"
            subtitle={`Algorithm: ${info.label}`}
          />
          <ThemeToggleSwitch isDark={isDark} onToggle={toggleTheme} small />
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
                  Request Queue (numbers, space or comma separated)
                </label>
                <input value={requestStr} onChange={(e) => setRequestStr(e.target.value)}
                  className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-48">
                  <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Initial Head Position</label>
                  <input type="number" min={0} value={head} onChange={(e) => setHead(e.target.value)}
                    className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>
                <div className="md:w-48">
                  <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Max Value <span className="text-slate-400 dark:text-slate-500">(&quot;?&quot; if unknown)</span>
                  </label>
                  <input type="text" value={maxValue} onChange={(e) => setMaxValue(e.target.value)}
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
            {hasInput ? (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-4 text-xs font-mono">
                <span className="text-cyan-600 dark:text-cyan-400">
                  Total Head Movement: <span className="font-bold">{total}{hasUnknown ? "+" : ""}</span> tracks
                </span>
                <span className="text-slate-400">Requests Serviced: {requests.length}</span>
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
                  {sequence.map((step, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${i === 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/30" : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-400/30"}`}>
                        {step.value}
                      </span>
                      {i < sequence.length - 1 && (
                        <span className={`text-xs ${sequence[i + 1].broken ? "text-amber-500" : "text-slate-400"}`}>
                          {sequence[i + 1].broken ? "⇢" : "→"}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                  <span className="text-amber-500">●</span> Starting head position &nbsp;&nbsp; <span className="text-cyan-500">●</span> Serviced requests in order
                  {hasUnknown && <>&nbsp;&nbsp;<span className="text-amber-500">⇢</span> Wrap-around (distance unknown)</>}
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
                    {/* Axis line */}
                    <line x1={marginX} y1={20} x2={chartWidth - marginX} y2={20}
                      stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />
                    {/* Tick marks and labels */}
                    {tickValues.map((val, i) => (
                      <g key={i}>
                        <line x1={xPos(val)} y1={15} x2={xPos(val)} y2={25}
                          stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />
                        <text x={xPos(val)} y={12} textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill={isDark ? "#cbd5e1" : "#475569"}>{val}</text>
                      </g>
                    ))}
                    {/* Arrowhead markers */}
                    <defs>
                      <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="2" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 Z" fill={POINT_COLOR} />
                      </marker>
                      <marker id="arrowhead-broken" markerWidth="7" markerHeight="7" refX="2" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 Z" fill={isDark ? "#fbbf24" : "#d97706"} />
                      </marker>
                    </defs>
                    {/* Seek lines — tip stops just at dot edge */}
                    {sequence.map((step, i) => {
                      if (i === sequence.length - 1) return null;
                      const next = sequence[i + 1];
                      if (step.value === "?" || next.value === "?") return null;
                      const x1 = xPos(step.value), y1 = 20 + i * 46 + 40;
                      const x2 = xPos(next.value), y2 = 20 + (i + 1) * 46 + 40;
                      const dotR = 3, arrowLen = 5;
                      const dx = x2 - x1, dy = y2 - y1;
                      const len = Math.sqrt(dx * dx + dy * dy) || 1;
                      const ux = dx / len, uy = dy / len;
                      const ex = x2 - ux * (dotR + arrowLen);
                      const ey = y2 - uy * (dotR + arrowLen);
                      const isBroken = !!next.broken;
                      const strokeColor = isBroken ? (isDark ? "#fbbf24" : "#d97706") : POINT_COLOR;
                      return (
                        <line key={i} x1={x1} y1={y1} x2={ex} y2={ey} stroke={strokeColor} strokeWidth={1.5}
                          strokeDasharray={isBroken ? "6 5" : undefined}
                          markerEnd={isBroken ? "url(#arrowhead-broken)" : "url(#arrowhead)"} />
                      );
                    })}
                    {/* Points and labels — label offset away from incoming line */}
                    {sequence.map((step, i) => {
                      if (step.value === "?") return null;
                      const x = xPos(step.value), y = 20 + i * 46 + 40;
                      const prevStep = i > 0 ? sequence[i - 1] : null;
                      const prevX = prevStep && prevStep.value !== "?" ? xPos(prevStep.value) : null;
                      const prevY = prevStep ? (20 + (i - 1) * 46 + 40) : null;
                      let labelX = x + 14;
                      let labelY = y - 8;
                      let anchor: "start" | "end" | "middle" = "start";
                      if (prevX !== null && prevY !== null) {
                        const fromRight = prevX > x;
                        const fromBelow = prevY > y;
                        if (fromRight && !fromBelow) { labelX = x - 10; anchor = "end"; labelY = y - 8; }
                        else if (!fromRight && !fromBelow) { labelX = x + 10; anchor = "start"; labelY = y - 8; }
                        else if (fromRight && fromBelow) { labelX = x + 10; anchor = "start"; labelY = y + 16; }
                        else { labelX = x - 10; anchor = "end"; labelY = y + 16; }
                      }
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r={4} fill={i === 0 ? "#f59e0b" : POINT_COLOR} />
                          <text x={labelX} y={labelY} textAnchor={anchor} fontSize="11" fontWeight="bold" fontFamily="monospace"
                            fill={isDark ? "#e2e8f0" : "#1e293b"}>{step.value}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-20 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in the configuration above to generate the seek graph
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hidden export snapshot ── */}
      <div
        id="disk-export-snapshot"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "900px",
          zIndex: -1,
          pointerEvents: "none",
          overflow: "visible",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: isDark ? "#020b18" : "#f0f6fa",
        }}
      >
        {/* Export title */}
        <div className="text-center pb-2 border-b border-slate-200 dark:border-white/10">
          <div className="text-4xl mb-4">💽</div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Disk Scheduling</h1>
        </div>

        {/* Algorithm description */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{info.label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{info.description}</p>
        </div>

        {/* Configuration summary */}
        {hasInput && (
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-4">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Configuration</p>
            <div className="flex flex-col gap-2 font-mono text-sm">
              <span className="text-slate-600 dark:text-slate-300">Request Queue: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{requests.join(", ")}</span></span>
              <span className="text-slate-600 dark:text-slate-300">Initial Head: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{headNum}</span></span>
              <span className="text-slate-600 dark:text-slate-300">Max Value: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{diskSizeNum !== null ? diskSizeNum - 1 : "?"}</span></span>
              {info.needsDirection && (
                <span className="text-slate-600 dark:text-slate-300">Direction: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{direction === "left" ? "← Toward 0" : "Toward Max →"}</span></span>
              )}
              <span className="text-cyan-600 dark:text-cyan-400 font-bold mt-1">Total Head Movement: {total}{hasUnknown ? "+" : ""} tracks</span>
            </div>
          </div>
        )}

        {/* Seek sequence */}
        {hasInput && (
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-4">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Seek Sequence</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
              {sequence.map((step, i) => {
                const label = String(step.value);
                const pillWidth = Math.max(48, label.length * 11 + 28);
                const pillHeight = 28;
                const isLast = i === sequence.length - 1;
                const svgWidth = isLast ? pillWidth : pillWidth + 20;
                const nextBroken = !isLast && !!sequence[i + 1].broken;
                return (
                  <span key={i} style={{ display: "flex", alignItems: "center" }}>
                    <svg width={svgWidth} height={pillHeight} style={{ display: "block" }}>
                      <rect
                        x={0}
                        y={0}
                        width={pillWidth}
                        height={pillHeight}
                        rx={pillHeight / 2}
                        ry={pillHeight / 2}
                        fill={i === 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(6, 182, 212, 0.15)"}
                        stroke={i === 0 ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 211, 238, 0.3)"}
                        strokeWidth={1}
                      />
                      <text
                        x={pillWidth / 2}
                        y={18}
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="700"
                        fill={i === 0 ? (isDark ? "#fbbf24" : "#d97706") : (isDark ? "#22d3ee" : "#0891b2")}
                      >
                        {label}
                      </text>
                      {!isLast && (
                        <text
                          x={pillWidth + 10}
                          y={18}
                          textAnchor="middle"
                          fontSize="12"
                          fontFamily="monospace"
                          fill={nextBroken ? (isDark ? "#fbbf24" : "#d97706") : "#94a3b8"}
                        >
                          {nextBroken ? "⇢" : "→"}
                        </text>
                      )}
                    </svg>
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
              <span style={{ color: "#f59e0b" }}>●</span> Starting head position &nbsp;&nbsp; <span style={{ color: POINT_COLOR }}>●</span> Serviced requests in order
              {hasUnknown && <>&nbsp;&nbsp;<span style={{ color: "#f59e0b" }}>⇢</span> Wrap-around (distance unknown)</>}
            </p>
          </div>
        )}

        {/* Seek graph */}
        {hasInput && (
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-4">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Seek Graph</p>
            <svg width={chartWidth} height={chartHeight}>
              {/* Axis line */}
              <line x1={marginX} y1={20} x2={chartWidth - marginX} y2={20}
                stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />
              {/* Tick marks and labels */}
              {tickValues.map((val, i) => (
                <g key={i}>
                  <line x1={xPos(val)} y1={15} x2={xPos(val)} y2={25}
                    stroke={isDark ? LINE_COLOR_DARK : LINE_COLOR_LIGHT} strokeWidth={1.5} />
                  <text x={xPos(val)} y={12} textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={isDark ? "#cbd5e1" : "#475569"}>{val}</text>
                </g>
              ))}
              {/* Arrowhead markers — unique ids to avoid conflict with main chart */}
              <defs>
                <marker id="export-arrowhead" markerWidth="7" markerHeight="7" refX="2" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5 Z" fill={POINT_COLOR} />
                </marker>
                <marker id="export-arrowhead-broken" markerWidth="7" markerHeight="7" refX="2" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5 Z" fill={isDark ? "#fbbf24" : "#d97706"} />
                </marker>
              </defs>
              {/* Seek lines */}
              {sequence.map((step, i) => {
                if (i === sequence.length - 1) return null;
                const next = sequence[i + 1];
                if (step.value === "?" || next.value === "?") return null;
                const x1 = xPos(step.value), y1 = 20 + i * 46 + 40;
                const x2 = xPos(next.value), y2 = 20 + (i + 1) * 46 + 40;
                const dotR = 3, arrowLen = 5;
                const dx = x2 - x1, dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const ux = dx / len, uy = dy / len;
                const ex = x2 - ux * (dotR + arrowLen);
                const ey = y2 - uy * (dotR + arrowLen);
                const isBroken = !!next.broken;
                const strokeColor = isBroken ? (isDark ? "#fbbf24" : "#d97706") : POINT_COLOR;
                return (
                  <line key={i} x1={x1} y1={y1} x2={ex} y2={ey} stroke={strokeColor} strokeWidth={1.5}
                    strokeDasharray={isBroken ? "6 5" : undefined}
                    markerEnd={isBroken ? "url(#export-arrowhead-broken)" : "url(#export-arrowhead)"} />
                );
              })}
              {/* Points and labels */}
              {sequence.map((step, i) => {
                if (step.value === "?") return null;
                const x = xPos(step.value), y = 20 + i * 46 + 40;
                const prevStep = i > 0 ? sequence[i - 1] : null;
                const prevX = prevStep && prevStep.value !== "?" ? xPos(prevStep.value) : null;
                const prevY = prevStep ? (20 + (i - 1) * 46 + 40) : null;
                let labelX = x + 14;
                let labelY = y - 8;
                let anchor: "start" | "end" | "middle" = "start";
                if (prevX !== null && prevY !== null) {
                  const fromRight = prevX > x;
                  const fromBelow = prevY > y;
                  if (fromRight && !fromBelow) { labelX = x - 10; anchor = "end"; labelY = y - 8; }
                  else if (!fromRight && !fromBelow) { labelX = x + 10; anchor = "start"; labelY = y - 8; }
                  else if (fromRight && fromBelow) { labelX = x + 10; anchor = "start"; labelY = y + 16; }
                  else { labelX = x - 10; anchor = "end"; labelY = y + 16; }
                }
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4} fill={i === 0 ? "#f59e0b" : POINT_COLOR} />
                    <text x={labelX} y={labelY} textAnchor={anchor} fontSize="11" fontWeight="bold" fontFamily="monospace"
                      fill={isDark ? "#e2e8f0" : "#1e293b"}>{step.value}</text>
                  </g>
                );
              })}
            </svg>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span style={{ color: "#f59e0b" }}>●</span> Starting head position &nbsp;&nbsp; <span style={{ color: POINT_COLOR }}>●</span> Serviced requests in order
              {hasUnknown && <>&nbsp;&nbsp;<span style={{ color: "#f59e0b" }}>⇢</span> Wrap-around (distance unknown)</>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
