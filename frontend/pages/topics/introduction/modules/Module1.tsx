/* Introduction to Operating Systems */

export interface Module1Section {
  id: string;
  title: string;
  content: string;
}

export const module1Sections: Module1Section[] = [
  {
    id: "1-1-introduction",
    title: "1.1 Introduction",
    content:
      "An operating system is a program that acts as an intermediary or interface between a user of a computer and the computer hardware. It controls and coordinates the use of the hardware among the various application programs for the various users.",
  },
  {
    id: "1-2-computer-system-components",
    title: "1.2 Computer System Components",
    content: `1.2.1 Hardware Components
These provide basic computing resources:
- CPU
- Memory
- I/O Devices

1.2.2 Operating System Components
These provide an environment in which a user may execute programs:
- Windows
- Linux
- UNIX
- MS-DOS
- MacOS

1.2.3 Application Programs
These define ways in which the system resources are used to solve the computing problems of the users:
- Compilers
- Database systems
- Video games
- Business programs

1.2.4 Users of Computer System
These include people, machines, and other computers.`,
  },
  {
    id: "1-3-goals-of-an-operating-system",
    title: "1.3 Goals of an Operating System",
    content: `To provide a convenient environment by executing user programs and making solving user problems easier by hiding messy details that must be performed.

Make the computer system convenient to use by presenting the user with a virtual machine, easier to use.

To use the computer hardware in an efficient manner by ensuring good performance.`,
  },
  {
    id: "1-4-os-perspectives",
    title: "1.4 OS Perspectives",
    content: `The resource allocator manages and allocates resources:
- Each program gets time with the resource
- Each program gets space on the resource

The control program controls the execution of user programs and operations of I/O devices to prevent errors and improper use of the computer.

The Kernel is the one program running at all times with all else being application programs.`,
  },
  {
    id: "1-5-early-computer-systems",
    title: "1.5 Early Computer Systems",
    content:
      "First computers were used to tackle commercial and scientific applications. Physically large machines run from a console. Input devices include card readers and tape drives while output devices include card punch, tape drives, and line printers.",
  },
  {
    id: "1-6-batch-systems",
    title: "1.6 Batch Systems",
    content:
      "This is the first rudimentary operating system. It reduces setup time by batching similar jobs or jobs with common needs. The machine runs only one application at a time and implements automatic job sequencing that automatically transfers control from one job to another.",
  },
  {
    id: "1-7-multiprogramming-systems",
    title: "1.7 Multiprogramming Systems",
    content: `1.7.1 Concept
In multiprogramming operating systems, some commands are executed from one program, then that program is suspended, and then some commands are executed from the next program, and so on.

1.7.2 CPU Utilization and Job Scheduling
While one program (job) is waiting for an I/O operation to complete, the CPU is switched to execute another program rather than remaining idle during I/O time. A program is resumed at the point where it was suspended when it gets its turn to use the CPU again.

1.7.3 Features Required
- Job scheduling: the system must choose among several jobs to be brought into memory
- Memory management: the system must allocate the memory to several jobs
- CPU scheduling: the system must choose among several jobs ready to run
- Allocation of devices`,
  },
  {
    id: "1-8-time-sharing-systems",
    title: "1.8 Time-Sharing Systems",
    content:
      "This system allows many users to share one machine simultaneously. The CPU is multiplexed among several jobs that are kept in memory and on disk since the CPU is allocated to a job only if the job is in memory. A job is swapped in and out of memory to the disk.",
  },
];

export default function Module1() {
  return null;
}
