/* Processes */

export interface Module3Section {
  id: string;
  title: string;
  content: string;
}

export const module3Sections: Module3Section[] = [
  {
    id: "3-1-introduction",
    title: "3.1 Introduction",
    content:
      "A process is a program in execution; process execution must progress in sequential fashion. Although two processes may be associated with the same program, they are considered two separate execution sequences. A Process Control Block (PCB) is the representation of a process in the operating system.",
  },
  {
    id: "3-2-process-states",
    title: "3.2 Process States",
    content: `As a process executes, it changes state:

- New — the process is being created.
- Ready — the process is waiting to be assigned to a processor.
- Running — instructions are being executed.
- Waiting — the process is waiting for some event to occur.
- Terminated — the process has finished execution.`,
  },
  {
    id: "3-3-process-scheduling",
    title: "3.3 Process Scheduling",
    content: `Queues:
- Job queue — set of all processes in the system.
- Ready queue — set of all processes residing in main memory, ready and waiting to execute.
- Device queues — set of processes waiting for an I/O device.

Types of Schedulers:
- Long-term scheduler (Job scheduler) — selects which processes should be brought into the ready queue.
- Short-term scheduler (CPU scheduler) — selects which process should be executed next and allocates the CPU.
- Medium-term scheduler — removes processes from memory and reintroduces them later (swapping).

Scheduler Activities:
- Swapping — at some other time, a process can be reintroduced and continued where it left off.
- Context Switch — switching the CPU from one process to another.
- Dispatcher — a module that gives control of the CPU to the process selected by the short-term scheduler.`,
  },
  {
    id: "3-4-operations-and-definitions",
    title: "3.4 Operations & Definition of Terms",
    content: `Process Creation
Parent processes create children processes, which in turn create other processes, forming a tree of processes.

Process Termination
- Exit — the process executes its last statement and asks the operating system to delete it.
- Abort — a parent may terminate the execution of its children processes.

Key Terms:
- Address space — a list of memory locations that contains the executable program, the program's data, and its stack.
- System call — a function called by an application to invoke a kernel service.
- Interrupt — a hardware mechanism that enables a device to notify the CPU.`,
  },
];

export default function Module3() {
  return null;
}
