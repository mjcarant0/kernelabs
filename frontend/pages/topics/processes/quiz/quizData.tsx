/* Quiz questions for Module 3: Processes */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is a process?",
    options: [
      "A stored file waiting to be executed",
      "A program in execution",
      "A hardware component managing CPU tasks",
      "A system call invoked by the kernel",
    ],
    correctAnswer: 1,
    explanation: "A process is defined as a program in execution, meaning it is an active entity progressing sequentially.",
  },
  {
    id: 2,
    question: "What is the representation of a process in the operating system called?",
    options: ["Job queue", "Dispatcher", "Process Control Block (PCB)", "Address space"],
    correctAnswer: 2,
    explanation: "The Process Control Block (PCB) is the data structure the OS uses to store all information about a process, such as its state, registers, and scheduling info.",
  },
  {
    id: 3,
    question: "Which process state describes a process that is waiting to be assigned to a processor?",
    options: ["New", "Running", "Waiting", "Ready"],
    correctAnswer: 3,
    explanation: "The Ready state means the process is loaded in memory and fully prepared to run, but is waiting for the CPU to be allocated to it.",
  },
  {
    id: 4,
    question: "Which process state indicates the process is waiting for some event to occur, such as I/O completion?",
    options: ["Ready", "Waiting", "New", "Terminated"],
    correctAnswer: 1,
    explanation: "The Waiting state means the process cannot proceed until a specific external event takes place.",
  },
  {
    id: 5,
    question: "Which queue contains all processes in the system, regardless of their state?",
    options: ["Ready queue", "Device queue", "Job queue", "Dispatch queue"],
    correctAnswer: 2,
    explanation: "The Job queue holds every process currently in the system, while the ready and device queues are subsets for processes in specific states.",
  },
  {
    id: 6,
    question: "Which scheduler selects which process should be executed next and allocates the CPU?",
    options: ["Long-term scheduler", "Medium-term scheduler", "Short-term scheduler", "Job scheduler"],
    correctAnswer: 2,
    explanation: "The short-term scheduler or CPU scheduler makes fast, frequent decisions about which ready process gets CPU time next.",
  },
  {
    id: 7,
    question: "What is swapping?",
    options: [
      "Transferring data between the CPU and a device",
      "Removing a process from memory and reintroducing it later",
      "Switching the CPU between two running processes",
      "Allocating memory to a newly created process",
    ],
    correctAnswer: 1,
    explanation: "Swapping, handled by the medium-term scheduler, temporarily removes a process from main memory to free up space, then reintroduces it to continue where it left off.",
  },
  {
    id: 8,
    question: "What is a context switch?",
    options: [
      "Creating a new child process from a parent process",
      "Switching the CPU from one process to another",
      "Moving a process from the ready queue to a device queue",
      "Invoking a system call from a user application",
    ],
    correctAnswer: 1,
    explanation: "A context switch saves the state of the currently running process and restores the state of the next process.",
  },
  {
    id: 9,
    question: "What is an address space?",
    options: [
      "The set of all processes waiting for an I/O device",
      "A hardware mechanism that enables a device to notify the CPU",
      "A list of memory locations containing the executable program, data, and stack",
      "A function called by an application to invoke a kernel service",
    ],
    correctAnswer: 2,
    explanation: "An address space defines all the memory locations a process can use, including its code, data, and stack regions.",
  },
  {
    id: 10,
    question: "When a parent process uses 'abort' against a child process, what happens?",
    options: [
      "The child process is moved to the waiting state",
      "The child process is swapped out of memory",
      "The parent terminates the execution of the child process",
      "The child process is promoted to the ready queue",
    ],
    correctAnswer: 2,
    explanation: "Abort is a process termination operation where a parent process forcibly ends the execution of one of its child processes before it completes normally.",
  },
];
