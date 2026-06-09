"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type Algorithm = "Paging" | "Segmentation" | "PageReplacement";
type ReplacementAlgo = "FIFO" | "LRU" | "Optimal";

const algorithmInfo: Record<Algorithm, { label: string; description: string }> = {
  Paging: { label: "Paging", description: "Divides logical memory into fixed-size pages and physical memory into frames. The page table maps each page to a frame in physical memory." },
  Segmentation: { label: "Segmentation", description: "Divides memory into variable-size segments based on logical divisions (code, stack, heap). Each segment has a base address and a limit." },
  PageReplacement: { label: "Page Replacement", description: "When physical memory is full and a new page is needed, the OS uses a replacement algorithm to decide which page to evict." },
};

interface PageEntry { pageNumber: string; frameNumber: string; validBit: "1" | "0"; }
interface Segment { segmentId: string; base: string; limit: string; size: string; label: string; }
interface ReplacementStep { page: number; frames: (number | null)[]; pageFault: boolean; evicted: number | null; }

function runFIFO(refs: number[], numFrames: number): ReplacementStep[] {
  const frames: (number | null)[] = Array(numFrames).fill(null);
  const queue: number[] = [];
  const steps: ReplacementStep[] = [];
  for (const page of refs) {
    if (frames.includes(page)) { steps.push({ page, frames: [...frames], pageFault: false, evicted: null }); }
    else {
      let evicted: number | null = null;
      if (queue.length === numFrames) { const victim = queue.shift()!; const idx = frames.indexOf(victim); evicted = victim; frames[idx] = page; }
      else { frames[frames.indexOf(null)] = page; }
      queue.push(page);
      steps.push({ page, frames: [...frames], pageFault: true, evicted });
    }
  }
  return steps;
}

function runLRU(refs: number[], numFrames: number): ReplacementStep[] {
  const frames: (number | null)[] = Array(numFrames).fill(null);
  const steps: ReplacementStep[] = [];
  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    if (frames.includes(page)) { steps.push({ page, frames: [...frames], pageFault: false, evicted: null }); }
    else {
      let evicted: number | null = null;
      if (!frames.includes(null)) {
        let lruIdx = 0, lruTime = Infinity;
        for (let f = 0; f < frames.length; f++) { const lastUsed = refs.slice(0, i).lastIndexOf(frames[f]!); if (lastUsed < lruTime) { lruTime = lastUsed; lruIdx = f; } }
        evicted = frames[lruIdx]; frames[lruIdx] = page;
      } else { frames[frames.indexOf(null)] = page; }
      steps.push({ page, frames: [...frames], pageFault: true, evicted });
    }
  }
  return steps;
}

function runOptimal(refs: number[], numFrames: number): ReplacementStep[] {
  const frames: (number | null)[] = Array(numFrames).fill(null);
  const steps: ReplacementStep[] = [];
  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    if (frames.includes(page)) { steps.push({ page, frames: [...frames], pageFault: false, evicted: null }); }
    else {
      let evicted: number | null = null;
      if (!frames.includes(null)) {
        let farthestIdx = 0, farthestTime = -1;
        for (let f = 0; f < frames.length; f++) { const nextUse = refs.slice(i + 1).indexOf(frames[f]!); const time = nextUse === -1 ? Infinity : nextUse; if (time > farthestTime) { farthestTime = time; farthestIdx = f; } }
        evicted = frames[farthestIdx]; frames[farthestIdx] = page;
      } else { frames[frames.indexOf(null)] = page; }
      steps.push({ page, frames: [...frames], pageFault: true, evicted });
    }
  }
  return steps;
}

const COLORS = ["bg-cyan-500","bg-blue-500","bg-purple-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-indigo-500","bg-teal-500","bg-pink-500","bg-orange-500"];

export default function VirtualMemory() {
  const [selected, setSelected] = useState<Algorithm>("Paging");
  const [pageSize, setPageSize] = useState("");
  const [pageEntries, setPageEntries] = useState<PageEntry[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [refString, setRefString] = useState("");
  const [numFrames, setNumFrames] = useState("3");
  const [replacementAlgo, setReplacementAlgo] = useState<ReplacementAlgo>("FIFO");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);
  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) { html.classList.remove("dark"); setIsDark(false); }
    else { html.classList.add("dark"); setIsDark(true); }
  }

  function updatePage(i: number, field: keyof PageEntry, value: string) {
    setPageEntries((prev: PageEntry[]) => prev.map((e: PageEntry, idx: number) => idx === i ? { ...e, [field]: value } : e));
  }
  function addPage() { setPageEntries((prev: PageEntry[]) => [...prev, { pageNumber: String(prev.length), frameNumber: "0", validBit: "1" }]); }
  function removePage(i: number) { if (pageEntries.length <= 1) return; setPageEntries((prev: PageEntry[]) => prev.filter((_: PageEntry, idx: number) => idx !== i)); }
  function updateSegment(i: number, field: keyof Segment, value: string) {
    setSegments((prev: Segment[]) => prev.map((s: Segment, idx: number) => idx === i ? { ...s, [field]: value } : s));
  }
  function addSegment() { setSegments((prev: Segment[]) => [...prev, { segmentId: String(prev.length), base: "0", limit: "0", size: "0", label: "New" }]); }
  function removeSegment(i: number) { if (segments.length <= 1) return; setSegments((prev: Segment[]) => prev.filter((_: Segment, idx: number) => idx !== i)); }

  function focusNextPage(i: number, field: string) {
    if (i + 1 >= pageEntries.length) return;
    setTimeout(() => { const el = document.querySelector<HTMLInputElement>(`[data-table="page"][data-row="${i+1}"][data-field="${field}"]`); el?.focus(); el?.select(); }, 50);
  }
  function focusNextSeg(i: number, field: string) {
    if (i + 1 >= segments.length) return;
    setTimeout(() => { const el = document.querySelector<HTMLInputElement>(`[data-table="seg"][data-row="${i+1}"][data-field="${field}"]`); el?.focus(); el?.select(); }, 50);
  }

  const refs = refString.trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
  const frames = Math.max(1, parseInt(numFrames) || 1);
  const steps = selected === "PageReplacement"
    ? replacementAlgo === "FIFO" ? runFIFO(refs, frames) : replacementAlgo === "LRU" ? runLRU(refs, frames) : runOptimal(refs, frames)
    : [];
  const pageFaults = steps.filter((s) => s.pageFault).length;
  const uniquePages = [...new Set(refs)];
  const [logicalInput, setLogicalInput] = useState(0);
  const pagingResult = translatePagingAddress(logicalInput);
  const [segInput, setSegInput] = useState({ segmentId: 0, offset: 0 });
  const segResult = translateSegmentAddress(segInput.segmentId, segInput.offset);

  function translateSegmentAddress(segmentId: number, offset: number) {
  const segment = segments.find(s => Number(s.segmentId) === segmentId);

  if (!segment) {
    return {valid: false, reason: "Invalid Segment"};
  }

  const base = Number(segment.base);
  const limit = Number(segment.limit);

  if (offset >= limit) {
    return {valid: false, reason: "Segmentation Fault"};
  }

  return {
    valid: true,
    segmentId,
    base,
    offset,
    physicalAddress: base + offset
  };
}


  function translatePagingAddress(logicalAddress: number) {
    const size = Number(pageSize);
    const pageNumber = Math.floor(logicalAddress/size);
    const offset = logicalAddress % size;
    const entry = pageEntries.find(e => Number(e.pageNumber) === pageNumber);

    if (!entry || entry.validBit === "0") {
      return {
        valid: false,
        reason: "Page Fault"
      };
    }

    const frame = Number(entry.frameNumber);
    const physicalAddress = frame * size + offset;

    return {
      valid: true,
      pageNumber,
      frame,
      offset,
      physicalAddress
    };
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
        <div className="text-5xl mb-4">🔄</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">Virtual Memory</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm max-w-xl mx-auto">
          <span className="text-cyan-500">&gt;</span> Explore paging, segmentation, and page replacement algorithms with live visualizations
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 flex flex-col md:flex-row gap-6">
        {/* Left panel */}
        <div className="md:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 sticky top-20">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Techniques</p>
            <div className="flex flex-col gap-1">
              {(Object.keys(algorithmInfo) as Algorithm[]).map((algo) => (
                <button key={algo} onClick={() => setSelected(algo)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${selected === algo ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"}`}>
                  {algorithmInfo[algo].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{algorithmInfo[selected].label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{algorithmInfo[selected].description}</p>
          </div>

          {/* PAGING */}
          {selected === "Paging" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page Table</p>
                  <button onClick={addPage} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add Row</button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/8">
                      {["Page Number","Frame Number","Valid Bit"].map((col) => (
                        <th key={col} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{col}</th>
                      ))}
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                        <td className="py-2 px-3">
                          <input value={entry.pageNumber} onChange={(e) => updatePage(i, "pageNumber", e.target.value)}
                            data-table="page" data-row={i} data-field="pageNumber"
                            onKeyDown={(e) => e.key === "Enter" && focusNextPage(i, "pageNumber")}
                            className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                        </td>
                        <td className="py-2 px-3">
                          <input value={entry.frameNumber} onChange={(e) => updatePage(i, "frameNumber", e.target.value)}
                            data-table="page" data-row={i} data-field="frameNumber"
                            onKeyDown={(e) => e.key === "Enter" && focusNextPage(i, "frameNumber")}
                            className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" />
                        </td>
                        <td className="py-2 px-3">
                          <select value={entry.validBit} onChange={(e) => updatePage(i, "validBit", e.target.value as "1"|"0")}
                            className="bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400 dark:bg-slate-900">
                            <option value="1">1 (Valid)</option>
                            <option value="0">0 (Invalid)</option>
                          </select>
                        </td>
                        <td className="py-2 px-1">
                          <button onClick={() => removePage(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Page → Frame Mapping</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mb-2 text-center">Logical Memory (Pages)</p>
                    <div className="flex flex-col gap-1">
                      {pageEntries.map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border ${entry.validBit === "1" ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-700 dark:text-cyan-300" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/8 text-slate-400"}`}>
                          <span>Page {entry.pageNumber}</span>
                          <span>{entry.validBit === "1" ? `→ Frame ${entry.frameNumber}` : "Not in memory"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-2 text-center">Physical Memory (Frames)</p>
                    <div className="flex flex-col gap-1">
                      {pageEntries.filter(e => e.validBit === "1").map((entry, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono bg-blue-500/10 border border-blue-400/30 text-blue-700 dark:text-blue-300">
                          <span>Frame {entry.frameNumber}</span><span>← Page {entry.pageNumber}</span>
                        </div>
                      ))}
                      {pageEntries.filter(e => e.validBit === "1").length === 0 && <p className="text-xs text-slate-400 text-center font-mono">No valid pages</p>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex gap-4 text-xs font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Valid: {pageEntries.filter(e => e.validBit === "1").length}</span>
                  <span className="text-rose-500 dark:text-rose-400">✗ Invalid: {pageEntries.filter(e => e.validBit === "0").length}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Address Translation
                </p>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <label className="font-mono text-xs text-slate-400 block mb-1">Page Size</label>
                    <input
                      type="number" min={1} value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="w-28 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-slate-400 block mb-1">Logical Address</label>
                    <input
                      type="number" min={0} value={logicalInput}
                      onChange={(e) => setLogicalInput(Number(e.target.value))}
                      className="w-28 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="mt-4 rounded-xl p-4 font-mono text-sm
                  bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                  {!pageSize || Number(pageSize) <= 0 ? (
                    <p className="text-slate-400">Enter a page size to translate addresses.</p>
                  ) : pagingResult.valid ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Valid Translation</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Logical <span className="text-cyan-500">{logicalInput}</span>
                        {" → "} Page <span className="text-cyan-500">{pagingResult.pageNumber}</span>
                        , Offset <span className="text-cyan-500">{pagingResult.offset}</span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Frame <span className="text-blue-500">{pagingResult.frame}</span>
                        {" → "} Physical Address{" "}
                        <span className="text-blue-400 font-bold">{pagingResult.physicalAddress}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-rose-500 font-bold">✗ {pagingResult.reason}</span>
                  )}
                </div>
              </div>

            </>
          )}

          {/* SEGMENTATION */}
          {selected === "Segmentation" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">Segment Table</p>
                  <button onClick={addSegment} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/20 transition-colors">+ Add Row</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/8">
                        {["Segment ID","Label","Base Address","Limit","Size (bytes)"].map((col) => (
                          <th key={col} className="text-left py-2 px-3 font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                        ))}
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((seg, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                          <td className="py-2 px-3"><input value={seg.segmentId} onChange={(e) => updateSegment(i, "segmentId", e.target.value)} data-table="seg" data-row={i} data-field="segmentId" onKeyDown={(e) => e.key === "Enter" && focusNextSeg(i, "segmentId")} className="w-16 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" /></td>
                          <td className="py-2 px-3"><input value={seg.label} onChange={(e) => updateSegment(i, "label", e.target.value)} data-table="seg" data-row={i} data-field="label" onKeyDown={(e) => e.key === "Enter" && focusNextSeg(i, "label")} className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" /></td>
                          <td className="py-2 px-3"><input type="number" value={seg.base} onChange={(e) => updateSegment(i, "base", e.target.value)} data-table="seg" data-row={i} data-field="base" onKeyDown={(e) => e.key === "Enter" && focusNextSeg(i, "base")} className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" /></td>
                          <td className="py-2 px-3"><input type="number" value={seg.limit} onChange={(e) => updateSegment(i, "limit", e.target.value)} data-table="seg" data-row={i} data-field="limit" onKeyDown={(e) => e.key === "Enter" && focusNextSeg(i, "limit")} className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" /></td>
                          <td className="py-2 px-3"><input type="number" value={seg.size} onChange={(e) => updateSegment(i, "size", e.target.value)} data-table="seg" data-row={i} data-field="size" onKeyDown={(e) => e.key === "Enter" && focusNextSeg(i, "size")} className="w-20 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-400" /></td>
                          <td className="py-2 px-1"><button onClick={() => removeSegment(i)} className="text-slate-300 dark:text-slate-600 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Memory Map</p>
                <div className="flex flex-col gap-2">
                  {segments.map((seg, i) => {
                    const totalSize = segments.reduce((sum, s) => sum + (Number(s.size) || 0), 0);
                    const width = totalSize > 0 ? Math.max((Number(seg.size) / totalSize) * 100, 5) : 100 / segments.length;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400 w-16 shrink-0">{seg.label || `Seg ${seg.segmentId}`}</span>
                        <div className="flex-1 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/8 bg-slate-100 dark:bg-white/5">
                          <div style={{ width: `${width}%` }} className={`h-full flex items-center justify-center text-white text-xs font-bold ${COLORS[i % COLORS.length]}`}>
                            {Number(seg.size) > 0 ? `${seg.size}B` : ""}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-slate-400 w-28 shrink-0 text-right">Base: {seg.base}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8
                bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Address Translation
                </p>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <label className="font-mono text-xs text-slate-400 block mb-1">Segment ID</label>
                    <input
                      type="number" min={0} value={segInput.segmentId}
                      onChange={(e) => setSegInput(s => ({ ...s, segmentId: Number(e.target.value) }))}
                      className="w-28 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-slate-400 block mb-1">Offset</label>
                    <input
                      type="number" min={0} value={segInput.offset}
                      onChange={(e) => setSegInput(s => ({ ...s, offset: Number(e.target.value) }))}
                      className="w-28 bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="mt-4 rounded-xl p-4 font-mono text-sm
                  bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                  {segments.length === 0 ? (
                    <p className="text-slate-400">Add segments above to translate addresses.</p>
                  ) : segResult.valid ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Valid Translation</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Segment <span className="text-cyan-500">{segResult.segmentId}</span>
                        {" + "} Offset <span className="text-cyan-500">{segResult.offset}</span>
                        {" → "} Base <span className="text-cyan-500">{segResult.base}</span>
                        {" + "} Offset <span className="text-cyan-500">{segResult.offset}</span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Physical Address{" "}
                        <span className="text-blue-400 font-bold">{segResult.physicalAddress}</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-rose-500 font-bold">✗ {segResult.reason}</span>
                  )}
                </div>
              </div>              
            </>
          )}

          {/* PAGE REPLACEMENT */}
          {selected === "PageReplacement" && (
            <>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Configuration</p>
                <div className="flex gap-2 mb-5 flex-wrap">
                  {(["FIFO","LRU","Optimal"] as ReplacementAlgo[]).map((algo) => (
                    <button key={algo} onClick={() => setReplacementAlgo(algo)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${replacementAlgo === algo ? "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40" : "text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                      {algo}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Reference String (space-separated)</label>
                    <input value={refString} onChange={(e) => setRefString(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                  </div>
                  <div className="md:w-36">
                    <label className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">No. of Frames</label>
                    <input type="number" min={1} value={numFrames} onChange={(e) => setNumFrames(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500" />
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs font-mono">
                  <span className="text-rose-500 dark:text-rose-400">Page Faults: {pageFaults}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Hits: {steps.length - pageFaults}</span>
                  <span className="text-slate-400">Total: {steps.length}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5">
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Frame State per Reference</p>
                {steps.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-slate-400 font-mono text-sm"><span className="text-cyan-500 mr-2">&gt;</span> Enter a reference string to simulate</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="text-xs font-mono border-collapse min-w-max">
                      <thead>
                        <tr>
                          <td className="pr-3 pb-2 text-slate-400 dark:text-slate-500 whitespace-nowrap">Reference</td>
                          {steps.map((s, i) => (
                            <td key={i} className={`w-10 text-center pb-2 font-bold ${s.pageFault ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{s.page}</td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: frames }).map((_, fi) => (
                          <tr key={fi}>
                            <td className="pr-3 py-1 text-slate-400 dark:text-slate-500">F{fi + 1}</td>
                            {steps.map((s, i) => {
                              const val = s.frames[fi];
                              const colorIdx = val !== null ? uniquePages.indexOf(val) : -1;
                              return (
                                <td key={i} className="w-10 py-1 text-center">
                                  {val !== null
                                    ? <span className={`inline-flex w-7 h-7 rounded-md text-white text-xs font-bold items-center justify-center ${COLORS[colorIdx % COLORS.length]}`}>{val}</span>
                                    : <span className="inline-block w-7 h-7 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8" />}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr>
                          <td className="pr-3 pt-2 text-slate-400 dark:text-slate-500">Fault</td>
                          {steps.map((s, i) => (
                            <td key={i} className="w-10 pt-2 text-center">{s.pageFault ? <span className="text-rose-500 font-bold">✗</span> : <span className="text-emerald-500">✓</span>}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
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