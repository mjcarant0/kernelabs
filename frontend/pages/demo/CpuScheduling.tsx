"use client";

import ExportButton from "@/backend/save_and_export/ExportButton";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggleSwitch from "../../ui/buttons/ThemeToggleSwitch";

type Algorithm = "FCFS" | "SJF" | "Priority" | "RoundRobin";

interface Process {
  id: string;
  arrivalTime: number | string;
  burstTime: number | string;
  priority?: number | string;
}

interface GanttBlock {
  pid: string;
  start: number;
  end: number;
}

const algorithmInfo: Record<Algorithm, { label: string; description: string; columns: string[] }> = {
  FCFS: {
    label: "First Come First Serve",
    description: "Processes are executed in the order they arrive. Simple but may cause long waiting times.",
    columns: ["Process ID", "Arrival Time", "Burst Time"],
  },
  SJF: {
    label: "Shortest Job First",
    description: "The process with the shortest burst time is executed next. Minimizes average waiting time.",
    columns: ["Process ID", "Arrival Time", "Burst Time"],
  },
  Priority: {
    label: "Priority Scheduling",
    description: "Each process is assigned a priority. Lower number = higher priority. May cause starvation.",
    columns: ["Process ID", "Arrival Time", "Burst Time", "Priority"],
  },
  RoundRobin: {
    label: "Round Robin",
    description: "Each process gets a fixed time slice (quantum). Fair but has higher context-switching overhead.",
    columns: ["Process ID", "Arrival Time", "Burst Time"],
  },
};

const EXAMPLE_DATA: Record<Algorithm, Process[]> = {
  FCFS: [
    { id: "P1", arrivalTime: 0, burstTime: 6 },
    { id: "P2", arrivalTime: 1, burstTime: 7 },
    { id: "P3", arrivalTime: 2, burstTime: 4 },
    { id: "P4", arrivalTime: 3, burstTime: 2 },
  ],
  SJF: [
    { id: "P1", arrivalTime: 0, burstTime: 6 },
    { id: "P2", arrivalTime: 1, burstTime: 9 },
    { id: "P3", arrivalTime: 2, burstTime: 2 },
    { id: "P4", arrivalTime: 3, burstTime: 5 },
  ],
  Priority: [
    { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: "P2", arrivalTime: 1, burstTime: 3, priority: 4 },
    { id: "P3", arrivalTime: 2, burstTime: 9, priority: 3 },
    { id: "P4", arrivalTime: 3, burstTime: 7, priority: 1 },
  ],
  RoundRobin: [
    { id: "P1", arrivalTime: 0, burstTime: 6 },
    { id: "P2", arrivalTime: 1, burstTime: 7 },
    { id: "P3", arrivalTime: 2, burstTime: 4 },
    { id: "P4", arrivalTime: 3, burstTime: 2 },
  ],
};

function defaultRow(_algo: Algorithm, index: number): Process {
  return {
    id: `P${index + 1}`,
    arrivalTime: 0,
    burstTime: 0,
    priority: 1, // always stored; only shown in UI when algo is Priority
  };
}

function computeGantt(algo: Algorithm, processes: Process[], globalQuantum: number, isPreemptive: boolean): GanttBlock[] {
  const valid = processes.filter(
    (p) => p.id && p.arrivalTime !== "" && p.burstTime !== "" && Number(p.burstTime) > 0
  );
  if (valid.length === 0) return [];

  const procs = valid.map((p) => ({
    pid: p.id,
    arrival: Number(p.arrivalTime),
    burst: Number(p.burstTime),
    remaining: Number(p.burstTime),
    priority: Number(p.priority ?? 0),
  }));

  const gantt: GanttBlock[] = [];

  if (algo === "FCFS") {
    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    for (const p of sorted) {
      const start = Math.max(time, p.arrival);
      gantt.push({ pid: p.pid, start, end: start + p.burst });
      time = start + p.burst;
    }
  } else if (algo === "SJF") {
    if (!isPreemptive) {
      const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
      let time = 0;
      const done = new Set<string>();
      while (done.size < sorted.length) {
        const available = sorted.filter((p) => p.arrival <= time && !done.has(p.pid));
        if (available.length === 0) { time++; continue; }
        const next = available.sort((a, b) => a.burst - b.burst)[0];
        gantt.push({ pid: next.pid, start: time, end: time + next.burst });
        time += next.burst;
        done.add(next.pid);
      }
    } else {
      const remaining = procs.map((p) => ({ ...p }));
      const done = new Set<string>();
      let time = 0;
      const maxTime = remaining.reduce((s, p) => s + p.burst, 0) +
        Math.max(...remaining.map((p) => p.arrival));
      while (done.size < remaining.length && time <= maxTime) {
        const available = remaining.filter((p) => p.arrival <= time && !done.has(p.pid));
        if (available.length === 0) { time++; continue; }
        const next = available.sort((a, b) => a.remaining - b.remaining)[0];
        const last = gantt[gantt.length - 1];
        if (last && last.pid === next.pid && last.end === time) {
          last.end = time + 1;
        } else {
          gantt.push({ pid: next.pid, start: time, end: time + 1 });
        }
        next.remaining -= 1;
        time += 1;
        if (next.remaining === 0) done.add(next.pid);
      }
    }
  } else if (algo === "Priority") {
    if (!isPreemptive) {
      const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
      let time = 0;
      const done = new Set<string>();
      while (done.size < sorted.length) {
        const available = sorted.filter((p) => p.arrival <= time && !done.has(p.pid));
        if (available.length === 0) { time++; continue; }
        const next = available.sort((a, b) => a.priority - b.priority)[0];
        gantt.push({ pid: next.pid, start: time, end: time + next.burst });
        time += next.burst;
        done.add(next.pid);
      }
    } else {
      const remaining = procs.map((p) => ({ ...p }));
      const done = new Set<string>();
      let time = 0;
      const maxTime = remaining.reduce((s, p) => s + p.burst, 0) +
        Math.max(...remaining.map((p) => p.arrival));
      while (done.size < remaining.length && time <= maxTime) {
        const available = remaining.filter((p) => p.arrival <= time && !done.has(p.pid));
        if (available.length === 0) { time++; continue; }
        const next = available.sort((a, b) => a.priority - b.priority)[0];
        const last = gantt[gantt.length - 1];
        if (last && last.pid === next.pid && last.end === time) {
          last.end = time + 1;
        } else {
          gantt.push({ pid: next.pid, start: time, end: time + 1 });
        }
        next.remaining -= 1;
        time += 1;
        if (next.remaining === 0) done.add(next.pid);
      }
    }
  } else if (algo === "RoundRobin") {
    const q = globalQuantum;
    const queue = [...procs].sort((a, b) => a.arrival - b.arrival).map((p) => ({ ...p }));
    let time = 0;
    const readyQueue: typeof queue = [];
    let idx = 0;
    while (readyQueue.length > 0 || idx < queue.length) {
      while (idx < queue.length && queue[idx].arrival <= time) {
        readyQueue.push(queue[idx]);
        idx++;
      }
      if (readyQueue.length === 0) { time = queue[idx]?.arrival ?? time + 1; continue; }
      const curr = readyQueue.shift()!;
      const run = Math.min(q, curr.remaining);
      gantt.push({ pid: curr.pid, start: time, end: time + run });
      time += run;
      curr.remaining -= run;
      while (idx < queue.length && queue[idx].arrival <= time) {
        readyQueue.push(queue[idx]);
        idx++;
      }
      if (curr.remaining > 0) readyQueue.push(curr);
    }
  }

  return gantt;
}

function computeMetrics(processes: Process[], gantt: GanttBlock[]) {
  const valid = processes.filter(
    (p) => p.id && p.arrivalTime !== "" && p.burstTime !== "" && Number(p.burstTime) > 0
  );
  if (valid.length === 0 || gantt.length === 0) return [];

  return valid.map((p) => {
    const blocks = gantt.filter((b) => b.pid === p.id);
    if (blocks.length === 0) return null;
    const arrival = Number(p.arrivalTime);
    const burst = Number(p.burstTime);
    const completionTime = Math.max(...blocks.map((b) => b.end));
    const firstStart = Math.min(...blocks.map((b) => b.start));
    const turnaroundTime = completionTime - arrival;
    const waitingTime = turnaroundTime - burst;
    const responseTime = firstStart - arrival;
    return { pid: p.id, arrival, burst, completionTime, turnaroundTime, waitingTime, responseTime };
  }).filter(Boolean);
}

function chunkGantt(gantt: GanttBlock[], maxPerRow: number): GanttBlock[][] {
  const rows: GanttBlock[][] = [];
  for (let i = 0; i < gantt.length; i += maxPerRow) {
    rows.push(gantt.slice(i, i + maxPerRow));
  }
  return rows;
}

const COLORS_LIGHT = ["#d5f3f9", "#a1d9e4"];
const COLORS_DARK = ["#073349", "#1c526c"];

const BLOCKS_PER_ROW = 10;
const PX_PER_UNIT = 10;
const MIN_BLOCK_WIDTH = 48;
const MAX_BLOCK_WIDTH = 80;

function blockWidth(burstTime: number): number {
  return Math.min(Math.max(burstTime * PX_PER_UNIT, MIN_BLOCK_WIDTH), MAX_BLOCK_WIDTH);
}

function makeExampleRows(algo: Algorithm): Process[] {
  return EXAMPLE_DATA[algo].map((p, i) => ({
    ...p,
    priority: p.priority !== undefined ? p.priority : i + 1,
  }));
}

function makeEmptyRows(algo: Algorithm): Process[] {
  return [defaultRow(algo, 0), defaultRow(algo, 1), defaultRow(algo, 2)];
}

export default function CpuScheduling() {
  const [selected, setSelected] = useState<Algorithm>("FCFS");
  const [isPreemptive, setIsPreemptive] = useState<boolean>(false);

  // Each algorithm keeps its own rows so switching never overwrites another algo's state.
  const [algoRows, setAlgoRows] = useState<Record<Algorithm, Process[]>>({
    FCFS: makeEmptyRows("FCFS"),
    SJF: makeEmptyRows("SJF"),
    Priority: makeEmptyRows("Priority"),
    RoundRobin: makeEmptyRows("RoundRobin"),
  });

  // Convenience: current algo's rows
  const rows = algoRows[selected];
  function setRows(updater: Process[] | ((prev: Process[]) => Process[])) {
    setAlgoRows((prev) => ({
      ...prev,
      [selected]: typeof updater === "function" ? updater(prev[selected]) : updater,
    }));
  }

  const [globalQuantum, setGlobalQuantum] = useState<string>("2");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;

  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      setIsDark(true);
    }
  }

  const supportsPreemptive = selected === "SJF" || selected === "Priority";
  const info = algorithmInfo[selected];
  const gantt = computeGantt(selected, rows, Number(globalQuantum) || 1, isPreemptive);
  const pidList = [...new Set(gantt.map((b) => b.pid))];
  const ganttRows = chunkGantt(gantt, BLOCKS_PER_ROW);
  const metrics = computeMetrics(rows, gantt);
  const avgTAT = metrics.length ? metrics.reduce((s, m) => s + m!.turnaroundTime, 0) / metrics.length : 0;
  const avgWT = metrics.length ? metrics.reduce((s, m) => s + m!.waitingTime, 0) / metrics.length : 0;

  const algoDisplayLabel = supportsPreemptive
    ? `${info.label} (${isPreemptive ? "Preemptive" : "Non-Preemptive"})`
    : info.label;

  // Just switch algorithm — each algo's rows are stored independently in algoRows,
  // so nothing is ever lost or overwritten when switching.
  function handleAlgoChange(algo: Algorithm) {
    setSelected(algo);
    setIsPreemptive(false);
  }

  function addRow() {
    setRows((prev: Process[]) => [...prev, defaultRow(selected, prev.length)]);
  }

  function removeRow(i: number) {
    if (rows.length <= 1) return;
    setRows((prev: Process[]) => prev.filter((_: Process, idx: number) => idx !== i));
  }

  function updateRow(i: number, field: keyof Process, value: string) {
    setRows((prev: Process[]) =>
      prev.map((r: Process, idx: number) => (idx === i ? { ...r, [field]: value } : r))
    );
  }

  function focusNext(i: number, field: string) {
    const nextRow = i + 1;
    if (nextRow >= rows.length) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`[data-row="${nextRow}"][data-field="${field}"]`);
      el?.focus();
      el?.select();
    }, 50);
  }

  function loadExample() {
    setRows(makeExampleRows(selected));
  }

  function clearAll() {
    setRows([defaultRow(selected, 0), defaultRow(selected, 1), defaultRow(selected, 2)]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8]
      dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">

      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link href="/#demo" className="inline-flex items-center gap-2 text-sm font-mono
          text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={loadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
              border border-slate-200 dark:border-white/10
              text-slate-600 dark:text-slate-300
              hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Load Example
          </button>
          <button onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
              border border-rose-400/40 dark:border-rose-500/30
              text-rose-600 dark:text-rose-400
              hover:bg-rose-500/10 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
          <ExportButton
            targetId="cpu-export-snapshot"
            title="CPU Scheduling Simulation"
            subtitle={`Algorithm: ${algoDisplayLabel}`}
          />
          <ThemeToggleSwitch isDark={isDark} onToggle={toggleTheme} />
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            SIMULATOR · LIVE
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
            CPU Scheduling
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Select an algorithm, fill in the process table, and visualize the Gantt chart
        </p>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">

        {/* Left panel */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
              Algorithms
            </p>
            <div className="flex flex-col gap-1">
              {(Object.keys(algorithmInfo) as Algorithm[]).map((algo) => (
                <button key={algo} onClick={() => handleAlgoChange(algo)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${selected === algo
                      ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                    }`}>
                  <span className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-0.5">
                    {algo === "RoundRobin" ? "RR" : algo}
                  </span>
                  {algorithmInfo[algo].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Algorithm description */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{info.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{info.description}</p>

            {supportsPreemptive && (
              <div className="mt-4 flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mode</span>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                  <button onClick={() => setIsPreemptive(false)}
                    className={`px-3 py-1.5 text-xs font-mono transition-colors
                      ${!isPreemptive
                        ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-r border-cyan-400/30"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border-r border-slate-200 dark:border-white/10"}`}>
                    Non-Preemptive
                  </button>
                  <button onClick={() => setIsPreemptive(true)}
                    className={`px-3 py-1.5 text-xs font-mono transition-colors
                      ${isPreemptive
                        ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                    Preemptive
                  </button>
                </div>
              </div>
            )}

            {selected === "RoundRobin" && (
              <div className="mt-4 flex items-center gap-3">
                <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time Quantum</label>
                <input type="number" min={1} value={globalQuantum} onChange={(e) => setGlobalQuantum(e.target.value)}
                  className="w-20 bg-transparent border border-cyan-400/40 dark:border-cyan-500/30
                    rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-sm
                    focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400" />
                <span className="text-xs text-slate-400 dark:text-slate-500">ms — applied to all processes</span>
              </div>
            )}
          </div>

          {/* Process table */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Process Table
              </p>
              <div className="flex items-center gap-2">
                <button onClick={addRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                    bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400
                    border border-cyan-400/30 dark:border-cyan-500/25 hover:bg-cyan-500/20 transition-colors">
                  + Add Row
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/8">
                    {info.columns.map((col) => (
                      <th key={col} className="text-left py-2 px-3 font-mono text-xs
                        text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                      <td className="py-2 px-3">
                        <input value={row.id} onChange={(e) => updateRow(i, "id", e.target.value)}
                          data-row={i} data-field="id"
                          onKeyDown={(e) => e.key === "Enter" && focusNext(i, "id")}
                          className="w-16 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="number" min={0} value={row.arrivalTime}
                          onChange={(e) => updateRow(i, "arrivalTime", e.target.value)}
                          data-row={i} data-field="arrivalTime"
                          onKeyDown={(e) => e.key === "Enter" && focusNext(i, "arrivalTime")}
                          className="w-20 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="number" min={1} value={row.burstTime}
                          onChange={(e) => updateRow(i, "burstTime", e.target.value)}
                          data-row={i} data-field="burstTime"
                          onKeyDown={(e) => e.key === "Enter" && focusNext(i, "burstTime")}
                          className="w-20 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      {selected === "Priority" && (
                        <td className="py-2 px-3">
                          <input type="number" min={1} value={row.priority ?? ""}
                            onChange={(e) => updateRow(i, "priority", e.target.value)}
                            data-row={i} data-field="priority"
                            onKeyDown={(e) => e.key === "Enter" && focusNext(i, "priority")}
                            className="w-20 bg-transparent border border-slate-200 dark:border-white/10
                              rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                              focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                        </td>
                      )}
                      <td className="py-2 px-1">
                        <button onClick={() => removeRow(i)}
                          className="text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Gantt Chart
            </p>

            {gantt.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in the table to generate the chart
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-8">
                  {ganttRows.map((rowBlocks: GanttBlock[], rowIdx: number) => {
                    const timeMarkers: { time: number; leftPx: number }[] = [];
                    let cursor = 0;
                    rowBlocks.forEach((block: GanttBlock) => {
                      timeMarkers.push({ time: block.start, leftPx: cursor });
                      cursor += blockWidth(block.end - block.start);
                    });
                    timeMarkers.push({ time: rowBlocks[rowBlocks.length - 1].end, leftPx: cursor });

                    return (
                      <div key={rowIdx}>
                        <div className="flex pl-3">
                          {rowBlocks.map((block: GanttBlock, i: number) => {
                            const pidIdx = pidList.indexOf(block.pid);
                            return (
                              <div key={i}
                                style={{ width: blockWidth(block.end - block.start), backgroundColor: COLORS[pidIdx % COLORS.length] }}
                                className={`h-10 flex items-center justify-center
                                  ${isDark ? "text-[#c2cfdb]" : "text-[#495970]"} text-[11px] font-bold shrink-0
                                  border-r-2 border-white/30 last:border-r-0`}>
                                {block.pid}
                              </div>
                            );
                          })}
                        </div>
                        <div className="relative pl-3" style={{ height: "28px" }}>
                          {timeMarkers.map((marker, i) => (
                            <div key={i} style={{ left: `calc(0.75rem + ${marker.leftPx}px)` }}
                              className="absolute top-0 flex flex-col items-center -translate-x-1/2">
                              <div className="w-px h-2 bg-slate-400 dark:bg-slate-500" />
                              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-0.5 whitespace-nowrap">
                                {marker.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Metrics Table */}
                {metrics.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5 mt-6">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                      Process Metrics
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/8">
                            {["Process","Arrival","Burst","Completion","Turnaround","Waiting","Response"].map((h) => (
                              <th key={h} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map((m, i) => {
                            const pidIdx = pidList.indexOf(m!.pid);
                            const blockColor = COLORS[pidIdx % COLORS.length];
                            return (
                              <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                                <td className="py-2 px-3"><span className="font-mono text-xs font-bold" style={{ color: blockColor }}>{m!.pid}</span></td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.arrival}</td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.burst}</td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.completionTime}</td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.turnaroundTime}</td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.waitingTime}</td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.responseTime}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-200 dark:border-white/10">
                            <td colSpan={4} className="py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 text-right">Averages →</td>
                            <td className="py-2 px-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{avgTAT.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{avgWT.toFixed(2)}</td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden export snapshot */}
      <div id="cpu-export-snapshot" aria-hidden="true"
        style={{ position:"fixed", top:0, left:"-9999px", width:"900px", zIndex:-1, pointerEvents:"none", overflow:"visible", padding:"32px", display:"flex", flexDirection:"column", gap:"10px", background: isDark ? "#020b18" : "#f0f6fa" }}>
        <div className="text-center pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="text-4xl mb-4">⚙️</div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">CPU Scheduling</h1>
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{algoDisplayLabel}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{info.description}</p>
          {selected === "RoundRobin" && (<p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-2">Time Quantum: {globalQuantum} ms</p>)}
        </div>
        <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
          <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Process Table</p>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 dark:border-white/8">{info.columns.map((col) => (<th key={col} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{col}</th>))}</tr></thead>
            <tbody>{rows.map((row, i) => (<tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0"><td className="py-2 px-3 font-mono text-xs text-slate-900 dark:text-white">{row.id}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{row.arrivalTime}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{row.burstTime}</td>{selected === "Priority" && (<td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{row.priority}</td>)}</tr>))}</tbody>
          </table>
        </div>
        {metrics.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Process Metrics</p>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-white/8">{["Process","Arrival","Burst","Completion","Turnaround","Waiting","Response"].map((h) => (<th key={h} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>))}</tr></thead>
              <tbody>{metrics.map((m, i) => (<tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0"><td className="py-2 px-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{m!.pid}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.arrival}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.burst}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.completionTime}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.turnaroundTime}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.waitingTime}</td><td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{m!.responseTime}</td></tr>))}</tbody>
              <tfoot><tr className="border-t-2 border-slate-200 dark:border-white/10"><td colSpan={4} className="py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 text-right">Averages →</td><td className="py-2 px-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{avgTAT.toFixed(2)}</td><td className="py-2 px-3 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{avgWT.toFixed(2)}</td><td /></tr></tfoot>
            </table>
          </div>
        )}
        {gantt.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Gantt Chart</p>
            <div className="flex flex-col gap-8">
              {ganttRows.map((rowBlocks: GanttBlock[], rowIdx: number) => {
                const timeMarkers: { time: number; leftPx: number }[] = [];
                let cursor = 0;
                rowBlocks.forEach((block: GanttBlock) => { timeMarkers.push({ time: block.start, leftPx: cursor }); cursor += blockWidth(block.end - block.start); });
                timeMarkers.push({ time: rowBlocks[rowBlocks.length - 1].end, leftPx: cursor });
                return (
                  <div key={rowIdx}>
                    <div className="flex pl-3">
                      {rowBlocks.map((block: GanttBlock, i: number) => {
                        const pidIdx = pidList.indexOf(block.pid);
                        return (<div key={i} style={{ width: blockWidth(block.end - block.start), backgroundColor: COLORS[pidIdx % COLORS.length] }} className="h-10 flex items-center justify-center text-[11px] font-bold shrink-0 border-r-2 border-white/30">{block.pid}</div>);
                      })}
                    </div>
                    <div className="relative pl-3" style={{ height: "28px" }}>
                      {timeMarkers.map((marker, i) => (<div key={i} style={{ left: `calc(0.75rem + ${marker.leftPx}px)` }} className="absolute top-0 flex flex-col items-center -translate-x-1/2"><div className="w-px h-2 bg-slate-400" /><span className="text-[11px] font-mono mt-0.5 whitespace-nowrap">{marker.time}</span></div>))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
