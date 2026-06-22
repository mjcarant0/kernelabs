"use client";

import ExportButton from "@/backend/save_and_export/ExportButton";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggleSwitch from "../../ui/buttons/ThemeToggleSwitch";

type Mode = "MFT" | "MVT";
type MFTAlgorithm = "FirstFit" | "BestFit" | "WorstFit";
type SchedulingAlgorithm = "FCFS" | "SJF" | "Priority" | "RoundRobin";
type AllocationPolicy = "FirstFit" | "BestFit" | "WorstFit";

const COLORS = ["bg-cyan-500","bg-blue-500","bg-purple-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-indigo-500","bg-teal-500"];
const TEXT_COLORS = ["text-cyan-400","text-blue-400","text-purple-400","text-emerald-400","text-rose-400","text-amber-400","text-indigo-400","text-teal-400"];
const COLOR_HEX = ["#06b6d4", "#3b82f6", "#a855f7", "#10b981", "#f43f5e", "#f59e0b", "#6366f1", "#14b8a6"];
const STATUS_PILL_TEXT_Y = 18;
const STATUS_PILL_HEIGHT = 28;
const mftAlgorithmInfo: Record<MFTAlgorithm, { label: string; description: string }> = {
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

interface MemoryBlock { id: string; size: number | string; }
interface MFTProcess { id: string; size: number | string; }

interface MFTAllocationResult {
  blockId: string; blockSize: number; processId: string;
  processSize: number; remaining: number; allocated: boolean;
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
  id: string; totalSize: number;
  segments: { type: "allocated" | "free"; size: number; processId?: string }[];
}

function mftAllocate(
  algo: MFTAlgorithm,
  blocks: MemoryBlock[],
  processes: MFTProcess[]
): { results: MFTAllocationResult[]; memoryMap: MemoryBlockResult[]; computations: ComputationStep[]; } {
  const validBlocks = blocks.filter((b) => b.id && Number(b.size) > 0);
  const validProcs = processes.filter((p) => p.id && Number(p.size) > 0);
  if (validBlocks.length === 0 || validProcs.length === 0) return { results: [], memoryMap: [], computations: [] };

  const blockState = validBlocks.map((b) => ({
    id: b.id, total: Number(b.size), remaining: Number(b.size), occupied: false,
    allocations: [] as { processId: string; size: number }[],
  }));

  const results: MFTAllocationResult[] = [];
  const computations: ComputationStep[] = [];

  for (const proc of validProcs) {
    const pSize = Number(proc.size);
    const available = blockState.filter((b) => !b.occupied && b.total >= pSize);
    const checkedBlocks = available.map((b) => `${b.id}(${b.remaining}KB)`);
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
      chosen.remaining = chosen.total - pSize;
      chosen.occupied = true;
      computations.push({
        processId: proc.id, processSize: pSize, checkedBlocks,
        selectedBlock: chosen.id, remainingBefore: before, remainingAfter: chosen.remaining,
      });
      results.push({
        blockId: chosen.id, blockSize: chosen.total, processId: proc.id,
        processSize: pSize, remaining: chosen.remaining, allocated: true,
      });
    } else {
      results.push({
        blockId: "—", blockSize: 0, processId: proc.id,
        processSize: pSize, remaining: 0, allocated: false,
      });
      computations.push({
        processId: proc.id, processSize: pSize, checkedBlocks,
        selectedBlock: "None", remainingBefore: 0, remainingAfter: 0,
      });
    }
  }

  const memoryMap: MemoryBlockResult[] = blockState.map((b) => {
    const segments: MemoryBlockResult["segments"] = b.allocations.map((a) => ({ type: "allocated" as const, size: a.size, processId: a.processId }));
    if (b.remaining > 0) segments.push({ type: "free", size: b.remaining });
    return { id: b.id, totalSize: b.total, segments };
  });

  return { results, memoryMap, computations };
}

const schedulingInfo: Record<SchedulingAlgorithm, { label: string; description: string }> = {
  FCFS: {
    label: "First Come, First Served",
    description: "Processes are sent to memory in the order they arrive. Simple and fair, but a long job at the front can delay everyone behind it.",
  },
  SJF: {
    label: "Shortest Job First",
    description: "The process with the smallest CPU burst time is sent to memory first. Minimizes average wait time but can starve longer jobs.",
  },
  Priority: {
    label: "Priority Scheduling",
    description: "The process with the highest priority (lowest number) is sent to memory first. Important jobs run sooner, at the risk of starving low-priority ones.",
  },
  RoundRobin: {
    label: "Round Robin",
    description: "Processes are sent to memory in arrival/queue order and share the CPU in fixed time quanta. Memory placement follows queue order; only the final allocation, memory map, and utilization are shown.",
  },
};

const allocationInfo: Record<AllocationPolicy, { label: string; description: string }> = {
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

interface SchedProcess {
  id: string;
  size: number | string;
  arrival: number | string;
  burst: number | string;
  priority: number | string;
}

interface MVTAllocationResult {
  blockId: string; blockSize: number; processId: string;
  processSize: number; remaining: number; allocated: boolean;
}

interface Segment { type: "allocated" | "free"; size: number; processId?: string; }
interface TimelineSnapshot {
  time: number;
  segments: Segment[];
  departed: string[];
  arrived: string[];
  queued: string[];
}

function simulateMVT(
  policy: AllocationPolicy,
  totalMemory: number,
  orderedProcesses: SchedProcess[],
): TimelineSnapshot[] {
  const valid = orderedProcesses
    .map((p) => ({
      id: p.id,
      size: Number(p.size),
      arrival: Number(p.arrival) || 0,
      burst: Number(p.burst) || 0,
    }))
    .filter((p) => p.id && p.size > 0 && totalMemory > 0);

  if (valid.length === 0) return [];

  let freeList: { start: number; size: number }[] = [{ start: 0, size: totalMemory }];
  let allocated: { start: number; size: number; processId: string; endTime: number }[] = [];
  const arrivalOrderIndex = new Map(valid.map((p, i) => [p.id, i]));
  let waiting: typeof valid = [];

  const mergeFreeList = () => {
    freeList.sort((a, b) => a.start - b.start);
    const merged: typeof freeList = [];
    for (const hole of freeList) {
      const last = merged[merged.length - 1];
      if (last && last.start + last.size === hole.start) { last.size += hole.size; }
      else { merged.push({ ...hole }); }
    }
    freeList = merged.filter((h) => h.size > 0);
  };

  const tryPlace = (proc: (typeof valid)[number]): boolean => {
    mergeFreeList();
    const candidates = freeList.filter((h) => h.size >= proc.size);
    if (candidates.length === 0) return false;
    let chosen: { start: number; size: number };
    if (policy === "FirstFit") { chosen = candidates[0]; }
    else if (policy === "BestFit") { chosen = [...candidates].sort((a, b) => a.size - b.size)[0]; }
    else { chosen = [...candidates].sort((a, b) => b.size - a.size)[0]; }
    const start = chosen.start;
    allocated.push({ start, size: proc.size, processId: proc.id, endTime: -1 });
    chosen.size -= proc.size;
    chosen.start += proc.size;
    freeList = freeList.filter((h) => h.size > 0);
    return true;
  };

  const eventTimesSet = new Set<number>();
  for (const p of valid) {
    eventTimesSet.add(p.arrival);
    eventTimesSet.add(p.arrival + p.burst);
  }
  const eventTimes = [...eventTimesSet].sort((a, b) => a - b);
  const snapshots: TimelineSnapshot[] = [];
  const completionTime = new Map<string, number>();

  for (const time of eventTimes) {
    const departingIds: string[] = [];
    allocated = allocated.filter((a) => {
      const done = a.endTime === time;
      if (done) { departingIds.push(a.processId); freeList.push({ start: a.start, size: a.size }); }
      return !done;
    });
    if (departingIds.length > 0) mergeFreeList();

    const arrivingNow = valid.filter((p) => p.arrival === time);
    for (const p of arrivingNow) waiting.push(p);
    waiting.sort((a, b) => (arrivalOrderIndex.get(a.id) ?? 0) - (arrivalOrderIndex.get(b.id) ?? 0));

    const stillWaiting: typeof valid = [];
    const placedNow: string[] = [];
    for (const p of waiting) {
      if (tryPlace(p)) {
        placedNow.push(p.id);
        completionTime.set(p.id, p.arrival + p.burst >= time ? p.arrival + p.burst : time + p.burst);
      } else { stillWaiting.push(p); }
    }
    waiting = stillWaiting;

    for (const a of allocated) {
      if (a.endTime === -1) {
        const p = valid.find((v) => v.id === a.processId)!;
        a.endTime = placedNow.includes(a.processId) ? (time + p.burst) : a.endTime;
      }
    }
    for (const a of allocated) {
      const ct = completionTime.get(a.processId);
      if (ct !== undefined) a.endTime = ct;
    }
    for (const pid of placedNow) {
      const ct = completionTime.get(pid)!;
      if (!eventTimesSet.has(ct) && ct > time) { eventTimesSet.add(ct); }
    }

    mergeFreeList();
    const items: { start: number; size: number; type: "allocated" | "free"; processId?: string }[] = [
      ...allocated.map((a) => ({ start: a.start, size: a.size, type: "allocated" as const, processId: a.processId })),
      ...freeList.map((h) => ({ start: h.start, size: h.size, type: "free" as const })),
    ].sort((a, b) => a.start - b.start);

    snapshots.push({
      time,
      segments: items.map((it) => ({ type: it.type, size: it.size, processId: it.processId })),
      departed: departingIds,
      arrived: placedNow,
      queued: waiting.map((w) => w.id),
    });
  }

  const finalTimes = [...eventTimesSet].sort((a, b) => a - b);
  if (finalTimes.length !== eventTimes.length) {
    return simulateMVTWithTimes(policy, totalMemory, valid, arrivalOrderIndex, finalTimes);
  }
  return snapshots;
}

function simulateMVTWithTimes(
  policy: AllocationPolicy,
  totalMemory: number,
  valid: { id: string; size: number; arrival: number; burst: number }[],
  arrivalOrderIndex: Map<string, number>,
  eventTimes: number[],
): TimelineSnapshot[] {
  let freeList: { start: number; size: number }[] = [{ start: 0, size: totalMemory }];
  let allocated: { start: number; size: number; processId: string; endTime: number }[] = [];
  let waiting: typeof valid = [];
  const completionTime = new Map<string, number>();

  const mergeFreeList = () => {
    freeList.sort((a, b) => a.start - b.start);
    const merged: typeof freeList = [];
    for (const hole of freeList) {
      const last = merged[merged.length - 1];
      if (last && last.start + last.size === hole.start) last.size += hole.size;
      else merged.push({ ...hole });
    }
    freeList = merged.filter((h) => h.size > 0);
  };

  const tryPlace = (proc: (typeof valid)[number]): boolean => {
    mergeFreeList();
    const candidates = freeList.filter((h) => h.size >= proc.size);
    if (candidates.length === 0) return false;
    let chosen: { start: number; size: number };
    if (policy === "FirstFit") chosen = candidates[0];
    else if (policy === "BestFit") chosen = [...candidates].sort((a, b) => a.size - b.size)[0];
    else chosen = [...candidates].sort((a, b) => b.size - a.size)[0];
    allocated.push({ start: chosen.start, size: proc.size, processId: proc.id, endTime: -1 });
    chosen.size -= proc.size;
    chosen.start += proc.size;
    freeList = freeList.filter((h) => h.size > 0);
    return true;
  };

  const snapshots: TimelineSnapshot[] = [];

  for (const time of eventTimes) {
    const departingIds: string[] = [];
    allocated = allocated.filter((a) => {
      const done = a.endTime === time;
      if (done) { departingIds.push(a.processId); freeList.push({ start: a.start, size: a.size }); }
      return !done;
    });
    if (departingIds.length > 0) mergeFreeList();

    const arrivingNow = valid.filter((p) => p.arrival === time);
    for (const p of arrivingNow) waiting.push(p);
    waiting.sort((a, b) => (arrivalOrderIndex.get(a.id) ?? 0) - (arrivalOrderIndex.get(b.id) ?? 0));

    const stillWaiting: typeof valid = [];
    const placedNow: string[] = [];
    for (const p of waiting) {
      if (tryPlace(p)) {
        placedNow.push(p.id);
        completionTime.set(p.id, time + p.burst);
      } else { stillWaiting.push(p); }
    }
    waiting = stillWaiting;

    for (const a of allocated) {
      const ct = completionTime.get(a.processId);
      if (ct !== undefined) a.endTime = ct;
    }

    mergeFreeList();
    const items: { start: number; size: number; type: "allocated" | "free"; processId?: string }[] = [
      ...allocated.map((a) => ({ start: a.start, size: a.size, type: "allocated" as const, processId: a.processId })),
      ...freeList.map((h) => ({ start: h.start, size: h.size, type: "free" as const })),
    ].sort((a, b) => a.start - b.start);

    snapshots.push({
      time,
      segments: items.map((it) => ({ type: it.type, size: it.size, processId: it.processId })),
      departed: departingIds,
      arrived: placedNow,
      queued: waiting.map((w) => w.id),
    });
  }

  return snapshots;
}

function simulateMVTCompacted(
  totalMemory: number,
  orderedProcesses: SchedProcess[],
): TimelineSnapshot[] {
  const valid = orderedProcesses
    .map((p) => ({
      id: p.id,
      size: Number(p.size),
      arrival: Number(p.arrival) || 0,
      burst: Number(p.burst) || 0,
    }))
    .filter((p) => p.id && p.size > 0 && totalMemory > 0);

  if (valid.length === 0) return [];

  const arrivalOrderIndex = new Map(valid.map((p, i) => [p.id, i]));
  const runPass = (eventTimes: number[]) => {
    const orderedResident: { processId: string; size: number; endTime: number }[] = [];
    let waiting: typeof valid = [];
    const snapshots: TimelineSnapshot[] = [];
    const discoveredTimes = new Set<number>();

    for (const time of eventTimes) {
      const departingIds: string[] = [];
      for (let i = orderedResident.length - 1; i >= 0; i--) {
        if (orderedResident[i].endTime === time) {
          departingIds.push(orderedResident[i].processId);
          orderedResident.splice(i, 1);
        }
      }
      const arrivingNow = valid.filter((p) => p.arrival === time);
      for (const p of arrivingNow) waiting.push(p);
      waiting.sort((a, b) => (arrivalOrderIndex.get(a.id) ?? 0) - (arrivalOrderIndex.get(b.id) ?? 0));

      const placedNow: string[] = [];
      const stillWaiting: typeof valid = [];
      for (const p of waiting) {
        const used = orderedResident.reduce((s, r) => s + r.size, 0);
        const free = totalMemory - used;
        if (free >= p.size) {
          const endTime = time + p.burst;
          orderedResident.push({ processId: p.id, size: p.size, endTime });
          placedNow.push(p.id);
          if (endTime > time) discoveredTimes.add(endTime);
        } else {
          stillWaiting.push(p);
        }
      }
      waiting = stillWaiting;

      const used = orderedResident.reduce((s, r) => s + r.size, 0);
      const free = totalMemory - used;
      const segments: Segment[] = orderedResident.map((r) => ({
        type: "allocated" as const,
        size: r.size,
        processId: r.processId,
      }));
      if (free > 0) segments.push({ type: "free", size: free });

      snapshots.push({
        time,
        segments,
        departed: departingIds,
        arrived: placedNow,
        queued: waiting.map((w) => w.id),
      });
    }

    return { snapshots, discoveredTimes };
  };

  const allTimes = new Set<number>();
  for (const p of valid) {
    allTimes.add(p.arrival);
    allTimes.add(p.arrival + p.burst);
  }

  let eventTimes = [...allTimes].sort((a, b) => a - b);
  let { snapshots, discoveredTimes } = runPass(eventTimes);
  let guard = 0;
  while (guard++ < 50) {
    let added = false;
    for (const t of discoveredTimes) {
      if (!allTimes.has(t)) { allTimes.add(t); added = true; }
    }
    if (!added) break;
    eventTimes = [...allTimes].sort((a, b) => a - b);
    ({ snapshots, discoveredTimes } = runPass(eventTimes));
  }

  return snapshots;
}

interface CompactedView {
  totalSize: number;
  segments: MemoryBlockResult["segments"];
}

function buildCompactedView(memoryMap: MemoryBlockResult[]): CompactedView {
  const allocatedSegments = memoryMap.flatMap((block) =>
    block.segments.filter((seg: MemoryBlockResult["segments"][number]) => seg.type === "allocated")
  );
  const totalFree = memoryMap.reduce(
    (sum: number, block: MemoryBlockResult) =>
      sum + block.segments.reduce(
        (blockSum: number, seg: MemoryBlockResult["segments"][number]) =>
          seg.type === "free" ? blockSum + seg.size : blockSum,
        0
      ),
    0
  );
  const segments: MemoryBlockResult["segments"] = [...allocatedSegments];
  if (totalFree > 0) { segments.push({ type: "free", size: totalFree }); }
  return { totalSize: memoryMap.reduce((sum, block) => sum + block.totalSize, 0), segments };
}

function scheduleOrder(algo: SchedulingAlgorithm, processes: SchedProcess[]): SchedProcess[] {
  const valid = processes.filter((p) => p.id && Number(p.size) > 0);
  if (algo === "FCFS") { return [...valid].sort((a, b) => Number(a.arrival) - Number(b.arrival)); }
  if (algo === "SJF") {
    return [...valid].sort((a, b) => {
      const burstDiff = Number(a.burst) - Number(b.burst);
      return burstDiff !== 0 ? burstDiff : Number(a.arrival) - Number(b.arrival);
    });
  }
  if (algo === "Priority") { return [...valid].sort((a, b) => Number(a.priority) - Number(b.priority)); }
  return [...valid].sort((a, b) => Number(a.arrival) - Number(b.arrival));
}

interface RRResult { id: string; arrival: number; burst: number; completion: number; turnaround: number; waiting: number; }

function computeRoundRobin(processes: SchedProcess[], q: number): RRResult[] {
  const valid = processes
    .filter((p) => p.id && Number(p.burst) > 0)
    .map((p) => ({ id: p.id, arrival: Number(p.arrival) || 0, burst: Number(p.burst), remaining: Number(p.burst) }))
    .sort((a, b) => a.arrival - b.arrival);
  if (valid.length === 0 || !q || q <= 0) return [];
  const queue: typeof valid = [];
  const completion: Record<string, number> = {};
  let time = valid[0].arrival;
  let i = 0;
  const n = valid.length;
  const enqueueArrivals = (uptoTime: number) => {
    while (i < n && valid[i].arrival <= uptoTime) { queue.push(valid[i]); i++; }
  };
  enqueueArrivals(time);
  while (queue.length > 0 || i < n) {
    if (queue.length === 0) { time = valid[i].arrival; enqueueArrivals(time); }
    const cur = queue.shift()!;
    const run = Math.min(q, cur.remaining);
    time += run;
    cur.remaining -= run;
    enqueueArrivals(time);
    if (cur.remaining > 0) { queue.push(cur); } else { completion[cur.id] = time; }
  }
  return valid.map((p) => {
    const ct = completion[p.id] ?? 0;
    const turnaround = ct - p.arrival;
    const waiting = turnaround - p.burst;
    return { id: p.id, arrival: p.arrival, burst: p.burst, completion: ct, turnaround, waiting };
  });
}

function mvtAllocate(
  policy: AllocationPolicy,
  blocks: MemoryBlock[],
  orderedProcesses: SchedProcess[]
): { results: MVTAllocationResult[]; memoryMap: MemoryBlockResult[]; } {
  const validBlocks = blocks.filter((b) => b.id && Number(b.size) > 0);
  if (validBlocks.length === 0 || orderedProcesses.length === 0) return { results: [], memoryMap: [] };

  const blockState = validBlocks.map((b) => ({
    id: b.id, total: Number(b.size), remaining: Number(b.size),
    allocations: [] as { processId: string; size: number }[],
  }));

  const results: MVTAllocationResult[] = [];

  for (const proc of orderedProcesses) {
    const pSize = Number(proc.size);
    const available = blockState.filter((b) => b.remaining >= pSize);
    let chosen: typeof blockState[0] | null = null;
    if (policy === "FirstFit") { chosen = available[0] ?? null; }
    else if (policy === "BestFit") { chosen = [...available].sort((a, b) => a.remaining - b.remaining)[0] ?? null; }
    else if (policy === "WorstFit") { chosen = [...available].sort((a, b) => b.remaining - a.remaining)[0] ?? null; }

    if (chosen) {
      chosen.allocations.push({ processId: proc.id, size: pSize });
      chosen.remaining -= pSize;
      results.push({ blockId: chosen.id, blockSize: chosen.total, processId: proc.id, processSize: pSize, remaining: chosen.remaining, allocated: true });
    } else {
      results.push({ blockId: "—", blockSize: 0, processId: proc.id, processSize: pSize, remaining: 0, allocated: false });
    }
  }

  const memoryMap: MemoryBlockResult[] = blockState.map((b) => {
    const segments: MemoryBlockResult["segments"] = b.allocations.map((a) => ({ type: "allocated" as const, size: a.size, processId: a.processId }));
    if (b.remaining > 0) segments.push({ type: "free", size: b.remaining });
    return { id: b.id, totalSize: b.total, segments };
  });

  return { results, memoryMap };
}

function computeFragmentation(
  memoryMap: MemoryBlockResult[],
  results: (MVTAllocationResult | MFTAllocationResult)[],
  compacted = false,
) {
  const totalMemory = memoryMap.reduce((s, b) => s + b.totalSize, 0);
  const allocatedMemory = results.filter((r) => r.allocated).reduce((s, r) => s + r.processSize, 0);
  let totalFree = 0;
  for (const block of memoryMap) {
    for (const seg of block.segments) {
      if (seg.type === "free") { totalFree += seg.size; }
    }
  }
  const externalFragmentation = compacted ? 0 : (totalMemory > 0 ? Math.max(0, totalMemory - allocatedMemory) : 0);
  const percentUtilization = totalMemory > 0 ? (allocatedMemory / totalMemory) * 100 : 0;
  return { totalMemory, allocatedMemory, totalFree, internalFragmentation: 0, externalFragmentation, percentUtilization };
}

const DEFAULT_POLICY_BY_ALGO: Record<SchedulingAlgorithm, AllocationPolicy> = {
  FCFS: "FirstFit", SJF: "FirstFit", Priority: "FirstFit", RoundRobin: "FirstFit",
};
const DEFAULT_COMPACTION_BY_ALGO: Record<SchedulingAlgorithm, boolean> = {
  FCFS: false, SJF: false, Priority: false, RoundRobin: false,
};

export default function MemoryManagement() {
  const [mode, setMode] = useState<Mode>("MFT");
  const [mftAlgo, setMftAlgo] = useState<MFTAlgorithm>("FirstFit");
  const [memBlocks, setMemBlocks] = useState<MemoryBlock[]>([]);
  const [mftProcesses, setMftProcesses] = useState<MFTProcess[]>([]);
  const [schedAlgo, setSchedAlgo] = useState<SchedulingAlgorithm>("FCFS");
  const [policyByAlgo, setPolicyByAlgo] = useState<Record<SchedulingAlgorithm, AllocationPolicy>>(DEFAULT_POLICY_BY_ALGO);
  const [compactionByAlgo, setCompactionByAlgo] = useState<Record<SchedulingAlgorithm, boolean>>(DEFAULT_COMPACTION_BY_ALGO);
  const [totalMemory, setTotalMemory] = useState<number | string>("");
  const [mvtProcesses, setMvtProcesses] = useState<SchedProcess[]>([]);
  const [quantum, setQuantum] = useState<number | string>(2);

  const [isDark, setIsDark] = useState(true);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);

  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) { html.classList.remove("dark"); setIsDark(false); }
    else { html.classList.add("dark"); setIsDark(true); }
  }

  const mvtMemBlocks: MemoryBlock[] = [{ id: "MEM", size: totalMemory }];
  const policy = policyByAlgo[schedAlgo];
  const compactionEnabled = compactionByAlgo[schedAlgo];
  function setPolicy(p: AllocationPolicy) { setPolicyByAlgo((prev) => ({ ...prev, [schedAlgo]: p })); }
  function setCompactionEnabled(value: boolean) { setCompactionByAlgo((prev) => ({ ...prev, [schedAlgo]: value })); }

  const mvtDispatchOrder = scheduleOrder(schedAlgo, mvtProcesses);
  const { results: mvtResults, memoryMap: mvtMemoryMap } = mvtAllocate(policy, mvtMemBlocks, mvtDispatchOrder);
  const mvtAllProcessIds = mvtResults.filter((r) => r.allocated).map((r) => r.processId);
  const jobColorIndex = (pid: string): number => {
    const idx = mvtProcesses.findIndex((p) => p.id === pid);
    return idx >= 0 ? idx : mvtAllProcessIds.indexOf(pid);
  };
  const rrSchedule = schedAlgo === "RoundRobin" ? computeRoundRobin(mvtProcesses, Number(quantum) || 0) : [];
  const timeline = simulateMVT(policy, Number(totalMemory) || 0, mvtDispatchOrder);
  const compactedTimeline = compactionEnabled
    ? simulateMVTCompacted(Number(totalMemory) || 0, mvtDispatchOrder)
    : [];
  const rrAvgWaiting = rrSchedule.length > 0 ? rrSchedule.reduce((s, r) => s + r.waiting, 0) / rrSchedule.length : 0;
  const rrAvgTurnaround = rrSchedule.length > 0 ? rrSchedule.reduce((s, r) => s + r.turnaround, 0) / rrSchedule.length : 0;
  const compactedView = buildCompactedView(mvtMemoryMap);
  const liveMemoryMap: MemoryBlockResult[] = compactionEnabled
    ? [{ id: "Mem", totalSize: compactedView.totalSize, segments: compactedView.segments }]
    : mvtMemoryMap;
  const mvtStats = computeFragmentation(liveMemoryMap, mvtResults, compactionEnabled);
  const showArrival = schedAlgo === "FCFS" || schedAlgo === "SJF" || schedAlgo === "Priority";
  const showBurst = schedAlgo === "FCFS" || schedAlgo === "SJF" || schedAlgo === "RoundRobin" || schedAlgo === "Priority";
  const showPriority = schedAlgo === "Priority";

  const { results: mftResults, memoryMap: mftMemoryMap } = mftAllocate(mftAlgo, memBlocks, mftProcesses);
  const mftAllProcessIds = mftResults.filter((r) => r.allocated).map((r) => r.processId);

  function renderStatusPill(allocated: boolean) {
    const label = allocated ? "✓ Allocated" : "✗ Not Allocated";
    const pillWidth = Math.max(60, label.length * 7 + 28);
    const pillHeight = STATUS_PILL_HEIGHT;
    const fill = allocated ? "rgba(16, 185, 129, 0.10)" : "rgba(244, 63, 94, 0.12)";
    const stroke = allocated ? "rgba(52, 211, 153, 0.35)" : "rgba(251, 113, 133, 0.35)";
    const textColor = allocated ? "#34d399" : "#fb7185";
    return (
      <svg width={pillWidth} height={pillHeight} style={{ display: "block" }}>
        <rect x={0} y={0} width={pillWidth} height={pillHeight} rx={pillHeight / 2} ry={pillHeight / 2} fill={fill} stroke={stroke} strokeWidth={1} />
        <text x={pillWidth / 2} y={STATUS_PILL_TEXT_Y} textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="700" fill={textColor}>{label}</text>
      </svg>
    );
  }

  function renderStatsPanel(s: ReturnType<typeof computeFragmentation>, hex = false) {
    const items = [
      { label: "Total Memory", value: `${s.totalMemory} KB`, color: hex ? "#94a3b8" : "text-slate-700 dark:text-white" },
      { label: "Allocated", value: `${s.allocatedMemory} KB`, color: hex ? COLOR_HEX[0] : "text-cyan-600 dark:text-cyan-400" },
      { label: "% Memory Utilization", value: `${s.percentUtilization.toFixed(2)}%`, color: hex ? "#34d399" : "text-emerald-600 dark:text-emerald-400" },
      { label: "Internal Fragmentation", value: `${s.internalFragmentation} KB`, color: hex ? "#f59e0b" : "text-amber-600 dark:text-amber-400" },
      { label: "External Fragmentation", value: `${s.externalFragmentation} KB`, color: hex ? "#fb7185" : "text-rose-600 dark:text-rose-400" },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-slate-200/70 dark:border-white/8 bg-slate-50/60 dark:bg-white/5 px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">{it.label}</span>
            <span className={`text-base font-bold font-mono ${hex ? "" : it.color}`} style={hex ? { color: it.color } : undefined}>{it.value}</span>
          </div>
        ))}
      </div>
    );
  }

  function renderMemoryMapTimeline(snapshots: TimelineSnapshot[]) {
    if (snapshots.length === 0) {
      return <div className="text-sm text-slate-400 font-mono">No timeline yet.</div>;
    }
    const totalMem = Number(totalMemory) || 1;
    return (
      <>
        <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 8 }}>
          <div style={{ display: "inline-flex", gap: 24, alignItems: "flex-start" }}>
            {snapshots.map((snap) => (
              <div key={snap.time} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                  <div style={{ width: 44, flexShrink: 0 }} />
                  <div style={{ width: 80, display: "flex", justifyContent: "center", paddingBottom: 4 }}>
                    <span className="font-mono text-slate-500 dark:text-slate-400" style={{ fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{snap.time}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 0 }}>
                  <div style={{ width: 44, height: 500, position: "relative", flexShrink: 0 }}>
                    {(() => {
                      let cumulative = 0;
                      const boundaries: { kb: number; pct: number }[] = [{ kb: 0, pct: 0 }];
                      for (const seg of snap.segments) {
                        cumulative += seg.size;
                        boundaries.push({ kb: cumulative, pct: (cumulative / totalMem) * 100 });
                      }
                      return boundaries.map(({ kb, pct }, i) => (
                        <span key={i} className="font-mono text-slate-400 dark:text-slate-500"
                          style={{ position: "absolute", top: `${pct}%`, right: 4, fontSize: 9, lineHeight: 1, transform: "translateY(-50%)", whiteSpace: "nowrap" }}>
                          {kb} KB
                        </span>
                      ));
                    })()}
                  </div>
                  <div style={{ width: 80, height: 500, border: "1px solid", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 2 }} className="border-slate-300 dark:border-slate-600">
                    {snap.segments.map((seg, i) => {
                      const height = (seg.size / totalMem) * 100;
                      const pidIdx = seg.processId ? jobColorIndex(seg.processId) : -1;
                      return (
                        <div key={i}
                          style={{ height: `${height}%`, backgroundColor: seg.type === "allocated" ? COLOR_HEX[pidIdx % COLOR_HEX.length] : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", borderBottom: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}
                          className={seg.type === "allocated" ? "text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400"}>
                          {seg.type === "allocated" ? seg.processId : `${seg.size} KB`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Export-specific timeline renderer: uses SVG so colors always render correctly off-screen
  function renderExportMemoryMapTimeline(snapshots: TimelineSnapshot[], totalMem: number, getColorIdx: (pid: string) => number) {
    if (snapshots.length === 0) {
      return <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>No timeline data.</div>;
    }
    const safeMem = totalMem || 1;
    const COL_W = 80;       // column bar width
    const LABEL_W = 48;     // left KB label area
    const COL_H = 500;      // column height px
    const GAP = 24;         // gap between columns
    const TIME_H = 20;      // time label row height
    const FONT = "monospace";
    const totalW = snapshots.length * (LABEL_W + COL_W + GAP);
    const exportLegendPids = Array.from(
      new Set(
        snapshots.flatMap((snap) =>
          snap.segments
            .filter(
              (
                seg
              ): seg is typeof seg & {
                processId: string;
              } => seg.type === "allocated" && !!seg.processId
            )
            .map((seg) => seg.processId)
        )
      )
    );
    return (
      <div>
        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <svg
            width={totalW}
            height={TIME_H + COL_H + 4}
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", fontFamily: FONT }}
          >
            {snapshots.map((snap, colIdx) => {
              const xBase = colIdx * (LABEL_W + COL_W + GAP);
              const barX = xBase + LABEL_W;
              const barY = TIME_H;

              // Build segment rects
              let yOffset = 0;
              const segRects = snap.segments.map((seg, i) => {
                const segH = (seg.size / safeMem) * COL_H;
                const pidIdx = seg.processId ? getColorIdx(seg.processId) : -1;
                const fill = seg.type === "allocated" ? COLOR_HEX[pidIdx % COLOR_HEX.length] : (isDark ? "#0f172a" : "#f1f5f9");
                const textFill = seg.type === "allocated" ? "#ffffff" : "#475569";
                const label = seg.type === "allocated" ? seg.processId! : `${seg.size} KB`;
                const cy = yOffset + segH / 2;
                const rect = (
                  <g key={i}>
                    <rect x={barX} y={barY + yOffset} width={COL_W} height={segH} fill={fill} />
                    {segH >= 14 && (
                      <text x={barX + COL_W / 2} y={barY + cy} dominantBaseline="middle" textAnchor="middle" fontSize={11} fontWeight="bold" fill={textFill} fontFamily={FONT}>
                        {label}
                      </text>
                    )}
                    {/* segment divider */}
                    <line x1={barX} y1={barY + yOffset + segH} x2={barX + COL_W} y2={barY + yOffset + segH} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                  </g>
                );
                yOffset += segH;
                return rect;
              });

              // KB boundary labels on left
              let cumKb = 0;
              const boundaries: { kb: number; y: number }[] = [{ kb: 0, y: 0 }];
              for (const seg of snap.segments) {
                cumKb += seg.size;
                boundaries.push({ kb: cumKb, y: (cumKb / safeMem) * COL_H });
              }
              const kbLabels = boundaries.map(({ kb, y }, i) => (
                <text key={i} x={xBase + LABEL_W - 4} y={barY + y} dominantBaseline="middle" textAnchor="end" fontSize={9} fill="#64748b" fontFamily={FONT}>
                  {kb} KB
                </text>
              ));

              return (
                <g key={snap.time}>
                  {/* Column border */}
                  <rect x={barX} y={barY} width={COL_W} height={COL_H} fill="none" stroke="#334155" strokeWidth={1} />
                  {segRects}
                  {kbLabels}
                  {/* Time label */}
                  <text x={barX + COL_W / 2} y={TIME_H / 2} dominantBaseline="middle" textAnchor="middle" fontSize={10} fontWeight="bold" fill="#64748b" fontFamily={FONT}>
                    {snap.time}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {exportLegendPids.map((pid) => {
            const cidx = getColorIdx(pid);
            return (
              <div key={pid} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLOR_HEX[cidx % COLOR_HEX.length] }} />
                <span style={{ fontSize: 12, fontFamily: "monospace", color: COLOR_HEX[cidx % COLOR_HEX.length] }}>{pid}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: isDark ? "#0f172a" : "#f1f5f9", border: "1px solid #334155" }} />
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>Free</span>
          </div>
        </div>
      </div>
    );
  }

  function updateBlock(i: number, field: keyof MemoryBlock, value: string) {
    setMemBlocks((prev: MemoryBlock[]) => prev.map((b: MemoryBlock, idx: number) => idx === i ? { ...b, [field]: value } : b));
  }
  function updateMftProcess(i: number, field: keyof MFTProcess, value: string) {
    setMftProcesses((prev: MFTProcess[]) => prev.map((p: MFTProcess, idx: number) => idx === i ? { ...p, [field]: value } : p));
  }
  function addBlock() { setMemBlocks((prev: MemoryBlock[]) => [...prev, { id: `B${prev.length + 1}`, size: 0 }]); }
  function addMftProcess() { setMftProcesses((prev: MFTProcess[]) => [...prev, { id: `P${prev.length + 1}`, size: 0 }]); }
  function removeBlock(i: number) { if (memBlocks.length <= 1) return; setMemBlocks((prev: MemoryBlock[]) => prev.filter((_: MemoryBlock, idx: number) => idx !== i)); }
  function removeMftProcess(i: number) { if (mftProcesses.length <= 1) return; setMftProcesses((prev: MFTProcess[]) => prev.filter((_: MFTProcess, idx: number) => idx !== i)); }
  function focusNextMft(table: "block" | "process", i: number, field: string) {
    const total = table === "block" ? memBlocks.length : mftProcesses.length;
    if (i + 1 >= total) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`[data-table="${table}"][data-row="${i + 1}"][data-field="${field}"]`);
      el?.focus(); el?.select();
    }, 50);
  }

  function updateMvtProcess(i: number, field: keyof SchedProcess, value: string) {
    setMvtProcesses((prev: SchedProcess[]) => prev.map((p: SchedProcess, idx: number) => idx === i ? { ...p, [field]: value } : p));
  }
  function addMvtProcess() {
    setMvtProcesses((prev: SchedProcess[]) => [...prev, { id: `P${prev.length + 1}`, size: 0, arrival: prev.length, burst: 0, priority: prev.length + 1 }]);
  }
  function removeMvtProcess(i: number) { if (mvtProcesses.length <= 1) return; setMvtProcesses((prev: SchedProcess[]) => prev.filter((_: SchedProcess, idx: number) => idx !== i)); }
  function focusNextMvt(i: number, field: string) {
    if (i + 1 >= mvtProcesses.length) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`[data-table="process"][data-row="${i + 1}"][data-field="${field}"]`);
      el?.focus(); el?.select();
    }, 50);
  }

  const exportSubtitle = mode === "MFT"
    ? `MFT · ${mftAlgorithmInfo[mftAlgo].label}`
    : `MVT · ${schedulingInfo[schedAlgo].label}${schedAlgo === "RoundRobin" ? ` (q=${quantum || 0})` : ""} · ${allocationInfo[policy].label}${compactionEnabled ? " · With Compaction" : ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4f8] via-[#f0f6fa] to-[#eef4f8] dark:from-[#030d1f] dark:via-[#020b18] dark:to-[#030d1f]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <Link href="/#demo" className="inline-flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          <ExportButton targetId="memory-export-snapshot" title="Memory Management Simulation" subtitle={exportSubtitle} />
          <ThemeToggleSwitch isDark={isDark} onToggle={toggleTheme} small />
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />SIMULATOR · LIVE
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">💾</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">Memory Management</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Choose from MFT and MVT, then visualize how processes get placed in memory
        </p>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">

        {/* ── Sidebar ── */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20 flex flex-col gap-4">

            {/* MFT card */}
            <div>
              <button
                onClick={() => setMode("MFT")}
                className={`w-full text-left px-3 py-2 rounded-xl mb-2 transition-all duration-200 ${mode === "MFT" ? "bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-400/30" : "border border-transparent hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <p className={`font-mono text-xs uppercase tracking-widest font-bold ${mode === "MFT" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`}>MFT</p>
              </button>
              <div className="flex flex-col gap-1 pl-1">
                {(Object.keys(mftAlgorithmInfo) as MFTAlgorithm[]).map((algo) => (
                  <button key={algo}
                    onClick={() => { setMode("MFT"); setMftAlgo(algo); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${mode === "MFT" && mftAlgo === algo ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"}`}>
                    {mftAlgorithmInfo[algo].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-white/8" />

            {/* MVT card */}
            <div>
              <button
                onClick={() => setMode("MVT")}
                className={`w-full text-left px-3 py-2 rounded-xl mb-2 transition-all duration-200 ${mode === "MVT" ? "bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-400/30" : "border border-transparent hover:bg-slate-100 dark:hover:bg-white/5"}`}
              >
                <p className={`font-mono text-xs uppercase tracking-widest font-bold ${mode === "MVT" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"}`}>MVT</p>
              </button>
              <div role="tablist" className="flex flex-col gap-1 pl-1">
                {(Object.keys(schedulingInfo) as SchedulingAlgorithm[]).map((algo) => (
                  <button key={algo} role="tab" aria-selected={mode === "MVT" && schedAlgo === algo}
                    onClick={() => { setMode("MVT"); setSchedAlgo(algo); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${mode === "MVT" && schedAlgo === algo ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"}`}>
                    {schedulingInfo[algo].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6" style={{ overflow: "visible" }}>

          {/* ════════════════ MFT PANEL ════════════════ */}
          {mode === "MFT" && (
            <>
              {/* Description */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">MFT · Multiprogramming with a Fixed number of Tasks</p>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{mftAlgorithmInfo[mftAlgo].label}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{mftAlgorithmInfo[mftAlgo].description}</p>
              </div>

              {/* Input tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Memory Blocks */}
                <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Memory Blocks</p>
                    <button onClick={addBlock} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add</button>
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
                              data-table="block" data-row={i} data-field="id"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMft("block", i, "id")}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min={1} value={b.size} onChange={(e) => updateBlock(i, "size", e.target.value)}
                              data-table="block" data-row={i} data-field="size"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMft("block", i, "size")}
                              className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-1">
                            <button onClick={() => removeBlock(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Processes */}
                <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Processes</p>
                    <button onClick={addMftProcess} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add</button>
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
                      {mftProcesses.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-2">
                            <input value={p.id} onChange={(e) => updateMftProcess(i, "id", e.target.value)}
                              data-table="mft-process" data-row={i} data-field="id"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMft("process", i, "id")}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min={1} value={p.size} onChange={(e) => updateMftProcess(i, "size", e.target.value)}
                              data-table="mft-process" data-row={i} data-field="size"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMft("process", i, "size")}
                              className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-1">
                            <button onClick={() => removeMftProcess(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allocation Result */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Allocation Result</p>
                {mftResults.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono"><span className="text-cyan-500 mr-2">&gt;</span> Fill in both tables to see results</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/8">
                          {["Process ID","Process Size (KB)","Allocated Block","Block Size (KB)","Remaining (KB)","Status"].map((col) => (
                            <th key={col} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mftResults.map((r, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                            <td className="py-2 px-3 text-slate-900 dark:text-white font-mono text-xs">{r.processId}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.processSize}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{r.blockId}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.blockSize : "—"}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.remaining : "—"}</td>
                            <td className="py-2 px-3">
                              {r.allocated
                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">✓ Allocated</span>
                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-400/30">✗ Not Allocated</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Memory Map */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Memory Map</p>
                {mftMemoryMap.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono"><span className="text-cyan-500 mr-2">&gt;</span> Fill in both tables to see the memory map</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {mftMemoryMap.map((block) => (
                      <div key={block.id} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 w-8 shrink-0">{block.id}</span>
                        <div className="flex-1 flex h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/8">
                          {block.segments.map((seg, i) => {
                            const width = (seg.size / block.totalSize) * 100;
                            const pidIdx = seg.processId ? mftAllProcessIds.indexOf(seg.processId) : -1;
                            return (
                              <div key={i} style={{ width: `${width}%` }}
                                className={`flex items-center justify-center text-xs font-bold shrink-0 ${seg.type === "allocated" ? `${COLORS[pidIdx % COLORS.length]} text-white` : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600"}`}>
                                {seg.type === "allocated" ? seg.processId : `${seg.size}KB free`}
                              </div>
                            );
                          })}
                        </div>
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right">{block.totalSize} KB</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-3 mt-2 pt-4 border-t border-slate-100 dark:border-white/5">
                      {mftAllProcessIds.map((pid, i) => (
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
            </>
          )}

          {/* ════════════════ MVT PANEL ════════════════ */}
          {mode === "MVT" && (
            <>
              {/* Description + Settings */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">MVT · Multiprogramming with a Variable number of Tasks</p>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4">{schedulingInfo[schedAlgo].label}</h2>
                <div className="flex flex-col gap-4">
                  {/* Allocation Policy */}
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Memory Allocation Policy</span>
                    <div className="inline-flex w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      {(Object.keys(allocationInfo) as AllocationPolicy[]).map((p, idx) => (
                        <button key={p} onClick={() => setPolicy(p)}
                          className={`flex-1 sm:flex-none sm:px-5 px-3 py-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${idx > 0 ? "border-l border-slate-200 dark:border-white/10" : ""} ${policy === p ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                          {allocationInfo[p].label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{allocationInfo[policy].description}</p>
                  </div>
                  {/* Compaction */}
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Memory Map</span>
                    <div className="inline-flex w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      <button onClick={() => setCompactionEnabled(false)}
                        className={`flex-1 sm:flex-none sm:px-5 px-3 py-2 text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-150 ${!compactionEnabled ? "bg-cyan-500/15 dark:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                        Without Compaction
                      </button>
                      <button onClick={() => setCompactionEnabled(true)}
                        className={`flex-1 sm:flex-none sm:px-5 px-3 py-2 text-xs font-mono font-semibold whitespace-nowrap border-l border-slate-200 dark:border-white/10 transition-colors duration-150 ${compactionEnabled ? "bg-violet-500/15 dark:bg-violet-500/25 text-violet-700 dark:text-violet-300" : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                        With Compaction
                      </button>
                    </div>
                  </div>
                  {/* Total Memory */}
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Total Memory Size (KB)</span>
                    <input type="number" min={1} value={totalMemory} onChange={(e) => setTotalMemory(e.target.value)}
                      className="w-32 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400" />
                  </div>
                  {/* Quantum (RR only) */}
                  {schedAlgo === "RoundRobin" && (
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Time Quantum (q)</span>
                      <input type="number" min={1} value={quantum} onChange={(e) => setQuantum(e.target.value)}
                        className="w-24 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Processes table */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Processes</p>
                  <button onClick={addMvtProcess} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/8">
                        <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Job ID</th>
                        {showArrival && <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Arrival</th>}
                        {showBurst && <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Burst</th>}
                        {showPriority && <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>}
                        <th className="text-left py-2 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Mem (KB)</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {mvtProcesses.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-2">
                            <input value={p.id} onChange={(e) => updateMvtProcess(i, "id", e.target.value)}
                              data-table="process" data-row={i} data-field="id"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMvt(i, "id")}
                              className="w-14 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          {showArrival && (
                            <td className="py-2 px-2">
                              <input type="number" min={0} value={p.arrival} onChange={(e) => updateMvtProcess(i, "arrival", e.target.value)}
                                data-table="process" data-row={i} data-field="arrival"
                                onKeyDown={(e) => e.key === "Enter" && focusNextMvt(i, "arrival")}
                                className="w-16 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                            </td>
                          )}
                          {showBurst && (
                            <td className="py-2 px-2">
                              <input type="number" min={0} value={p.burst} onChange={(e) => updateMvtProcess(i, "burst", e.target.value)}
                                data-table="process" data-row={i} data-field="burst"
                                onKeyDown={(e) => e.key === "Enter" && focusNextMvt(i, "burst")}
                                className="w-16 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                            </td>
                          )}
                          {showPriority && (
                            <td className="py-2 px-2">
                              <input type="number" min={1} value={p.priority} onChange={(e) => updateMvtProcess(i, "priority", e.target.value)}
                                data-table="process" data-row={i} data-field="priority"
                                onKeyDown={(e) => e.key === "Enter" && focusNextMvt(i, "priority")}
                                className="w-16 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                            </td>
                          )}
                          <td className="py-2 px-2">
                            <input type="number" min={1} value={p.size} onChange={(e) => updateMvtProcess(i, "size", e.target.value)}
                              data-table="process" data-row={i} data-field="size"
                              onKeyDown={(e) => e.key === "Enter" && focusNextMvt(i, "size")}
                              className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                          </td>
                          <td className="py-2 px-1">
                            <button onClick={() => removeMvtProcess(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allocation Result */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Allocation Result</p>
                {mvtResults.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono"><span className="text-cyan-500 mr-2">&gt;</span> Enter a memory size and add processes to see results</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/8">
                          {["Process ID","Process Size (KB)","Allocated Block","Block Size (KB)","Remaining (KB)","Status"].map((col) => (
                            <th key={col} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mvtResults.map((r, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                            <td className="py-2 px-3 text-slate-900 dark:text-white font-mono text-xs">{r.processId}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.processSize}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{r.blockId}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.blockSize : "—"}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-xs">{r.allocated ? r.remaining : "—"}</td>
                            <td className="py-2 px-3">
                              {r.allocated
                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">✓ Allocated</span>
                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-400/30">✗ Not Allocated</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Memory Utilization */}
              {mvtResults.length > 0 && (
                <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                    Memory Utilization{compactionEnabled ? " (After Compaction)" : ""}
                  </p>
                  {renderStatsPanel(mvtStats)}
                </div>
              )}

              {/* Memory Map */}
              <div style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }} className={`rounded-2xl border backdrop-blur-xl p-5 transition-colors duration-200 ${compactionEnabled ? "border-violet-400/30 bg-white/70 dark:bg-slate-900/50" : "border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50"}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Memory Map
                    {compactionEnabled && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-500 dark:text-violet-400 border border-violet-400/30 normal-case tracking-normal font-normal">
                        ✦ With Compaction
                      </span>
                    )}
                  </p>
                </div>
                {mvtMemoryMap.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-slate-400 dark:text-slate-600 text-sm font-mono">
                    <span className="text-cyan-500 mr-2">&gt;</span> Enter a memory size and add processes to see the memory map
                  </div>
                ) : compactionEnabled
                  ? renderMemoryMapTimeline(compactedTimeline)
                  : renderMemoryMapTimeline(timeline)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Hidden export snapshot ── */}
      <div
        id="memory-export-snapshot"
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: "-9999px", width: "900px", zIndex: -1,
          pointerEvents: "none", overflow: "visible", padding: "32px",
          display: "flex", flexDirection: "column", gap: "40px",
          background: isDark ? "#020b18" : "#f0f6fa",
        }}
      >
        {/* ── Export Header ── */}
        <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}` }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💾</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", marginBottom: 12 }}>Memory Management</h1>
          <p style={{ fontFamily: "monospace", fontSize: 13, color: "#64748b", marginTop: 8 }}>
            {mode === "MFT" ? "MFT · Multiprogramming with a Fixed number of Tasks" : "MVT · Multiprogramming with a Variable number of Tasks"}
          </p>
        </div>

        {/* ════════ MFT EXPORT ════════ */}
        {mode === "MFT" && (
          <>
            {/* Description — full width */}
            <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Algorithm</p>
              <h2 style={{ fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 18, margin: "0 0 6px 0" }}>{mftAlgorithmInfo[mftAlgo].label}</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{mftAlgorithmInfo[mftAlgo].description}</p>
            </div>

            {/* Input tables — side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Memory Blocks */}
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Memory Blocks</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Block ID</th>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Size (KB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memBlocks.map((b, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                        <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#f1f5f9" : "#0f172a" }}>{b.id}</td>
                        <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{b.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Processes */}
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Processes</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Process ID</th>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Size (KB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mftProcesses.map((p, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                        <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#f1f5f9" : "#0f172a" }}>{p.id}</td>
                        <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{p.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allocation Result — full width */}
            {mftResults.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Allocation Result</p>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      {["Process ID", "Process Size (KB)", "Allocated Block", "Block Size (KB)", "Remaining (KB)", "Status"].map((col) => (
                        <th key={col} style={{ textAlign: "left", padding: "6px 12px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mftResults.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLOR_HEX[mftAllProcessIds.indexOf(r.processId) % COLOR_HEX.length] }}>{r.processId}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.processSize}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.blockId}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.allocated ? r.blockSize : "—"}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.allocated ? r.remaining : "—"}</td>
                        <td style={{ padding: "6px 12px", verticalAlign: "middle" }}>{renderStatusPill(r.allocated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Memory Map — full width, timeline style */}
            {mftMemoryMap.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Memory Map</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mftMemoryMap.map((block) => (
                    <div key={block.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", width: 32, flexShrink: 0 }}>{block.id}</span>
                      <div style={{ flex: 1, display: "flex", height: 40, borderRadius: 8, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                        {block.segments.map((seg, i) => {
                          const width = (seg.size / block.totalSize) * 100;
                          const pidIdx = seg.processId ? mftAllProcessIds.indexOf(seg.processId) : -1;
                          return (
                            <div key={i} style={{ width: `${width}%`, backgroundColor: seg.type === "allocated" ? COLOR_HEX[pidIdx % COLOR_HEX.length] : (isDark ? "#1e293b" : "#f1f5f9"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: seg.type === "allocated" ? "#fff" : "#94a3b8", flexShrink: 0, fontFamily: "monospace" }}>
                              {seg.type === "allocated" ? seg.processId : `${seg.size}KB free`}
                            </div>
                          );
                        })}
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", width: 60, flexShrink: 0, textAlign: "right" }}>{block.totalSize} KB</span>
                    </div>
                  ))}
                  {/* Legend */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, paddingTop: 16, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                    {mftAllProcessIds.map((pid, i) => (
                      <div key={pid} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLOR_HEX[i % COLOR_HEX.length] }} />
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: COLOR_HEX[i % COLOR_HEX.length] }}>{pid}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: isDark ? "#1e293b" : "#f1f5f9", border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}` }} />
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>Free</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════ MVT EXPORT ════════ */}
        {mode === "MVT" && (
          <>
            {/* Description — full width */}
            <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Scheduling · {schedulingInfo[schedAlgo].label}</p>
              <h2 style={{ fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 18, margin: "0 0 6px 0" }}>{allocationInfo[policy].label} Allocation{compactionEnabled ? " · With Compaction" : ""}</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{allocationInfo[policy].description}</p>
            </div>

            {/* Processes table — full width */}
            <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Processes</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Job ID</th>
                    {showArrival && <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Arrival</th>}
                    {showBurst && <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Burst</th>}
                    {showPriority && <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</th>}
                    <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mem (KB)</th>
                  </tr>
                </thead>
                <tbody>
                  {mvtProcesses.map((p, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                      <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#f1f5f9" : "#0f172a" }}>{p.id}</td>
                      {showArrival && <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{p.arrival}</td>}
                      {showBurst && <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{p.burst}</td>}
                      {showPriority && <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{p.priority}</td>}
                      <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{p.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Round Robin CPU schedule — full width */}
            {schedAlgo === "RoundRobin" && rrSchedule.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>CPU Scheduling Result (Round Robin, q = {quantum || 0})</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      {["Process", "Arrival", "Burst", "Completion", "Turnaround", "Waiting"].map((col) => (
                        <th key={col} style={{ textAlign: "left", padding: "6px 12px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rrSchedule.map((r) => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#f1f5f9" : "#0f172a" }}>{r.id}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.arrival}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.burst}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.completion}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.turnaround}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.waiting}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>Avg Waiting Time: <span style={{ fontWeight: 700, color: "#22d3ee" }}>{rrAvgWaiting.toFixed(2)}</span></span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>Avg Turnaround Time: <span style={{ fontWeight: 700, color: "#22d3ee" }}>{rrAvgTurnaround.toFixed(2)}</span></span>
                </div>
              </div>
            )}

            {/* Allocation Result — full width */}
            {mvtResults.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Allocation Result</p>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      {["Process ID", "Process Size (KB)", "Allocated Block", "Block Size (KB)", "Remaining (KB)", "Status"].map((col) => (
                        <th key={col} style={{ textAlign: "left", padding: "6px 12px", fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mvtResults.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: COLOR_HEX[jobColorIndex(r.processId) % COLOR_HEX.length] }}>{r.processId}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.processSize}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.blockId}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.allocated ? r.blockSize : "—"}</td>
                        <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: isDark ? "#cbd5e1" : "#475569" }}>{r.allocated ? r.remaining : "—"}</td>
                        <td style={{ padding: "6px 12px", verticalAlign: "middle" }}>{renderStatusPill(r.allocated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Memory Utilization — full width */}
            {mvtResults.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Memory Utilization{compactionEnabled ? " (After Compaction)" : ""}
                </p>
                {renderStatsPanel(mvtStats, true)}
              </div>
            )}

            {/* Memory Map — full width, same timeline visual as simulation */}
            {mvtMemoryMap.length > 0 && (
              <div style={{ borderRadius: 16, border: `1px solid ${isDark ? (compactionEnabled ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)") : "rgba(0,0,0,0.08)"}`, background: "transparent", padding: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Memory Map{compactionEnabled ? " · With Compaction" : ""}
                </p>
                {renderExportMemoryMapTimeline(
                  compactionEnabled ? compactedTimeline : timeline,
                  Number(totalMemory) || 1,
                  jobColorIndex
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}