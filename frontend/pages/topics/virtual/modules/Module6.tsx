/* Virtual Memory */

export interface Module6Section {
  id: string;
  title: string;
  content: string;
}

export const module6Sections: Module6Section[] = [
  {
    id: "6-1-what-is-virtual-memory",
    title: "6.1 What is Virtual Memory?",
    content:
      "Virtual memory separates a process's logical memory from physical memory, allowing a process to execute even if it is not completely loaded into RAM. Only the parts currently needed must be in memory.",
  },
  {
    id: "6-2-demand-paging",
    title: "6.2 Demand Paging",
    content: `Demand paging only loads a page into memory when it is actually needed (lazy loading). This results in less I/O, less memory usage, faster response, and support for more users.

Each page in the page table has a valid/invalid bit:
- Valid (v) — the page is legal and currently in memory.
- Invalid (i) — the page is either not valid or is on disk.

A page fault occurs when a process tries to access a page that is not in memory. The hardware detects the invalid bit, traps to the OS, and the missing page is loaded from disk.

In pure demand paging, a process starts with no pages in memory and faults its way in — every page is loaded only on first access.`,
  },
  {
    id: "6-3-effective-access-time",
    title: "6.3 Effective Access Time (EAT)",
    content: `Performance of demand paging is measured using Effective Access Time (EAT), where p is the probability of a page fault:

EAT = (1 – p) × memory access time + p × page fault time

A low page fault probability (p close to 0) keeps EAT close to normal memory access time. As p increases, the cost of frequent disk access dominates and performance degrades significantly.`,
  },
  {
    id: "6-4-page-replacement",
    title: "6.4 Page Replacement",
    content: `When no free frame is available, the OS picks a victim frame, writes its contents to disk if modified, and loads the needed page into that frame.

Two algorithms are needed to fully implement demand paging with page replacement:
1. A page replacement algorithm — decides which frame to evict.
2. A frame allocation algorithm — decides how many frames each process receives.`,
  },
  {
    id: "6-5-page-replacement-algorithms",
    title: "6.5 Page Replacement Algorithms",
    content: `The best algorithm has the lowest page fault rate. Algorithms are evaluated by running them against a reference string and counting faults.

FIFO — replaces the oldest page in memory. The oldest page may still be frequently used. Subject to Belady's Anomaly: adding more frames can sometimes increase page faults.

Optimal (OPT/MIN) — replaces the page that will not be used for the longest time in the future. Achieves the lowest possible fault rate and never suffers Belady's Anomaly. Not practical to implement since it requires future knowledge; used mainly as a benchmark.

LRU — replaces the page that has not been used for the longest time. Does not suffer Belady's Anomaly but requires hardware support.

LRU Approximation — uses a reference bit per page. If the bit is 0, replace the page. If the bit is 1, give it a second chance: reset the bit to 0 and move on. The Enhanced Second Chance version adds a modify bit, classifying pages into four pairs and replacing the least recently used, unmodified page first.

Counting-based:
- LFU (Least Frequently Used) — replaces the page with the fewest references.
- MFU (Most Frequently Used) — replaces the page with the most references, reasoning that heavily used pages are likely done while rarely used ones just arrived.`,
  },
  {
    id: "6-6-frame-allocation",
    title: "6.6 Frame Allocation",
    content: `The OS cannot allocate more frames than are physically available. Giving a process fewer frames raises its page fault rate.

- The minimum frames per process is set by the system architecture.
- The maximum is limited by available physical memory.

Allocating too few frames to a process causes thrashing, where the process spends more time paging than executing.`,
  },
];

export default function Module6() {
  return null;
}