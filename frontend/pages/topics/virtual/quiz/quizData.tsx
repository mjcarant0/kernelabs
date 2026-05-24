/* Quiz questions for Module 6: Virtual Memory */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the key benefit of virtual memory?",
    options: [
      "It increases the physical RAM available to the CPU",
      "It allows a process to execute even if it is not completely loaded into RAM",
      "It eliminates the need for a page table",
      "It speeds up disk read times",
    ],
    correctAnswer: 1,
    explanation: "Virtual memory separates logical memory from physical memory, so a process only needs its currently used parts in RAM and can still execute fully.",
  },
  {
    id: 2,
    question: "What is demand paging?",
    options: [
      "Loading all pages of a process into memory before it starts",
      "Swapping entire processes in and out of memory",
      "Loading a page into memory only when it is actually needed",
      "Pre-fetching pages based on predicted future access",
    ],
    correctAnswer: 2,
    explanation: "Demand paging uses lazy loading, a page is only brought into memory when the process actually tries to access it, saving I/O and memory.",
  },
  {
    id: 3,
    question: "What does an invalid bit in a page table entry indicate?",
    options: [
      "The page is currently being written to disk",
      "The page is legal and in memory",
      "The page is either not valid or is currently on disk",
      "The page has been recently accessed",
    ],
    correctAnswer: 2,
    explanation: "An invalid bit means the page is either outside the process's legal address space or is valid but currently stored on disk rather than in RAM.",
  },
  {
    id: 4,
    question: "What happens when a page fault occurs?",
    options: [
      "The process is terminated immediately",
      "The CPU skips the missing instruction and continues",
      "The hardware detects the invalid bit, traps to the OS, and the missing page is loaded from disk",
      "The OS allocates additional RAM to the process",
    ],
    correctAnswer: 2,
    explanation: "A page fault triggers a trap to the OS, which locates the needed page on disk, loads it into a free frame, and resumes the process.",
  },
  {
    id: 5,
    question: "In the EAT formula, what does p represent?",
    options: [
      "The physical address translation time",
      "The probability of a page fault",
      "The number of pages in memory",
      "The page replacement penalty",
    ],
    correctAnswer: 1,
    explanation: "In the formula, p is the probability that any given memory access results in a page fault.",
  },
  {
    id: 6,
    question: "What is Belady's Anomaly?",
    options: [
      "LRU performing worse than FIFO on certain reference strings",
      "A situation where adding more frames sometimes increases the number of page faults in FIFO",
      "The optimal algorithm failing to minimize page faults",
      "A page fault occurring on every memory access",
    ],
    correctAnswer: 1,
    explanation: "Belady's Anomaly is the counterintuitive behaviour in FIFO where giving a process more frames can actually result in more page faults on certain reference strings.",
  },
  {
    id: 7,
    question: "Which page replacement algorithm is considered optimal but not practical to implement?",
    options: ["FIFO", "LRU", "LFU", "OPT/MIN"],
    correctAnswer: 3,
    explanation: "The Optimal algorithm replaces the page not needed for the longest future time, giving the lowest fault rate, but it requires knowledge of future references which is impossible at runtime.",
  },
  {
    id: 8,
    question: "Which page replacement algorithm replaces the page that has not been used for the longest time and does not suffer from Belady's Anomaly?",
    options: ["FIFO", "LRU", "MFU", "LFU"],
    correctAnswer: 1,
    explanation: "LRU (Least Recently Used) removes the page idle the longest and is free from Belady's Anomaly, though it requires hardware support to track usage.",
  },
  {
    id: 9,
    question: "In LRU Approximation with the second-chance algorithm, what happens when a page's reference bit is 1?",
    options: [
      "The page is immediately replaced",
      "The page is written to disk",
      "The bit is reset to 0 and the page is given another chance",
      "The page is promoted to the top of the queue",
    ],
    correctAnswer: 2,
    explanation: "A reference bit of 1 means the page was recently used; the algorithm resets it to 0 and moves on, giving it a second chance before considering it for replacement.",
  },
  {
    id: 10,
    question: "What is the effect of allocating too few frames to a process?",
    options: [
      "The process runs faster due to smaller page tables",
      "External fragmentation increases",
      "The process's page fault rate increases, potentially causing thrashing",
      "The OS switches to static linking automatically",
    ],
    correctAnswer: 2,
    explanation: "Too few frames force the process to page in and out constantly — a condition called thrashing — where more time is spent on paging than on actual execution.",
  },
];