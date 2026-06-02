/**
 * Introduction Topic - Quiz Data
 * 10 questions for the Introduction to Operating Systems topic
 */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary role of an Operating System?",
    options: [
      "To act as an intermediary between the user and the computer hardware",
      "To replace the need for hardware",
      "To only run video games",
      "To permanently store all user data",
    ],
    correctAnswer: 0,
    explanation:
      "The lesson defines an operating system as an intermediary or interface between the user and the computer hardware.",
  },
  {
    id: 2,
    question: "Which set lists hardware components from the lesson?",
    options: ["CPU, Memory, I/O Devices", "Windows, Linux, UNIX", "Compilers, Database systems, Business programs", "People, machines, and other computers"],
    correctAnswer: 0,
    explanation: "The hardware components listed in the lesson are CPU, Memory, and I/O Devices.",
  },
  {
    id: 3,
    question: "Which of the following is an operating system component named in the lesson?",
    options: [
      "Windows",
      "Compilers",
      "Video games",
      "Business programs",
    ],
    correctAnswer: 1,
    explanation: "Windows, Linux, UNIX, MS-DOS, and MacOS are listed as operating system components.",
  },
  {
    id: 4,
    question: "Which of the following is an application program category from the lesson?",
    options: [
      "Compilers",
      "CPU",
      "Memory",
      "I/O Devices",
    ],
    correctAnswer: 0,
    explanation: "Compilers, database systems, video games, and business programs are listed as application programs.",
  },
  {
    id: 5,
    question: "Who are the users of a computer system according to the lesson?",
    options: [
      "People, machines, and other computers",
      "Only programmers",
      "Only operating systems",
      "Only hardware vendors",
    ],
    correctAnswer: 0,
    explanation: "The lesson states that users include people, machines, and other computers.",
  },
  {
    id: 6,
    question: "Which choice best matches one goal of an operating system from the lesson?",
    options: [
      "Provide a convenient environment for users",
      "Remove the need for hardware resources",
      "Hide all applications from users",
      "Only run in the background without any purpose",
    ],
    correctAnswer: 0,
    explanation: "The lesson lists providing a convenient environment as one of the goals of an operating system.",
  },
  {
    id: 7,
    question: "What does the resource allocator manage and allocate?",
    options: [
      "Resources",
      "Only applications",
      "Only user names",
      "Only file extensions",
    ],
    correctAnswer: 0,
    explanation: "The lesson states that the resource allocator manages and allocates resources.",
  },
  {
    id: 8,
    question: "What is the key idea of batch systems in the lesson?",
    options: [
      "They reduce setup time by batching similar jobs or jobs with common needs",
      "They run many jobs at once on separate CPUs",
      "They eliminate the need for I/O devices",
      "They only work for gaming workloads",
    ],
    correctAnswer: 0,
    explanation: "The lesson says batch systems reduce setup time by batching similar jobs or jobs with common needs.",
  },
  {
    id: 9,
    question: "What happens in multiprogramming when one job waits for I/O?",
    options: [
      "The CPU switches to another program",
      "The computer shuts down",
      "The job is permanently deleted",
      "The user must restart the machine",
    ],
    correctAnswer: 0,
    explanation: "The lesson explains that the CPU is switched to execute another program rather than remaining idle during I/O time.",
  },
  {
    id: 10,
    question: "What is the defining idea of time-sharing systems in the lesson?",
    options: [
      "Many users share one machine simultaneously with the CPU multiplexed among jobs",
      "Only one user can use the machine forever",
      "It removes memory from the computer",
      "It works only when there is no disk storage",
    ],
    correctAnswer: 0,
    explanation: "The lesson describes time-sharing as allowing many users to share one machine simultaneously while the CPU is multiplexed among jobs.",
  },
];
