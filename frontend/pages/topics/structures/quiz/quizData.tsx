/* Questions for Module 2: OS Structures */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What connects hardware components like the CPU, memory, and device controllers in a computer system?",
    options: [
      "Kernel",
      "System bus",
      "Interrupt",
      "Device status table",
    ],
    correctAnswer: 1,
    explanation:
      "The system bus is the communication pathway that connects the CPU, memory, and all device controllers."
  },
  {
    id: 2,
    question: "What is a trap in operating systems?",
    options: [
      "A hardware mechanism that blocks unauthorized memory access",
      "A type of direct memory access transfer",
      "A software-generated interrupt caused by an error or user request",
      "A synchronous I/O waiting mechanism",
    ],
    correctAnswer: 2,
    explanation:
      "A trap is a software-generated interrupt triggered either by a program error or a user request, transferring control to the OS."
  },
  {
    id: 3,
    question: "Which I/O method idles the CPU until the next interrupt and allows at most one outstanding I/O request at a time?",
    options: ["Asynchronous I/O", "Direct Memory Access", "Buffered I/O", "Synchronous I/O"],
    correctAnswer: 3,
    explanation:
      "Synchronous I/O keeps the CPU idle and waiting until the current I/O operation completes before accepting another request."
  },
  {
    id: 4,
    question: "What is the purpose of Direct Memory Access (DMA)?",
    options: [
      "To allow the CPU to directly manage I/O device interrupts",
      "To transfer blocks of data from buffer storage to main memory without CPU intervention",
      "To synchronize I/O operations across multiple devices",
      "To protect memory regions from unauthorized access",
    ],
    correctAnswer: 1,
    explanation:
      "DMA allows high-speed I/O device controllers to transfer data directly to main memory, freeing the CPU from handling each transfer manually."
  },
  {
    id: 5,
    question: "Which type of storage is the only large storage media that the CPU can access directly?",
    options: ["Magnetic disk", "Secondary storage", "Main memory", "Cache memory"],
    correctAnswer: 2,
    explanation:
      "Main memory (RAM) is the only large storage medium the CPU can access directly; all other storage must be loaded into it first."
  },
  {
    id: 6,
    question: "In Dual Mode Operation, which mode handles execution done on behalf of the operating system?",
    options: ["User mode", "Protected mode", "Monitor mode", "Privileged user mode"],
    correctAnswer: 2,
    explanation:
      "Monitor mode grants the OS full hardware access to safely manage system resources on behalf of all programs."
  },
  {
    id: 7,
    question: "What is the role of the Base Register in memory protection?",
    options: [
      "It contains the size of the legal address range",
      "It holds the smallest legal physical memory address",
      "It maps virtual addresses to physical addresses",
      "It stores the interrupt vector address",
    ],
    correctAnswer: 1,
    explanation:
      "The Base Register defines the lower boundary of a program's legal memory range, preventing it from accessing memory below that address."
  },
  {
    id: 8,
    question: "What is the interface between a running program and the operating system called?",
    options: ["Command interpreter", "Device driver", "Bootstrap program", "System call"],
    correctAnswer: 3,
    explanation:
      "System calls are the mechanism through which running programs request services from the operating system, such as I/O operations or file access."
  },
  {
    id: 9,
    question: "Which OS structure organizes the operating system so that lower levels are independent of upper levels?",
    options: ["Simple", "Layered", "Microkernel", "Modular"],
    correctAnswer: 1,
    explanation:
      "Layered structure divides the OS into hierarchical levels where each layer only interacts with the layer directly below it."
  },
  {
    id: 10,
    question: "Which of the following is NOT a Core OS Task?",
    options: ["Process Management", "Memory Management", "Network Management", "File System Management"],
    correctAnswer: 2,
    explanation:
      "The Core OS Tasks are Process Management, Memory Management, Secondary Storage & I/O Management, File System Management, and Protection & Security."
  },
];