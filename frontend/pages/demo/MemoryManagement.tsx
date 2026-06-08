"use client";

import { useState } from "react";
import Link from "next/link";

type Algorithm = "FirstFit" | "BestFit" | "WorstFit";

const algorithmInfo: Record<Algorithm, { label: string; description: string }> = {
  FirstFit: {
    label: "First Fit",
    description: "Allocates the first memory block that is large enough to fit the process. Fast but can cause fragmentation at the start of memory.",
  },
  BestFit: {
    label: "Best Fit",
    description: "Allocates the smallest block that is large enough for the process. Reduces wasted space but may create many tiny unusable holes.",
  },
  WorstFit: {
    label: "Worst Fit",
    description: "Allocates the largest available block to the process. Leaves bigger remainders but can quickly use up large blocks.",
  },
};

interface MemoryBlock {
  id: string;
  size: number | string;
}

interface Process {
  id: string;
  size: number | string;
}

interface AllocationResult {
  blockId: string;
  blockSize: number;
  processId: string;
  processSize: number;
  remaining: number;
  allocated: boolean;
}

interface ComputationStep {
  processId: string;
  processSize: number;
  checkedBlocks: string[];
  selectedBlock: string;
  remainingBefore: number;
  remainingAfter: number;
}

interface MemoryBlockResult {
  id: string;
  totalSize: number;
  segments: { type: "allocated" | "free"; size: number; processId?: string }[];
}

function allocate(
  algo: Algorithm,
  blocks: MemoryBlock[],
  processes: Process[]
): { results: AllocationResult[]; memoryMap: MemoryBlockResult[]; computations: ComputationStep[]; } {
  const validBlocks = blocks.filter((b) => b.id && Number(b.size) > 0);
  const validProcs = processes.filter((p) => p.id && Number(p.size) > 0);

  if (validBlocks.length === 0 || validProcs.length === 0)
    return { results: [], memoryMap: [], computations: [] };

  // block state
  const blockState = validBlocks.map((b) => ({
    id: b.id,
    total: Number(b.size),
    remaining: Number(b.size),
    allocations: [] as { processId: string; size: number }[],
  }));

  const results: AllocationResult[] = [];
  const computations: ComputationStep[] = [];

  for (const proc of validProcs) {
    const pSize = Number(proc.size);
    const available = blockState.filter((b) => b.remaining >= pSize);

    const checkedBlocks = available.map(
      (b) => `${b.id}(${b.remaining}KB)`
    )

    let chosen: typeof blockState[0] | null = null;

    if (algo === "FirstFit") {
      chosen = available[0] ?? null;
    } else if (algo === "BestFit") {
      chosen = [...available].sort((a, b) => a.remaining - b.remaining)[0] ?? null;
    } else if (algo === "WorstFit") {
      chosen = [...available].sort((a, b) => b.remaining - a.remaining)[0] ?? null;
    }

    if (chosen) {
      const before = chosen.remaining;

      chosen.allocations.push({ processId: proc.id, size: pSize });
      chosen.remaining -= pSize;

      computations.push({
        processId: proc.id,
        processSize: pSize,
        checkedBlocks,
        selectedBlock: chosen.id,
        remainingBefore: before,
        remainingAfter: chosen.remaining,
      });

      results.push({
        blockId: chosen.id,
        blockSize: chosen.total,
        processId: proc.id,
        processSize: pSize,
        remaining: chosen.remaining,
        allocated: true,
      });
    } else {
      results.push({
        blockId: "—",
        blockSize: 0,
        processId: proc.id,
        processSize: pSize,
        remaining: 0,
        allocated: false,
      });

      computations.push({
        processId: proc.id,
        processSize: pSize,
        checkedBlocks,
        selectedBlock: "None",
        remainingBefore: 0,
        remainingAfter: 0,
      })
    }
  }

  // build memory map
  const memoryMap: MemoryBlockResult[] = blockState.map((b) => {
    const segments: MemoryBlockResult["segments"] = [];
    for (const alloc of b.allocations) {
      segments.push({ type: "allocated", size: alloc.size, processId: alloc.processId });
    }
    if (b.remaining > 0) {
      segments.push({ type: "free", size: b.remaining });
    }
    return { id: b.id, totalSize: b.total, segments };
  });

  return { results, memoryMap, computations };
}

const COLORS = [
  "bg-cyan-500", "bg-blue-500", "bg-purple-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-indigo-500", "bg-teal-500",
];
const TEXT_COLORS = [
  "text-cyan-400", "text-blue-400", "text-purple-400", "text-emerald-400",
  "text-rose-400", "text-amber-400", "text-indigo-400", "text-teal-400",
];

export default function MemoryManagement() {
  const [selected, setSelected] = useState<Algorithm>("FirstFit");
  const [memBlocks, setMemBlocks] = useState<MemoryBlock[]>([
    { id: "B1", size: "0" },
  ]);
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", size: "0" },
  ]);

  const { results, memoryMap, computations } = allocate(selected, memBlocks, processes);
  const allProcessIds = results.filter((r) => r.allocated).map((r) => r.processId);

  function updateBlock(i: number, field: keyof MemoryBlock, value: string) {
    setMemBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  }
  function updateProcess(i: number, field: keyof Process, value: string) {
    setProcesses((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }
  function addBlock() {
    setMemBlocks((prev) => [...prev, { id: `B${prev.length + 1}`, size: "0" }]);
  }
  function addProcess() {
    setProcesses((prev) => [...prev, { id: `P${prev.length + 1}`, size: "0" }]);
  }
  function removeBlock(i: number) {
    if (memBlocks.length <= 1) return;
    setMemBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function removeProcess(i: number) {
    if (processes.length <= 1) return;
    setProcesses((prev) => prev.filter((_, idx) => idx !== i));
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
        <div className="text-5xl mb-4">💾</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">
            Memory Management
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Choose an algorithm, define memory blocks and processes, and visualize how memory gets allocated
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
                <button
                  key={algo}
                  onClick={() => setSelected(algo)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${selected === algo
                      ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                    }`}
                >
                  {algorithmInfo[algo].label}
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
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
              {algorithmInfo[selected].label}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {algorithmInfo[selected].description}
            </p>
          </div>

          {/* tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Memory Blocks table */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
              bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Memory Blocks
                </p>
                <button onClick={addBlock}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                    bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400
                    border border-cyan-400/30 dark:border-cyan-500/25 hover:bg-cyan-500/20 transition-colors">
                  + Add
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/8">
                    <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Block ID</th>
                    <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Size (KB)</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {memBlocks.map((b, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                      <td className="py-2 px-2">
                        <input value={b.id} onChange={(e) => updateBlock(i, "id", e.target.value)}
                          className="w-14 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min={1} value={b.size}
                          onChange={(e) => updateBlock(i, "size", e.target.value)}
                          className="w-20 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-1">
                        <button onClick={() => removeBlock(i)}
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

            {/* Processes table */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
              bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Processes
                </p>
                <button onClick={addProcess}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                    bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400
                    border border-cyan-400/30 dark:border-cyan-500/25 hover:bg-cyan-500/20 transition-colors">
                  + Add
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/8">
                    <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Process ID</th>
                    <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Size (KB)</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                      <td className="py-2 px-2">
                        <input value={p.id} onChange={(e) => updateProcess(i, "id", e.target.value)}
                          className="w-14 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min={1} value={p.size}
                          onChange={(e) => updateProcess(i, "size", e.target.value)}
                          className="w-20 bg-transparent border border-slate-200 dark:border-white/10
                            rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs
                            focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                      </td>
                      <td className="py-2 px-1">
                        <button onClick={() => removeProcess(i)}
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

          {/* Allocation Result Table */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Allocation Result
            </p>
            {results.length === 0 ? (
              <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in both tables to see results
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/8">
                      {["Process ID", "Process Size (KB)", "Allocated Block", "Block Size (KB)", "Remaining (KB)", "Status"].map((col) => (
                        <th key={col} className="text-left py-2 px-3 font-mono text-xs
                          text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                        <td className="py-2 px-3 text-slate-900 dark:text-white font-mono text-xs">{r.processId}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.processSize}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{r.blockId}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.blockSize : "—"}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.remaining : "—"}</td>
                        <td className="py-2 px-3">
                          {r.allocated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                              bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                              ✓ Allocated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                              bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-400/30">
                              ✗ Not Allocated
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Memory Block Diagram */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
            bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Memory Map
            </p>
            {memoryMap.length === 0 ? (
              <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono">
                <span className="text-cyan-500 mr-2">&gt;</span> Fill in both tables to see the memory map
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {memoryMap.map((block) => {
                  const totalSize = block.totalSize;
                  return (
                    <div key={block.id} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 w-8 shrink-0">
                        {block.id}
                      </span>
                      <div className="flex-1 flex h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/8">
                        {block.segments.map((seg, i) => {
                          const width = (seg.size / totalSize) * 100;
                          const pidIdx = seg.processId ? allProcessIds.indexOf(seg.processId) : -1;
                          return (
                            <div
                              key={i}
                              style={{ width: `${width}%` }}
                              className={`flex items-center justify-center text-xs font-bold shrink-0
                                ${seg.type === "allocated"
                                  ? `${COLORS[pidIdx % COLORS.length]} text-white`
                                  : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600"
                                }`}
                            >
                              {seg.type === "allocated" ? seg.processId : `${seg.size}KB free`}
                            </div>
                          );
                        })}
                      </div>
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right">
                        {block.totalSize} KB
                      </span>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
                  {allProcessIds.map((pid, i) => (
                    <div key={pid} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-sm ${COLORS[i % COLORS.length]}`} />
                      <span className={`text-xs font-mono ${TEXT_COLORS[i % TEXT_COLORS.length]}`}>{pid}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10" />
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Free</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
