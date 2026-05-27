/* Quiz questions for Module 4: CPU Scheduling */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary goal of CPU Scheduling in a multiprogrammed OS?",
    options: [
      "To minimize the number of processes in the system",
      "To decide which process in the ready queue is allocated the CPU to maximize utilization",
      "To manage memory allocation for running processes",
      "To handle I/O requests from device queues",
    ],
    correctAnswer: 1,
    explanation: "CPU Scheduling exists to keep the CPU as busy as possible by selecting which ready process should run next.",
  },
  {
    id: 2,
    question: "In nonpreemptive scheduling, what happens once a process enters the running state?",
    options: [
      "It can be interrupted by the OS at any time",
      "It is moved to the waiting state after one time quantum",
      "It continues running until it terminates or blocks itself for I/O",
      "It shares the CPU equally with other ready processes",
    ],
    correctAnswer: 2,
    explanation: "Nonpreemptive scheduling lets a process hold the CPU uninterrupted until it finishes or voluntarily gives it up by waiting for I/O.",
  },
  {
    id: 3,
    question: "What distinguishes preemptive scheduling from nonpreemptive scheduling?",
    options: [
      "Preemptive scheduling only works with a single process at a time",
      "The OS can interrupt a running process and move it back to the ready state",
      "Preemptive scheduling never uses a ready queue",
      "Processes must request CPU time explicitly in preemptive scheduling",
    ],
    correctAnswer: 1,
    explanation: "In preemptive scheduling, the OS retains the authority to forcibly remove a running process from the CPU and replace it with a higher-priority or next-in-line process.",
  },
  {
    id: 4,
    question: "What is the formula for Turnaround Time?",
    options: [
      "Burst Time − Arrival Time",
      "Finish Time − Burst Time",
      "Finish Time − Arrival Time",
      "Turnaround Time − Waiting Time",
    ],
    correctAnswer: 2,
    explanation: "Turnaround Time measures the total time from when a process arrives to when it completes.",
  },
  {
    id: 5,
    question: "What is the formula for Waiting Time?",
    options: [
      "Finish Time − Arrival Time",
      "Turnaround Time − Burst Time",
      "Burst Time / End Time × 100",
      "Finish Time − Burst Time",
    ],
    correctAnswer: 1,
    explanation: "Waiting Time is the portion of Turnaround Time that the process spent idle in the ready queue.",
  },
  {
    id: 6,
    question: "What is the convoy effect in First-Come, First-Served scheduling?",
    options: [
      "Long processes are starved because short processes always run first",
      "Short processes are forced to wait behind a long CPU-bound process",
      "Processes with equal burst times are given equal CPU time",
      "The CPU remains idle while all processes wait in the device queue",
    ],
    correctAnswer: 1,
    explanation: "The convoy effect occurs in FCFS when a single long process holds the CPU, causing many shorter processes to queue up and wait.",
  },
  {
    id: 7,
    question: "Which scheduling algorithm gives the minimum average waiting time?",
    options: [
      "First-Come, First-Served", "Round Robin", "Priority Scheduling", "Shortest-Job-First"],
    correctAnswer: 3,
    explanation: "Shortest Job First is optimal for minimizing average waiting time because it always runs the quickest available process next.",
  },
  {
    id: 8,
    question: "What is starvation in the context of CPU scheduling?",
    options: [
      "The CPU sitting idle due to no ready processes",
      "A process that is never executed because higher-priority or shorter processes keep taking precedence",
      "A process consuming too much CPU time in Round Robin",
      "The OS failing to switch context between processes",
    ],
    correctAnswer: 1,
    explanation: "Starvation happens when a process is delayed because other processes continuously take priority over it.",
  },
  {
    id: 9,
    question: "In Priority Scheduling, which process gets the CPU first?",
    options: [
      "The process that arrived first",
      "The process with the longest burst time",
      "The process with the smallest integer priority number",
      "The process with the largest integer priority number",
    ],
    correctAnswer: 2,
    explanation: "In Priority Scheduling, the process with the lowest priority number is always scheduled first.",
  },
  {
    id: 10,
    question: "Which scheduling algorithm was designed especially for time-sharing systems and limits each process to one time quantum?",
    options: ["Shortest Job First", "First-Come, First-Served", "Priority Scheduling", "Round Robin"],
    correctAnswer: 3,
    explanation: "Round Robin is specifically designed for time-sharing by cycling through all processes and giving each a fixed time quantum.",
  },
];
