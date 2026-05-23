/* CPU Scheduling */

export interface Module4Section {
  id: string;
  title: string;
  content: string;
}

export const module4Sections: Module4Section[] = [
  {
    id: "4-1-introduction",
    title: "4.1 Introduction",
    content: `CPU Scheduling is the basis of multiprogrammed operating systems. It deals with the problem of deciding which of the processes in the ready queue is to be allocated the CPU in order to maximize utilization.

There are 2 scheduling schemes:

- Nonpreemptive — once a process is in the running state, it will continue until it terminates or blocks itself for I/O.
- Preemptive — the currently running process may be interrupted and moved back to the ready state by the operating system.`,
  },
  {
    id: "4-2-scheduling-criteria",
    title: "4.2 Scheduling Criteria",
    content: `1. CPU Utilization — the percentage or fraction of time the CPU is doing useful work.
Formula: (Total Burst Time / End Time) × 100

2. Throughput — the number of processes completed per time unit.

3. Turnaround Time — the time interval from the submission of a process to its completion.
Formula: Finish Time − Arrival Time

4. Waiting Time — the time spent by a process waiting in the ready queue.
Formula: Turnaround Time − Burst Time

5. Response Time — the amount of time it takes to start the response to a request.`,
  },
  {
    id: "4-3-scheduling-algorithms",
    title: "4.3 Scheduling Algorithms",
    content: `First-Come, First-Served (FCFS)
The process that requested the CPU first is allocated the CPU first, managed using a FIFO queue. Favors CPU-bound processes but suffers from the convoy effect, where short processes are forced to wait behind a long process.

Shortest-Job-First (SJF)
Makes use of the length of the next CPU burst to decide which process runs next. Gives the minimum average waiting time, but longer processes may suffer from starvation.

Priority Scheduling
A priority number is associated with each process; the CPU is allocated to the process with the highest priority. The smallest integer equals the highest priority. A key problem is that low-priority processes may never execute.

Round Robin (RR)
Designed especially for time-sharing systems. No process is allocated the CPU for more than one time quantum, ensuring every process gets a fair, regular turn.`,
  },
];

export default function Module4() {
  return null;
}
