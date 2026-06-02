/* Quiz questions for Module 7: Mass Storage Management */

import { QuizQuestion } from "../../shared/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What became the standard for bulk secondary storage in modern computer systems?",
    options: ["Magnetic tape", "Optical discs", "Magnetic disks", "Flash memory"],
    correctAnswer: 2,
    explanation: "Although early systems used magnetic tape, magnetic disks replaced them as the standard for bulk secondary storage due to significantly faster access times.",
  },
  {
    id: 2,
    question: "What is a cylinder in a magnetic disk system?",
    options: [
      "A single sector on the outermost track",
      "All tracks accessible from one head position without movement",
      "The physical casing that protects the disk platters",
      "The rotating shaft that the platters are mounted on",
    ],
    correctAnswer: 1,
    explanation: "A cylinder consists of all tracks that share the same position across every platter surface, accessible without moving the read/write heads.",
  },
  {
    id: 3,
    question: "Which component of disk access time refers to the time for the desired sector to rotate under the read/write head?",
    options: ["Seek time", "Transfer time", "Latency time", "Rotation time"],
    correctAnswer: 2,
    explanation: "Latency time (also called rotational latency) is the delay waiting for the disk to spin the target sector into position beneath the read/write head.",
  },
  {
    id: 4,
    question: "Which data recording method keeps bit density uniform per track and increases rotation speed as the head moves inward?",
    options: ["Constant Angular Velocity (CAV)", "Constant Linear Velocity (CLV)", "Variable Sector Density (VSD)", "Fixed Track Encoding (FTE)"],
    correctAnswer: 1,
    explanation: "CLV maintains uniform bit density by spinning faster for inner (shorter) tracks, and is used in CD-ROM and DVD-ROM drives.",
  },
  {
    id: 5,
    question: "What is the main problem with FCFS disk scheduling under heavy load?",
    options: [
      "It can cause starvation for requests near the center of the disk",
      "It is too complex to implement efficiently",
      "The head swings wildly across the disk, making it inefficient",
      "It always services the outermost tracks first",
    ],
    correctAnswer: 2,
    explanation: "FCFS services requests in arrival order with no regard for head position, causing the head to jump back and forth across the disk and wasting seek time.",
  },
  {
    id: 6,
    question: "What is a key disadvantage of SSTF disk scheduling?",
    options: [
      "It always services requests in the wrong order",
      "It requires knowledge of future requests",
      "Requests far from the current head position may starve",
      "It cannot handle more than one request at a time",
    ],
    correctAnswer: 2,
    explanation: "SSTF always picks the closest request, so requests located far from the head may be indefinitely delayed if a steady stream of nearby requests keeps arriving.",
  },
  {
    id: 7,
    question: "Which disk scheduling algorithm is also known as the elevator algorithm?",
    options: ["FCFS", "SSTF", "C-SCAN", "SCAN"],
    correctAnswer: 3,
    explanation: "SCAN moves the head from one end of the disk to the other and back, servicing requests in both directions — just like an elevator moving between floors.",
  },
  {
    id: 8,
    question: "How does C-SCAN differ from SCAN?",
    options: [
      "C-SCAN services requests in both directions like SCAN but skips empty tracks",
      "C-SCAN moves to the far end then immediately returns to the beginning without servicing on the return trip",
      "C-SCAN only services requests on the outer half of the disk",
      "C-SCAN reverses direction at the last pending request instead of the disk edge",
    ],
    correctAnswer: 1,
    explanation: "C-SCAN treats the disk as circular — after reaching the far end it jumps back to the start without servicing, providing more uniform wait times than SCAN.",
  },
  {
    id: 9,
    question: "How does LOOK improve on SCAN?",
    options: [
      "LOOK services requests in both directions simultaneously",
      "LOOK skips tracks with no pending requests entirely",
      "The head only travels as far as the last request in the current direction, then reverses",
      "LOOK uses a circular approach like C-SCAN but with variable speed",
    ],
    correctAnswer: 2,
    explanation: "LOOK avoids unnecessary travel to the physical ends of the disk by reversing direction at the last pending request rather than always going to the disk edge.",
  },
  {
    id: 10,
    question: "When is FCFS the preferred disk scheduling algorithm?",
    options: [
      "When the disk is under very heavy load with many queued requests",
      "When the queue rarely has more than one outstanding request",
      "When minimizing seek time is the top priority",
      "When uniform wait times across all positions are required",
    ],
    correctAnswer: 1,
    explanation: "When only one request is outstanding at a time, all algorithms behave the same, so FCFS is chosen for its simplicity since there is no scheduling benefit to gain.",
  },
];