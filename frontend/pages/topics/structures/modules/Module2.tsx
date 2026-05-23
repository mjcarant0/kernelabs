/* Operating Systems Structures */

export interface Module2Section {
  id: string;
  title: string;
  content: string;
}

export const module2Sections: Module2Section[] = [
  {
    id: "2-1-introduction",
    title: "2.1 Introduction",
    content:
      "Hardware components like CPU, memory, and various device controllers like disk, printer, and tape-drives are connected via a system bus. I/O devices and the CPU execute concurrently, and each device controller is in charge of a particular device type.",
  },
  {
    id: "2-2-interrupts-and-io-handling",
    title: "2.2 Interrupts and I/O Handling",
    content: `2.2.1 Interrupt Service Routines & Traps
Interrupt transfers control to the interrupt service routine — segments of code that determine the action to be taken for each type of interrupt. The interrupt vector contains the addresses of service routines.

A trap is a software-generated interrupt caused either by an error or a user request.

2.2.2 Synchronous vs. Asynchronous I/O
Synchronous I/O:
- Waits — instruction idles the CPU until the next interrupt
- No simultaneous I/O processing; at most one outstanding I/O request at a time

Asynchronous I/O:
- After I/O is initiated, control returns to the user program without waiting for I/O completion
- Uses a System Call
- Device Status Table — holds type, address, and state for each device
- OS indexes into the I/O device table to determine device status and modify the table entry to include the interrupt

2.2.3 Direct Memory Access
Used for high-speed I/O devices able to transmit information at close to memory speeds. The device controller transfers blocks of data from buffer storage directly to main memory without CPU intervention.`,
  },
  {
    id: "2-3-storage-architecture",
    title: "2.3 Storage Architecture",
    content: `Main memory — the only large storage media that the CPU can access directly.

Secondary storage — an extension of main memory that provides large nonvolatile storage capacity.

Magnetic disks — rigid metal or glass platters covered with magnetic recording material.

Caching — the process of copying information into a faster storage system. Main memory can be viewed as a fast cache for secondary storage.`,
  },
  {
    id: "2-4-hardware-protection-mechanisms",
    title: "2.4 Hardware Protection Mechanisms",
    content: `Dual Mode Operation — sharing system resources requires the operating system to ensure that an incorrect program cannot cause other programs to execute incorrectly. Hardware support differentiates between at least two modes:
1. User mode — execution done on behalf of a user
2. Monitor mode (supervisor/kernel/system mode) — execution done on behalf of the operating system

I/O Protection — must ensure that a user program could never gain control of the computer in monitor mode.

Memory Protection — must provide memory protection at least for the interrupt vector and interrupt service routines. Two registers determine the range of legal addresses:
1. Base Register — holds the smallest legal physical memory address
2. Limit Register — contains the size of the range

CPU Protection
Timer — commonly used to implement time sharing; interrupts the computer after a specified period to ensure the OS maintains control.`,
  },
  {
    id: "2-5-os-interfaces",
    title: "2.5 OS Interfaces",
    content: `System Calls — the interface between a running program and the OS.

2.5.1 Services
Services that provide user interfaces to the OS:
- Program Execution — load a program into memory and run it
- I/O Operations — since users cannot execute I/O operations directly
- File System Manipulation — read, write, create, and delete files
- Communications — interprocess and intersystem
- Error Detection — in hardware, I/O devices, and user programs

Services for providing efficient system operation:
- Resource Allocation — for simultaneously executing jobs
- Accounting — for account billing and usage statistics
- Protection — ensure access to system resources is controlled

2.5.2 Programs
Convenient environment for program development and execution:
- Command Interpreter (sh, csh, ksh) — parses and executes other system programs
- File Manipulation — copy (cp), print (lpr), compare (cmp, diff)
- File Modification — editing (ed, vi, emacs)
- Application Programs — send mail (mail), read news (rn)
- Programming Language Support (cc)
- Status Information, Communication`,
  },
  {
    id: "2-6-os-generation-and-structures",
    title: "2.6 OS Generation and Structures",
    content: `Bootstrap program — a loader program that loads the kernel; the kernel then loads the rest of the OS.

How are operating systems organized?
- Simple — only one or two levels of code
- Layered — lower levels are independent of upper levels
- Microkernel — OS built from many user-level processes
- Modular — core kernel with dynamically loadable modules`,
  },
  {
    id: "2-7-core-os-tasks",
    title: "2.7 Core OS Tasks",
    content: `Process Management
The OS is responsible for the following process management activities:
1. Creation and deletion
2. Suspension and resumption

Memory Management
- Allocate and deallocate memory to processes
- Managing multiple processes within memory

Secondary Storage and I/O Management
- OS performs storage allocation, free-space management, and disk scheduling
- Device driver interface that abstracts I/O device details

File System Management
- File creation and deletion
- Directory creation and deletion

Protection and Security
- Distinguish between authorized and unauthorized use
- Specify access controls to be imposed on use`,
  },
];

export default function Module2() {
  return null;
}
