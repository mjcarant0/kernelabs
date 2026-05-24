/* Deadlocks - Module 8 */

export interface Module8Section {
  id: string;
  title: string;
  content: string;
}

export const module8Sections: Module8Section[] = [
  {
    id: "8-1-introduction",
    title: "8.1 Introduction",
    content:
      "A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting to acquire a resource held by another process. In a deadlock, no process can proceed, release its resources, or be awakened. Deadlocks are a critical concern in operating systems that manage shared resources among multiple concurrent processes.",
  },
  {
    id: "8-2-system-model",
    title: "8.2 System Model",
    content: `A system consists of a finite number of resources distributed among competing processes. Resources are categorized into types, and each type may have several identical instances.

8.2.1 Resource Types
Examples of resource types include:
- CPU cycles
- Memory space
- I/O devices (printers, tape drives)
- Files and semaphores

8.2.2 Resource Usage Protocol
A process must follow this sequence when using a resource:
- Request: The process requests the resource. If it cannot be granted immediately, the process must wait.
- Use: The process operates on the resource.
- Release: The process releases the resource after use.`,
  },
  {
    id: "8-3-deadlock-characterization",
    title: "8.3 Deadlock Characterization",
    content: `A deadlock can arise if and only if all four of the following conditions hold simultaneously:

8.3.1 Mutual Exclusion
At least one resource must be held in a non-shareable mode. Only one process at a time can use the resource. If another process requests that resource, the requesting process must be delayed until the resource has been released.

8.3.2 Hold and Wait
A process must be holding at least one resource and waiting to acquire additional resources that are currently being held by other processes.

8.3.3 No Preemption
Resources cannot be preempted. A resource can be released only voluntarily by the process holding it, after that process has completed its task.

8.3.4 Circular Wait
A set of waiting processes must exist such that each process is waiting for a resource held by the next process in the set, forming a circular chain.`,
  },
  {
    id: "8-4-resource-allocation-graph",
    title: "8.4 Resource-Allocation Graph",
    content: `Deadlocks can be described more precisely in terms of a directed graph called a resource-allocation graph.

8.4.1 Components
The graph consists of two types of nodes:
- Process nodes: represented by circles, one per process in the system
- Resource nodes: represented by rectangles, one per resource type; dots inside represent instances

8.4.2 Edge Types
- Request edge: a directed edge from a process to a resource (P → R), meaning the process is requesting an instance of that resource
- Assignment edge: a directed edge from a resource to a process (R → P), meaning an instance of that resource has been allocated to the process

8.4.3 Cycle Detection
If the graph contains no cycle, then no deadlock exists. If there is a cycle:
- If each resource type has exactly one instance, a cycle implies a deadlock.
- If each resource type has several instances, a cycle does not necessarily mean a deadlock has occurred.`,
  },
  {
    id: "8-5-deadlock-prevention",
    title: "8.5 Deadlock Prevention",
    content: `Deadlock prevention works by ensuring that at least one of the four necessary conditions for deadlock cannot hold.

8.5.1 Eliminating Mutual Exclusion
Mutual exclusion cannot be denied for non-shareable resources such as a printer. Shareable resources like read-only files do not require mutual exclusion and thus cannot be involved in deadlock.

8.5.2 Eliminating Hold and Wait
To ensure hold-and-wait never occurs, a process must request and be allocated all its resources before it begins execution. Alternatively, a process may request resources only when it has none.

8.5.3 Allowing Preemption
If a process that is holding some resources requests another resource that cannot be immediately allocated, all resources currently being held are preempted and added to the list of resources for which the process is waiting.

8.5.4 Eliminating Circular Wait
Impose a total ordering of all resource types and require that each process requests resources in increasing order of enumeration. A process holding resource Ri can only request resources Rj where j > i.`,
  },
  {
    id: "8-6-deadlock-avoidance",
    title: "8.6 Deadlock Avoidance",
    content: `Deadlock avoidance requires that the operating system be given additional information in advance concerning which resources a process will request during its lifetime.

8.6.1 Safe State
A state is safe if the system can allocate resources to each process in some order and still avoid a deadlock. A safe sequence is an ordering of processes such that for each process, the resources it can still request can be satisfied by the currently available resources plus the resources held by all previous processes in the sequence.

8.6.2 Banker's Algorithm
The Banker's Algorithm is used for multiple instances of each resource type. Each process must declare the maximum number of instances of each resource it may need. When a process requests a set of resources, the system must determine whether the allocation leaves the system in a safe state. If it does, the resources are allocated; otherwise, the process must wait.

8.6.3 Data Structures for Banker's Algorithm
- Available: a vector of length m indicating the number of available resources of each type
- Max: an n × m matrix defining the maximum demand of each process
- Allocation: an n × m matrix defining the resources of each type currently allocated to each process
- Need: an n × m matrix indicating the remaining resource need of each process; Need[i][j] = Max[i][j] − Allocation[i][j]`,
  },
  {
    id: "8-7-deadlock-detection",
    title: "8.7 Deadlock Detection",
    content: `If a system does not employ prevention or avoidance, a deadlock situation may occur. The system must provide an algorithm to detect deadlocks and a mechanism to recover from them.

8.7.1 Single Instance Per Resource Type
For systems where each resource type has a single instance, a variant of the resource-allocation graph called a wait-for graph can be used. A cycle in the wait-for graph indicates a deadlock.

8.7.2 Multiple Instances Per Resource Type
An algorithm similar to the Banker's Algorithm is used. Data structures maintained include:
- Available: a vector of length m
- Allocation: an n × m matrix
- Request: an n × m matrix representing the current request of each process

8.7.3 Detection Algorithm Timing
Detection algorithms can be invoked at different frequencies:
- At every resource request, which adds overhead but detects deadlocks early
- At a fixed time interval
- When CPU utilization drops below a threshold, suggesting a possible deadlock`,
  },
  {
    id: "8-8-deadlock-recovery",
    title: "8.8 Deadlock Recovery",
    content: `When a deadlock is detected, the system must recover. There are two main options for breaking a deadlock.

8.8.1 Process Termination
- Abort all deadlocked processes: this breaks the deadlock cycle but comes at a high cost since all progress made by these processes must be discarded.
- Abort one process at a time until the deadlock cycle is eliminated: this incurs overhead from running the detection algorithm after each termination.

Factors to consider when choosing which process to terminate:
- Priority of the process
- How long the process has computed and how much longer it will need
- Resources the process has used and still needs
- Number of processes that will need to be terminated

8.8.2 Resource Preemption
Resources are successively preempted from processes and given to other processes until the deadlock cycle is broken. Three issues must be addressed:
- Selecting a victim: which resources and processes to preempt, typically minimizing cost
- Rollback: rolling back the process from which resources were preempted to a safe state
- Starvation: ensuring that the same process is not always chosen as a victim, often solved by including the number of rollbacks in the cost factor`,
  },
];

export default function Module8() {
  return null;
}