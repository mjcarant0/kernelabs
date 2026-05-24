/**
 * 10 questions for the Deadlocks
 */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is a deadlock?",
    options: [
      "A situation where processes are blocked because each holds a resource and waits for one held by another",
      "A condition where the CPU runs at maximum capacity",
      "A technique for speeding up process scheduling",
      "A method for releasing memory automatically",
    ],
    correctAnswer: 0,
    explanation:
      "A deadlock occurs when a set of processes are all blocked, each holding a resource and waiting to acquire a resource held by another process in the set.",
  },
  {
    id: 2,
    question: "What is the correct sequence a process must follow when using a resource?",
    options: [
      "Request → Use → Release",
      "Use → Request → Release",
      "Release → Request → Use",
      "Request → Release → Use",
    ],
    correctAnswer: 0,
    explanation:
      "The protocol follows as: Request the resource, Use the resource, then Release the resource after use.",
  },
  {
    id: 3,
    question: "Which of the four necessary conditions for deadlock means that only one process at a time can use a resource?",
    options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"],
    correctAnswer: 0,
    explanation:
      "Mutual Exclusion means at least one resource must be held in a non-shareable mode — only one process at a time can use it.",
  },
  {
    id: 4,
    question: "Which deadlock condition describes a process holding at least one resource while waiting for additional resources held by other processes?",
    options: ["Hold and Wait", "Mutual Exclusion", "No Preemption", "Circular Wait"],
    correctAnswer: 0,
    explanation:
      "Hold and Wait means a process holds at least one resource and is waiting to acquire additional resources currently held by other processes.",
  },
  {
    id: 5,
    question: "In a resource-allocation graph, what does an assignment edge (R → P) represent?",
    options: [
      "An instance of a resource has been allocated to the process",
      "A process is requesting an instance of the resource",
      "A resource has been released by the process",
      "A process is waiting for a resource to become available",
    ],
    correctAnswer: 0,
    explanation:
      "An assignment edge goes from a resource to a process (R → P) and means an instance of that resource has been allocated to the process.",
  },
  {
    id: 6,
    question: "If a resource-allocation graph contains a cycle and each resource type has exactly one instance, what does this imply?",
    options: [
      "A deadlock has occurred",
      "No deadlock exists",
      "The system is in a safe state",
      "The cycle can be ignored",
    ],
    correctAnswer: 0,
    explanation:
      "If each resource type has exactly one instance and a cycle exists in the graph, a deadlock has definitely occurred.",
  },
  {
    id: 7,
    question: "Which deadlock prevention strategy imposes a total ordering of resource types and requires processes to request resources in increasing order?",
    options: [
      "Eliminating Circular Wait",
      "Eliminating Mutual Exclusion",
      "Eliminating Hold and Wait",
      "Allowing Preemption",
    ],
    correctAnswer: 0,
    explanation:
      "Eliminating Circular Wait requires imposing a total ordering on resource types so processes can only request resources in increasing order of enumeration, breaking any circular chain.",
  },
  {
    id: 8,
    question: "In the Banker's Algorithm, what does the Need matrix represent?",
    options: [
      "The remaining resource need of each process",
      "The total resources available in the system",
      "The maximum demand declared by each process",
      "The resources currently allocated to each process",
    ],
    correctAnswer: 0,
    explanation:
      "Need[i][j] = Max[i][j] − Allocation[i][j], representing the remaining resource need of each process to complete its execution.",
  },
  {
    id: 9,
    question: "What is a safe state in the context of deadlock avoidance?",
    options: [
      "A state where the system can allocate resources to each process in some order and still avoid deadlock",
      "A state where all processes have released their resources",
      "A state where the CPU is idle",
      "A state where no processes are running",
    ],
    correctAnswer: 0,
    explanation:
      "A safe state means the system can find a safe sequence — an ordering of processes such that each process's remaining resource needs can be satisfied without causing a deadlock.",
  },
  {
    id: 10,
    question: "When recovering from deadlock using resource preemption, what problem must be guarded against to prevent the same process from always being chosen as a victim?",
    options: ["Starvation", "Thrashing", "Fragmentation", "Swapping"],
    correctAnswer: 0,
    explanation:
      "Starvation is a concern during resource preemption recovery. It is addressed by including the number of rollbacks in the cost factor when selecting a victim.",
  },
];