"use client";

import { useState } from "react";
import Link from "next/link";

type Strategy = "Detection" | "Prevention" | "Recovery";

const strategyInfo: Record<Strategy, { label: string; description: string }> = {
  Detection: {
    label: "Deadlock Detection",
    description: "Periodically checks the system for deadlock by examining resource allocation and process requests. Uses the Wait-For Graph to detect circular waits.",
  },
  Prevention: {
    label: "Deadlock Prevention (Banker's Algorithm)",
    description: "Ensures the system never enters an unsafe state by simulating resource allocation before granting requests. A safe sequence means no deadlock is possible.",
  },
  Recovery: {
    label: "Deadlock Recovery",
    description: "Once a deadlock is detected, the OS can recover by terminating one or more processes or by preempting resources from a process to break the cycle.",
  },
};

// ─── Shared resource names ────────────────────────────────────────────────────
const RESOURCES = ["A", "B", "C"];

// ─── Detection ────────────────────────────────────────────────────────────────
interface DetectionProcess {
  id: string;
  allocation: number[];
  request: number[];
}

function detectDeadlock(processes: DetectionProcess[], available: number[]) {
  const n = processes.length;
  const m = RESOURCES.length;
  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSeq: string[] = [];

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const canFinish = processes[i].request.every((r, j) => r <= work[j]);
        if (canFinish) {
          for (let j = 0; j < m; j++) work[j] += processes[i].allocation[j];
          finish[i] = true;
          safeSeq.push(processes[i].id);
          changed = true;
        }
      }
    }
  }

  const deadlocked = processes.filter((_, i) => !finish[i]).map((p) => p.id);
  return { deadlocked, safeSeq, isDeadlock: deadlocked.length > 0 };
}

// ─── Prevention (Banker's) ────────────────────────────────────────────────────
interface BankersProcess {
  id: string;
  allocation: number[];
  max: number[];
}

function runBankers(processes: BankersProcess[], available: number[]) {
  const n = processes.length;
  const m = RESOURCES.length;
  const need = processes.map((p) => p.max.map((mx, j) => Math.max(0, mx - p.allocation[j])));
  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSeq: string[] = [];

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        const canFinish = need[i].every((r, j) => r <= work[j]);
        if (canFinish) {
          for (let j = 0; j < m; j++) work[j] += processes[i].allocation[j];
          finish[i] = true;
          safeSeq.push(processes[i].id);
          changed = true;
        }
      }
    }
  }

  const isSafe = finish.every(Boolean);
  return { isSafe, safeSeq, need };
}

const COLORS = [
  "bg-cyan-500", "bg-blue-500", "bg-purple-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-indigo-500", "bg-teal-500",
];

function ResourceInput({ values, onChange }: { values: number[]; onChange: (idx: number, val: string) => void }) {
  return (
    <div className="flex gap-1">
      {RESOURCES.map((r, j) => (
        <div key={r} className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-[10px] text-slate-400">{r}</span>
          <input
            type="number" min={0} value={values[j]}
            onChange={(e) => onChange(j, e.target.value)}
            className="w-12 bg-transparent border border-slate-200 dark:border-white/10
              rounded-lg px-1.5 py-1 text-slate-900 dark:text-white text-xs text-center
              focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500"
          />
        </div>
      ))}
    </div>
  );
}

export default function Deadlock() {
  const [selected, setSelected] = useState<Strategy>("Detection");

  // ── Detection state ──
  const [detProcs, setDetProcs] = useState<DetectionProcess[]>([
    { id: "P0", allocation: [0, 1, 0], request: [0, 0, 0] },
    { id: "P1", allocation: [2, 0, 0], request: [2, 0, 2] },
    { id: "P2", allocation: [3, 0, 3], request: [0, 0, 0] },
    { id: "P3", allocation: [2, 1, 1], request: [1, 0, 0] },
    { id: "P4", allocation: [0, 0, 2], request: [0, 0, 2] },
  ]);
  const [detAvail, setDetAvail] = useState<number[]>([0, 0, 0]);

  // ── Prevention state ──
  const [bankProcs, setBankProcs] = useState<BankersProcess[]>([
    { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3] },
    { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2] },
    { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2] },
    { id: "P3", allocation: [2, 1, 1], max: [2, 2, 2] },
    { id: "P4", allocation: [0, 0, 2], max: [4, 3, 3] },
  ]);
  const [bankAvail, setBankAvail] = useState<number[]>([3, 3, 2]);

  // ── Recovery state ──
  const [recoveryAction, setRecoveryAction] = useState<Record<string, "terminate" | "preempt" | null>>({});

  // Compute results
  const detResult = detectDeadlock(detProcs, detAvail);
  const bankResult = runBankers(bankProcs, bankAvail);
  const bankNeed = bankResult.need;

  // ── Detection handlers ──
  function updateDetProc(i: number, field: "allocation" | "request", j: number, val: string) {
    setDetProcs((prev) => prev.map((p, idx) => {
      if (idx !== i) return p;
      const arr = [...p[field]];
      arr[j] = Number(val) || 0;
      return { ...p, [field]: arr };
    }));
  }
  function addDetProc() {
    setDetProcs((prev) => [...prev, { id: `P${prev.length}`, allocation: [0, 0, 0], request: [0, 0, 0] }]);
  }
  function removeDetProc(i: number) {
    if (detProcs.length <= 1) return;
    setDetProcs((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── Banker handlers ──
  function updateBankProc(i: number, field: "allocation" | "max", j: number, val: string) {
    setBankProcs((prev) => prev.map((p, idx) => {
      if (idx !== i) return p;
      const arr = [...p[field]];
      arr[j] = Number(val) || 0;
      return { ...p, [field]: arr };
    }));
  }
  function addBankProc() {
    setBankProcs((prev) => [...prev, { id: `P${prev.length}`, allocation: [0, 0, 0], max: [0, 0, 0] }]);
  }
  function removeBankProc(i: number) {
    if (bankProcs.length <= 1) return;
    setBankProcs((prev) => prev.filter((_, idx) => idx !== i));
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
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          SIMULATOR · LIVE
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">⛓️</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
            Deadlock
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Simulate deadlock detection, prevention using Banker's Algorithm, and recovery strategies
        </p>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">

        {/* Left panel */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
              Strategies
            </p>
            <div className="flex flex-col gap-1">
              {(Object.keys(strategyInfo) as Strategy[]).map((s) => (
                <button key={s} onClick={() => setSelected(s)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${selected === s
                      ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                    }`}>
                  {strategyInfo[s].label.replace(" (Banker's Algorithm)", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Description */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{strategyInfo[selected].label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{strategyInfo[selected].description}</p>
          </div>

          {/* ── DETECTION ── */}
          {selected === "Detection" && (
            <>
              {/* Available */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Available Resources
                </p>
                <ResourceInput values={detAvail} onChange={(j, v) => {
                  const arr = [...detAvail]; arr[j] = Number(v) || 0; setDetAvail(arr);
                }} />
              </div>

              {/* Process table */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Allocation & Request Table
                  </p>
                  <button onClick={addDetProc}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                      bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">
                    + Add
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/8">
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Process</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">
                          Allocation (A B C)
                        </th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">
                          Request (A B C)
                        </th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {detProcs.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-3">
                            <input value={p.id} onChange={(e) => setDetProcs((prev) => prev.map((x, idx) => idx === i ? { ...x, id: e.target.value } : x))}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10
                                rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-3">
                            <ResourceInput values={p.allocation} onChange={(j, v) => updateDetProc(i, "allocation", j, v)} />
                          </td>
                          <td className="py-2 px-3">
                            <ResourceInput values={p.request} onChange={(j, v) => updateDetProc(i, "request", j, v)} />
                          </td>
                          <td className="py-2 px-1">
                            <button onClick={() => removeDetProc(i)}
                              className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
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

              {/* Detection result */}
              <div className={`rounded-2xl border backdrop-blur-xl p-5
                ${detResult.isDeadlock
                  ? "border-rose-300/50 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/20"
                  : "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{detResult.isDeadlock ? "🔴" : "🟢"}</span>
                  <h3 className={`font-bold text-lg ${detResult.isDeadlock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {detResult.isDeadlock ? "Deadlock Detected!" : "No Deadlock — Safe State"}
                  </h3>
                </div>
                {detResult.isDeadlock ? (
                  <div>
                    <p className="text-sm text-rose-600 dark:text-rose-400 mb-2 font-mono">
                      Deadlocked processes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detResult.deadlocked.map((pid) => (
                        <span key={pid} className="px-3 py-1 rounded-full text-xs font-mono font-bold
                          bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-400/30">
                          {pid}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2 font-mono">Safe sequence:</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {detResult.safeSeq.map((pid, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold
                            bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                            {pid}
                          </span>
                          {i < detResult.safeSeq.length - 1 && <span className="text-slate-400">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wait-for graph */}
              {detResult.isDeadlock && (
                <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                  bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                    Wait-For Graph
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {detProcs.map((p, i) => {
                      const isDeadlocked = detResult.deadlocked.includes(p.id);
                      const waitingFor = detProcs.filter((other, j) =>
                        j !== i &&
                        p.request.some((r, k) => r > 0 && other.allocation[k] > 0)
                      );
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 text-xs font-mono min-w-[120px]
                          ${isDeadlocked
                            ? "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}>
                          <div className="font-bold mb-1">{p.id} {isDeadlocked ? "🔴" : "🟢"}</div>
                          {waitingFor.length > 0 ? (
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              waits for: {waitingFor.map(w => w.id).join(", ")}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[11px]">not waiting</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PREVENTION (BANKER'S) ── */}
          {selected === "Prevention" && (
            <>
              {/* Available */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Available Resources
                </p>
                <ResourceInput values={bankAvail} onChange={(j, v) => {
                  const arr = [...bankAvail]; arr[j] = Number(v) || 0; setBankAvail(arr);
                }} />
              </div>

              {/* Banker's table */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Banker's Algorithm Table
                  </p>
                  <button onClick={addBankProc}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                      bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">
                    + Add
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/8">
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Process</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Allocation (A B C)</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Max (A B C)</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-cyan-500 uppercase tracking-wider">Need (A B C)</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {bankProcs.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-3">
                            <input value={p.id} onChange={(e) => setBankProcs((prev) => prev.map((x, idx) => idx === i ? { ...x, id: e.target.value } : x))}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10
                                rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-3">
                            <ResourceInput values={p.allocation} onChange={(j, v) => updateBankProc(i, "allocation", j, v)} />
                          </td>
                          <td className="py-2 px-3">
                            <ResourceInput values={p.max} onChange={(j, v) => updateBankProc(i, "max", j, v)} />
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              {bankNeed[i]?.map((n, j) => (
                                <span key={j} className="w-12 text-center text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 py-1">
                                  {n}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-1">
                            <button onClick={() => removeBankProc(i)}
                              className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 mt-2 px-3">
                    * Need = Max − Allocation (auto-calculated)
                  </p>
                </div>
              </div>

              {/* Banker's result */}
              <div className={`rounded-2xl border backdrop-blur-xl p-5
                ${bankResult.isSafe
                  ? "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/20"
                  : "border-rose-300/50 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{bankResult.isSafe ? "🟢" : "🔴"}</span>
                  <h3 className={`font-bold text-lg ${bankResult.isSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {bankResult.isSafe ? "Safe State — No Deadlock" : "Unsafe State — Deadlock Risk!"}
                  </h3>
                </div>
                {bankResult.isSafe ? (
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2 font-mono">Safe sequence:</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {bankResult.safeSeq.map((pid, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold
                            bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                            {pid}
                          </span>
                          {i < bankResult.safeSeq.length - 1 && <span className="text-slate-400">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-rose-500 dark:text-rose-400 font-mono">
                    No safe sequence exists. The system cannot guarantee all processes will complete.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── RECOVERY ── */}
          {selected === "Recovery" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Recovery Strategies
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { key: "terminate", icon: "🗑️", title: "Process Termination", desc: "Abort one or more deadlocked processes to break the circular wait. Resources held by terminated processes are released back to the system." },
                    { key: "preempt", icon: "⚡", title: "Resource Preemption", desc: "Forcibly take resources from a process and allocate them to another. The preempted process is rolled back to a safe state and restarted later." },
                  ].map((s) => (
                    <div key={s.key} className="rounded-xl border border-slate-200 dark:border-white/8
                      bg-slate-50/50 dark:bg-white/3 p-4">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{s.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Re-run detection to show deadlocked processes */}
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Apply Recovery (uses Detection data)
                </p>
                {detResult.deadlocked.length === 0 ? (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
                    <span>🟢</span> No deadlocked processes found. Go to Detection tab to configure.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {detResult.deadlocked.map((pid, i) => (
                      <div key={pid} className="flex items-center justify-between rounded-xl border
                        border-rose-300/40 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${COLORS[i % COLORS.length]}`}>
                            {pid}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{pid}</p>
                            <p className="text-xs text-rose-500 dark:text-rose-400 font-mono">Deadlocked</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRecoveryAction((prev) => ({ ...prev, [pid]: prev[pid] === "terminate" ? null : "terminate" }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all
                              ${recoveryAction[pid] === "terminate"
                                ? "bg-rose-500 text-white"
                                : "border border-rose-400/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"}`}>
                            🗑️ Terminate
                          </button>
                          <button
                            onClick={() => setRecoveryAction((prev) => ({ ...prev, [pid]: prev[pid] === "preempt" ? null : "preempt" }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all
                              ${recoveryAction[pid] === "preempt"
                                ? "bg-amber-500 text-white"
                                : "border border-amber-400/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/10"}`}>
                            ⚡ Preempt
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Recovery summary */}
                    {Object.values(recoveryAction).some(Boolean) && (
                      <div className="rounded-xl border border-cyan-400/30 dark:border-cyan-500/20
                        bg-cyan-50/50 dark:bg-cyan-950/10 px-4 py-3 mt-2">
                        <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">
                          Recovery Plan
                        </p>
                        {Object.entries(recoveryAction).filter(([, v]) => v).map(([pid, action]) => (
                          <p key={pid} className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                            {action === "terminate"
                              ? `→ ${pid} will be terminated. Its resources are released.`
                              : `→ ${pid} resources will be preempted and process rolled back.`}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
