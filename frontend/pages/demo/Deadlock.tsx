"use client";

import ExportButton from "@/backend/save_and_export/ExportButton";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggleSwitch from "../../ui/buttons/ThemeToggleSwitch";

type Strategy = "Detection" | "Prevention" | "Recovery";

const strategyInfo: Record<Strategy, { label: string; description: string }> = {
  Detection: { label: "Deadlock Detection", description: "Periodically checks the system for deadlock by examining resource allocation and process requests. Uses the Wait-For Graph to detect circular waits." },
  Prevention: { label: "Deadlock Prevention (Banker's Algorithm)", description: "Ensures the system never enters an unsafe state by simulating resource allocation before granting requests. A safe sequence means no deadlock is possible." },
  Recovery: { label: "Deadlock Recovery", description: "Once a deadlock is detected, the OS can recover by terminating one or more processes or by preempting resources from a process to break the cycle." },
};

const RESOURCES = ["A", "B", "C"];

interface DetectionProcess { id: string; allocation: number[]; request: number[]; }
interface BankersProcess { id: string; allocation: number[]; max: number[]; }

// ── Example data ──
const EXAMPLE_DET_PROCS: DetectionProcess[] = [
  { id: "P0", allocation: [1, 0, 1], request: [0, 1, 0] },
  { id: "P1", allocation: [2, 1, 0], request: [1, 0, 1] },
  { id: "P2", allocation: [1, 1, 1], request: [0, 0, 1] },
  { id: "P3", allocation: [0, 0, 2], request: [1, 1, 0] },
];
const EXAMPLE_DET_AVAIL = [1, 1, 1];

const EXAMPLE_BANK_PROCS: BankersProcess[] = [
  { id: "P0", allocation: [1, 0, 0], max: [3, 2, 2] },
  { id: "P1", allocation: [2, 0, 0], max: [6, 1, 3] },
  { id: "P2", allocation: [3, 0, 2], max: [9, 1, 2] },
  { id: "P3", allocation: [2, 1, 1], max: [2, 2, 2] },
  { id: "P4", allocation: [0, 0, 2], max: [4, 3, 3] },
];
const EXAMPLE_BANK_AVAIL = [3, 2, 2];

function detectDeadlock(processes: DetectionProcess[], available: number[]) {
  const n = processes.length, m = RESOURCES.length;
  const work = [...available], finish = Array(n).fill(false);
  const safeSeq: string[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && processes[i].request.every((r, j) => r <= work[j])) {
        for (let j = 0; j < m; j++) work[j] += processes[i].allocation[j];
        finish[i] = true; safeSeq.push(processes[i].id); changed = true;
      }
    }
  }
  const deadlocked = processes.filter((_, i) => !finish[i]).map((p) => p.id);
  return { deadlocked, safeSeq, isDeadlock: deadlocked.length > 0 };
}

function runBankers(processes: BankersProcess[], available: number[]) {
  const n = processes.length, m = RESOURCES.length;
  const need = processes.map((p) => p.max.map((mx, j) => Math.max(0, mx - p.allocation[j])));
  const work = [...available], finish = Array(n).fill(false);
  const safeSeq: string[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && need[i].every((r, j) => r <= work[j])) {
        for (let j = 0; j < m; j++) work[j] += processes[i].allocation[j];
        finish[i] = true; safeSeq.push(processes[i].id); changed = true;
      }
    }
  }
  return { isSafe: finish.every(Boolean), safeSeq, need };
}

const COLORS = ["bg-cyan-500","bg-blue-500","bg-purple-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-indigo-500","bg-teal-500"];

function ResourceInput({ values, onChange, tableKey, row, field }: {
  values: number[]; onChange: (idx: number, val: string) => void;
  tableKey?: string; row?: number; field?: string;
}) {
  return (
    <div className="flex gap-1">
      {RESOURCES.map((r, j) => (
        <div key={r} className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-[10px] text-slate-400">{r}</span>
          <input type="number" min={0} value={values[j]} onChange={(e) => onChange(j, e.target.value)}
            data-table={tableKey} data-row={row} data-field={`${field}-${j}`}
            className="w-12 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-1.5 py-1 text-slate-900 dark:text-white text-xs text-center focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
        </div>
      ))}
    </div>
  );
}

// ── Read-only resource display for export snapshot ──
function ResourceReadOnly({ values }: { values: number[] }) {
  return (
    <div className="flex gap-1">
      {RESOURCES.map((r, j) => (
        <div key={r} className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-[10px] text-slate-400">{r}</span>
          <span className="w-12 text-center text-xs font-mono border border-slate-200 dark:border-white/10 rounded-lg px-1.5 py-1 text-slate-900 dark:text-white">{values[j]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Deadlock() {
  // ── Adjustable vertical (y-axis) text positions for the EXPORTED PDF snapshot only ──
  // Increase a value to push that text DOWN, decrease to push it UP.
  const EXPORT_TEXT_Y = {
    waitForLabel: 28,   // "P0" / "P1" ... label inside each Wait-For Graph box
    waitForDetail: 56,  // "waits for: ..." / "not waiting" line inside each Wait-For Graph box
    safePill: 29,       // process id text inside the Safe State / Unsafe State pills
    safeArrow: 29,       // "→" arrow glyph between the Safe State / Unsafe State pills
    recoveryCircle: 1, // process id text inside the colored circle in "Recovery Actions Applied"
  };

  const [selected, setSelected] = useState<Strategy>("Detection");
  const [detProcs, setDetProcs] = useState<DetectionProcess[]>([]);
  const [detAvail, setDetAvail] = useState<number[]>([0,0,0]);
  const [bankProcs, setBankProcs] = useState<BankersProcess[]>([]);
  const [bankAvail, setBankAvail] = useState<number[]>([0,0,0]);
  const [recoveryAction, setRecoveryAction] = useState<Record<string, "terminate"|"preempt"|null>>({});
  const [isDark, setIsDark] = useState(true);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);
  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) { html.classList.remove("dark"); setIsDark(false); }
    else { html.classList.add("dark"); setIsDark(true); }
  }

  // ── Load Example & Clear All ──
  function loadExample() {
    setDetProcs(EXAMPLE_DET_PROCS.map(p => ({ ...p, allocation: [...p.allocation], request: [...p.request] })));
    setDetAvail([...EXAMPLE_DET_AVAIL]);
    setBankProcs(EXAMPLE_BANK_PROCS.map(p => ({ ...p, allocation: [...p.allocation], max: [...p.max] })));
    setBankAvail([...EXAMPLE_BANK_AVAIL]);
    setRecoveryAction({});
  }

  function clearAll() {
    setDetProcs([]);
    setDetAvail([0, 0, 0]);
    setBankProcs([]);
    setBankAvail([0, 0, 0]);
    setRecoveryAction({});
  }

  const detResult = detectDeadlock(detProcs, detAvail);
  const bankResult = runBankers(bankProcs, bankAvail);

  function updateDetProc(i: number, field: "allocation"|"request", j: number, val: string) {
    setDetProcs((prev: DetectionProcess[]) => prev.map((p: DetectionProcess, idx: number) => {
      if (idx !== i) return p;
      const arr = [...p[field]]; arr[j] = Number(val) || 0; return { ...p, [field]: arr };
    }));
  }
  function addDetProc() { setDetProcs((prev: DetectionProcess[]) => [...prev, { id: `P${prev.length}`, allocation: [0,0,0], request: [0,0,0] }]); }
  function removeDetProc(i: number) { if (detProcs.length <= 1) return; setDetProcs((prev: DetectionProcess[]) => prev.filter((_: DetectionProcess, idx: number) => idx !== i)); setRecoveryAction({}); }
  function addBankProc() { setBankProcs((prev: BankersProcess[]) => [...prev, { id: `P${prev.length}`, allocation: [0,0,0], max: [0,0,0] }]); }
  function removeBankProc(i: number) { if (bankProcs.length <= 1) return; setBankProcs((prev: BankersProcess[]) => prev.filter((_: BankersProcess, idx: number) => idx !== i)); }

  function updateBankProc(i: number, field: "allocation"|"max", j: number, val: string) {
    setBankProcs((prev: BankersProcess[]) => prev.map((p: BankersProcess, idx: number) => {
      if (idx !== i) return p;
      const arr = [...p[field]]; arr[j] = Number(val) || 0; return { ...p, [field]: arr };
    }));
  }
  function focusNextDet(i: number, field: string) {
    if (i + 1 >= detProcs.length) return;
    setTimeout(() => { const el = document.querySelector<HTMLInputElement>(`[data-table="det"][data-row="${i+1}"][data-field="${field}"]`); el?.focus(); el?.select(); }, 50);
  }
  function focusNextBank(i: number, field: string) {
    if (i + 1 >= bankProcs.length) return;
    setTimeout(() => { const el = document.querySelector<HTMLInputElement>(`[data-table="bank"][data-row="${i+1}"][data-field="${field}"]`); el?.focus(); el?.select(); }, 50);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8] dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link href="/#demo" className="inline-flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          {/* Load Example button */}
          <button
            onClick={loadExample}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Load Example
          </button>

          {/* Clear All button */}
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border border-rose-400/50 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>

          <ExportButton
            targetId="deadlock-export-snapshot"
            title="Deadlock Simulation"
            subtitle={`All Strategies`}
          />
          <ThemeToggleSwitch isDark={isDark} onToggle={toggleTheme} small />
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />SIMULATOR · LIVE
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">⛓️</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">Deadlock</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Simulate deadlock detection, prevention using Banker&apos;s Algorithm, and recovery strategies
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">
        {/* Left panel */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Strategies</p>
            <div className="flex flex-col gap-1">
              {(Object.keys(strategyInfo) as Strategy[]).map((s) => (
                <button key={s} onClick={() => setSelected(s)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${selected === s ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"}`}>
                  {strategyInfo[s].label.replace(" (Banker&apos;s Algorithm)","")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{strategyInfo[selected].label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{strategyInfo[selected].description}</p>
          </div>

          {/* DETECTION */}
          {selected === "Detection" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Available Resources</p>
                <ResourceInput values={detAvail} onChange={(j, v) => { const arr = [...detAvail]; arr[j] = Number(v)||0; setDetAvail(arr); }} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Allocation & Request Table</p>
                  <button onClick={addDetProc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/8">
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Process</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Allocation (A B C)</th>
                        <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Request (A B C)</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {detProcs.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-3">
                            <input value={p.id} onChange={(e) => setDetProcs((prev: DetectionProcess[]) => prev.map((x: DetectionProcess, idx: number) => idx === i ? { ...x, id: e.target.value } : x))}
                              data-table="det" data-row={i} data-field="id"
                              onKeyDown={(e) => e.key === "Enter" && focusNextDet(i, "id")}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-3"><ResourceInput values={p.allocation} onChange={(j, v) => updateDetProc(i, "allocation", j, v)} tableKey="det" row={i} field="alloc" /></td>
                          <td className="py-2 px-3"><ResourceInput values={p.request} onChange={(j, v) => updateDetProc(i, "request", j, v)} tableKey="det" row={i} field="req" /></td>
                          <td className="py-2 px-1"><button onClick={() => removeDetProc(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={`rounded-2xl border backdrop-blur-xl p-5 ${detResult.isDeadlock ? "border-rose-300/50 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/20" : "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{detResult.isDeadlock ? "🔴" : "🟢"}</span>
                  <h3 className={`font-bold text-lg ${detResult.isDeadlock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{detResult.isDeadlock ? "Deadlock Detected!" : "No Deadlock — Safe State"}</h3>
                </div>
                {detResult.isDeadlock ? (
                  <div className="flex flex-wrap gap-2">
                    {detResult.deadlocked.map((pid) => (<span key={pid} className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-400/30">{pid}</span>))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1">
                    {detResult.safeSeq.map((pid, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">{pid}</span>
                        {i < detResult.safeSeq.length - 1 && <span className="text-slate-400">→</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {detResult.isDeadlock && (
                <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Wait-For Graph</p>
                  <div className="flex flex-wrap gap-3">
                    {detProcs.map((p, i) => {
                      const isDeadlocked = detResult.deadlocked.includes(p.id);
                      const waitingFor = detProcs.filter((other, j) => j !== i && p.request.some((r, k) => r > 0 && other.allocation[k] > 0));
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 text-xs font-mono min-w-[120px] ${isDeadlocked ? "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                          <div className="font-bold mb-1">{p.id} {isDeadlocked ? "🔴" : "🟢"}</div>
                          {waitingFor.length > 0 ? <div className="text-slate-500 dark:text-slate-400 text-[11px]">waits for: {waitingFor.map(w => w.id).join(", ")}</div> : <div className="text-slate-400 text-[11px]">not waiting</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PREVENTION */}
          {selected === "Prevention" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Available Resources</p>
                <ResourceInput values={bankAvail} onChange={(j, v) => { const arr = [...bankAvail]; arr[j] = Number(v)||0; setBankAvail(arr); }} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Banker&apos; Algorithm Table</p>
                  <button onClick={addBankProc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add</button>
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
                            <input value={p.id} onChange={(e) => setBankProcs((prev: BankersProcess[]) => prev.map((x: BankersProcess, idx: number) => idx === i ? { ...x, id: e.target.value } : x))}
                              data-table="bank" data-row={i} data-field="id"
                              onKeyDown={(e) => e.key === "Enter" && focusNextBank(i, "id")}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-3"><ResourceInput values={p.allocation} onChange={(j, v) => updateBankProc(i, "allocation", j, v)} tableKey="bank" row={i} field="alloc" /></td>
                          <td className="py-2 px-3"><ResourceInput values={p.max} onChange={(j, v) => updateBankProc(i, "max", j, v)} tableKey="bank" row={i} field="max" /></td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              {bankResult.need[i]?.map((n, j) => (<span key={j} className="w-12 text-center text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 py-1">{n}</span>))}
                            </div>
                          </td>
                          <td className="py-2 px-1"><button onClick={() => removeBankProc(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 mt-2 px-3">* Need = Max − Allocation (auto-calculated)</p>
                </div>
              </div>
              <div className={`rounded-2xl border backdrop-blur-xl p-5 ${bankResult.isSafe ? "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/20" : "border-rose-300/50 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/20"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{bankResult.isSafe ? "🟢" : "🔴"}</span>
                  <h3 className={`font-bold text-lg ${bankResult.isSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{bankResult.isSafe ? "Safe State — No Deadlock" : "Unsafe State — Deadlock Risk!"}</h3>
                </div>
                {bankResult.isSafe ? (
                  <div className="flex flex-wrap items-center gap-1">
                    {bankResult.safeSeq.map((pid, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">{pid}</span>
                        {i < bankResult.safeSeq.length - 1 && <span className="text-slate-400">→</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-rose-500 dark:text-rose-400 font-mono">No safe sequence exists. The system cannot guarantee all processes will complete.</p>
                )}
              </div>
            </>
          )}

          {/* RECOVERY */}
          {selected === "Recovery" && (
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
              <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Recovery Strategies</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { key: "terminate", icon: "🗑️", title: "Process Termination", desc: "Abort one or more deadlocked processes to break the circular wait. Resources held by terminated processes are released back to the system." },
                  { key: "preempt", icon: "⚡", title: "Resource Preemption", desc: "Forcibly take resources from a process and allocate them to another. The preempted process is rolled back to a safe state and restarted later." },
                ].map((s) => (
                  <div key={s.key} className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-white/3 p-4">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                  </div>
                ))}
              </div>
              <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Apply Recovery (uses Detection data)</p>
              {detResult.deadlocked.length === 0 ? (
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2"><span>🟢</span> No deadlocked processes found. Go to Detection tab to configure.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {detResult.deadlocked.map((pid, i) => (
                    <div key={pid} className="flex items-center justify-between rounded-xl border border-rose-300/40 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${COLORS[i % COLORS.length]}`}>{pid}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{pid}</p>
                          <p className="text-xs font-mono text-rose-700 dark:text-rose-400">Deadlocked</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setRecoveryAction((prev) => ({ ...prev, [pid]: prev[pid] === "terminate" ? null : "terminate" }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${recoveryAction[pid] === "terminate" ? "bg-rose-500 text-white" : "border border-rose-400/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"}`}>
                          🗑️ Terminate
                        </button>
                        <button onClick={() => setRecoveryAction((prev) => ({ ...prev, [pid]: prev[pid] === "preempt" ? null : "preempt" }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${recoveryAction[pid] === "preempt" ? "bg-amber-500 text-white" : "border border-amber-400/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/10"}`}>
                          ⚡ Preempt
                        </button>
                      </div>
                    </div>
                  ))}
                  {Object.values(recoveryAction).some(Boolean) && (
                    <div className="rounded-xl border border-cyan-400/30 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/10 px-4 py-3 mt-2">
                      <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">Recovery Plan</p>
                      {Object.entries(recoveryAction).filter(([, v]) => v).map(([pid, action]) => (
                        <p key={pid} className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                          {action === "terminate" ? `→ ${pid} will be terminated. Its resources are released.` : `→ ${pid} resources will be preempted and process rolled back.`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Hidden export snapshot ── */}
      <div
        id="deadlock-export-snapshot"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "900px",
          zIndex: -1,
          pointerEvents: "none",
          overflow: "visible",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: isDark ? "#020b18" : "#f0f6fa",
        }}
      >
        {/* Export title */}
        <div className="text-center pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="text-4xl mb-4">⛓️</div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Deadlock</h1>
        </div>

        {/* Detection snapshot */}
        <section className="flex flex-col gap-2">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{strategyInfo.Detection.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{strategyInfo.Detection.description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Available Resources</p>
            <ResourceReadOnly values={detAvail} />
          </div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Allocation & Request Table</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/8">
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Process</th>
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Allocation (A B C)</th>
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Request (A B C)</th>
                </tr>
              </thead>
              <tbody>
                {detProcs.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                    <td className="py-2 px-3"><span className="font-mono text-xs text-slate-900 dark:text-white">{p.id}</span></td>
                    <td className="py-2 px-3"><ResourceReadOnly values={p.allocation} /></td>
                    <td className="py-2 px-3"><ResourceReadOnly values={p.request} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`rounded-2xl border p-5 ${detResult.isDeadlock ? "border-rose-300/50 dark:border-rose-500/25 bg-rose-50/70 dark:bg-rose-950/20" : "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/20"}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{detResult.isDeadlock ? "🔴" : "🟢"}</span>
              <h3 className={`font-bold text-lg ${detResult.isDeadlock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{detResult.isDeadlock ? "Deadlock Detected!" : "No Deadlock — Safe State"}</h3>
            </div>
            {detResult.isDeadlock ? (
              <div className="flex flex-wrap gap-2">
                {detResult.deadlocked.map((pid) => (<span key={pid} className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-400/30">{pid}</span>))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {detResult.safeSeq.map((pid, i) => {
                  const label = String(pid);
                  const pillWidth = Math.max(64, label.length * 14 + 48);
                  const pillHeight = 48;
                  const isLast = i === detResult.safeSeq.length - 1;
                  const svgWidth = isLast ? pillWidth : pillWidth + 36;
                  return (
                    <svg key={pid} width={svgWidth} height={pillHeight} style={{ display: "block", overflow: "visible" }}>
                      <rect
                        x={0} y={0} width={pillWidth} height={pillHeight}
                        rx={pillHeight / 2} ry={pillHeight / 2}
                        fill="none"
                        stroke="rgb(52, 211, 153)"
                        strokeWidth={2}
                      />
                      <text
                        x={pillWidth / 2}
                        y={EXPORT_TEXT_Y.safePill}
                        textAnchor="middle"
                        fontSize="18"
                        fontFamily="monospace"
                        fontWeight="700"
                        fill="rgb(16, 185, 129)"
                      >
                        {label}
                      </text>
                      {!isLast && (
                        <text
                          x={pillWidth + 18}
                          y={EXPORT_TEXT_Y.safeArrow}
                          textAnchor="middle"
                          fontSize="20"
                          fontFamily="monospace"
                          fill="rgb(100, 116, 139)"
                        >
                          →
                        </text>
                      )}
                    </svg>
                  );
                })}
              </div>
            )}
          </div>
          {detResult.isDeadlock && (
            <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-[#020b18] p-8">
            <p className="font-mono text-[14px] tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase mb-8">
              Wait-For Graph
            </p>

            <div className="flex flex-wrap gap-4">
              {detProcs.map((p, i) => {
                const isDeadlocked = detResult.deadlocked.includes(p.id);

                const waitingFor = detProcs.filter(
                  (other, j) =>
                    j !== i &&
                    p.request.some(
                      (r, k) => r > 0 && other.allocation[k] > 0
                    )
                );

                const rose = "rgb(244, 63, 94)";
                const emerald = "rgb(52, 211, 153)";
                const slate = "rgb(100, 116, 139)";

                const waitForLabel = p.id;
                const waitForDetail = waitingFor.length > 0
                  ? `waits for: ${waitingFor.map((w) => w.id).join(", ")}`
                  : "not waiting";
                const waitForSvgWidth = Math.max(
                  220,
                  waitForLabel.length * 16 + 16,
                  waitForDetail.length * 8 + 16
                );

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl px-6 py-5"
                    style={{ border: `2px solid ${isDeadlocked ? rose : emerald}`, minWidth: 260 }}
                  >
                    <svg width={waitForSvgWidth} height={70} style={{ display: "block", overflow: "visible" }}>
                      <text
                        x={0}
                        y={EXPORT_TEXT_Y.waitForLabel}
                        textAnchor="start"
                        fontSize="20"
                        fontFamily="monospace"
                        fontWeight="700"
                        fill={isDeadlocked ? rose : emerald}
                      >
                        {waitForLabel}
                      </text>
                      <text
                        x={0}
                        y={EXPORT_TEXT_Y.waitForDetail}
                        textAnchor="start"
                        fontSize="14"
                        fontFamily="monospace"
                        fill={slate}
                      >
                        {waitForDetail}
                      </text>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </section>

        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
            marginTop: "32px",
            marginBottom: "0px",
          }}
        />

        {/* Prevention snapshot */}
        <section className="flex flex-col gap-2">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{strategyInfo.Prevention.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{strategyInfo.Prevention.description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Available Resources</p>
            <ResourceReadOnly values={bankAvail} />
          </div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Banker&apos;s Algorithm Table</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/8">
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Process</th>
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Allocation (A B C)</th>
                  <th className="text-left py-2 px-3 font-mono text-xs text-slate-400 uppercase tracking-wider">Max (A B C)</th>
                  <th className="text-left py-2 px-3 font-mono text-xs text-cyan-500 uppercase tracking-wider">Need (A B C)</th>
                </tr>
              </thead>
              <tbody>
                {bankProcs.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                    <td className="py-2 px-3"><span className="font-mono text-xs text-slate-900 dark:text-white">{p.id}</span></td>
                    <td className="py-2 px-3"><ResourceReadOnly values={p.allocation} /></td>
                    <td className="py-2 px-3"><ResourceReadOnly values={p.max} /></td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        {bankResult.need[i]?.map((n, j) => (<span key={j} className="w-12 text-center text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 py-1">{n}</span>))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 mt-2 px-3">* Need = Max − Allocation (auto-calculated)</p>
          </div>
          {/* Safe State / Unsafe Warning block, mirroring reference design */}
          <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-[#020b18] p-8">
            <div className="flex items-center gap-4 mb-6">
              
              <h3
                className="text-3xl font-bold"
                style={{ color: bankResult.isSafe ? "rgb(16, 185, 129)" : "rgb(225, 29, 72)" }}
              >
                {bankResult.isSafe ? "Safe State — No Deadlock" : "Unsafe State — Deadlock Risk!"}
              </h3>
            </div>

            {bankResult.isSafe ? (
              <div className="flex flex-wrap items-center gap-3">
                {bankResult.safeSeq.map((pid, i) => {
                  const label = String(pid);
                  const pillWidth = Math.max(64, label.length * 14 + 48);
                  const pillHeight = 48;
                  const isLast = i === bankResult.safeSeq.length - 1;
                  const svgWidth = isLast ? pillWidth : pillWidth + 36;
                  return (
                    <svg key={pid} width={svgWidth} height={pillHeight} style={{ display: "block", overflow: "visible" }}>
                      <rect
                        x={0} y={0} width={pillWidth} height={pillHeight}
                        rx={pillHeight / 2} ry={pillHeight / 2}
                        fill="none"
                        stroke="rgb(52, 211, 153)"
                        strokeWidth={2}
                      />
                      <text
                        x={pillWidth / 2}
                        y={EXPORT_TEXT_Y.safePill}
                        textAnchor="middle"
                        fontSize="18"
                        fontFamily="monospace"
                        fontWeight="700"
                        fill="rgb(16, 185, 129)"
                      >
                        {label}
                      </text>
                      {!isLast && (
                        <text
                          x={pillWidth + 18}
                          y={EXPORT_TEXT_Y.safeArrow}
                          textAnchor="middle"
                          fontSize="20"
                          fontFamily="monospace"
                          fill="rgb(100, 116, 139)"
                        >
                          →
                        </text>
                      )}
                    </svg>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {bankProcs.map((p, i) => {
                  const label = String(p.id);
                  const pillWidth = Math.max(64, label.length * 14 + 48);
                  const pillHeight = 48;
                  const isLast = i === bankProcs.length - 1;
                  const svgWidth = isLast ? pillWidth : pillWidth + 36;
                  return (
                    <svg key={p.id} width={svgWidth} height={pillHeight} style={{ display: "block", overflow: "visible" }}>
                      <rect
                        x={0} y={0} width={pillWidth} height={pillHeight}
                        rx={pillHeight / 2} ry={pillHeight / 2}
                        fill="none"
                        stroke="rgb(244, 63, 94)"
                        strokeWidth={2}
                      />
                      <text
                        x={pillWidth / 2}
                        y={EXPORT_TEXT_Y.safePill}
                        textAnchor="middle"
                        fontSize="18"
                        fontFamily="monospace"
                        fontWeight="700"
                        fill="rgb(225, 29, 72)"
                      >
                        {label}
                      </text>
                      {!isLast && (
                        <text
                          x={pillWidth + 18}
                          y={EXPORT_TEXT_Y.safeArrow}
                          textAnchor="middle"
                          fontSize="20"
                          fontFamily="monospace"
                          fill="rgb(100, 116, 139)"
                        >
                          →
                        </text>
                      )}
                    </svg>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
            marginTop: "32px",
            marginBottom: "32px",
          }}
        />

        {/* Recovery snapshot */}
        <section className="flex flex-col gap-2">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{strategyInfo.Recovery.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{strategyInfo.Recovery.description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Recovery Actions Applied</p>
            {detResult.deadlocked.length === 0 ? (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2"><span>🟢</span> No deadlocked processes found.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {detResult.deadlocked.map((pid) => (
                  <div key={pid} className="flex items-center justify-between rounded-xl border border-rose-300/40 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                      >
                        <span
                          className="text-xs font-bold font-mono"
                          style={{
                            color: "#ffffff",
                            lineHeight: 1,
                            display: "block",
                            position: "relative",
                            top: `${EXPORT_TEXT_Y.recoveryCircle}px`,
                          }}
                        >
                          {pid}
                        </span>
                      </span>
                      <p className="text-xs font-mono text-rose-700 dark:text-rose-400">Deadlocked</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-mono ${recoveryAction[pid] === "terminate" ? "bg-rose-500 text-white" : recoveryAction[pid] === "preempt" ? "bg-amber-100 text-amber-800 dark:bg-amber-500 dark:text-white" : "border border-slate-300 dark:border-white/10 text-slate-400"}`}>
                      {recoveryAction[pid] === "terminate" ? "🗑️ Terminate" : recoveryAction[pid] === "preempt" ? "⚡ Preempt" : "No action"}
                    </span>
                  </div>
                ))}
                {Object.values(recoveryAction).some(Boolean) && (
                  <div className="rounded-xl border border-cyan-400/30 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/10 px-4 py-3 mt-2">
                    <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">Recovery Plan</p>
                    {Object.entries(recoveryAction).filter(([, v]) => v).map(([pid, action]) => (
                      <p key={pid} className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                        {action === "terminate" ? `→ ${pid} will be terminated. Its resources are released.` : `→ ${pid} resources will be preempted and process rolled back.`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
