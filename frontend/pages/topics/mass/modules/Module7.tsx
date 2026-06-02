/* Mass Storage Management */

export interface Module7Section {
  id: string;
  title: string;
  content: string;
}

export const module7Sections: Module7Section[] = [
  {
    id: "7-1-introduction",
    title: "7.1 Introduction",
    content:
      "Secondary storage must store very large amounts of data permanently. Early secondary storage used magnetic tape, but it was too slow compared to main memory access times. Magnetic disks became the standard for bulk secondary storage in modern computer systems.",
  },
  {
    id: "7-2-disk-structure",
    title: "7.2 Disk Structure",
    content: `7.2.1 Physical Components
A magnetic disk system consists of several disk platters — flat, circular disks coated with magnetic material on both surfaces. Information is recorded on these surfaces. The platters are stacked and mounted on a rotating shaft, with read/write heads positioned just above each surface.

7.2.2 Tracks, Sectors, and Cylinders
The disk surface is logically divided into tracks, which are further subdivided into sectors. The system stores data by recording it magnetically on the sector currently under the read/write head. When in use, a drive motor spins the disk at high speed (e.g., 60 revolutions per second).
In a movable-head system, there is only one read/write head per surface. All tracks accessible from one head position without movement form a cylinder.

7.2.3 Disk Access Time
Accessing a sector depends on three parameters:
- Seek time — time to move the read/write head to the correct track.
- Latency time — time for the desired sector to rotate under the head.
- Transfer time — time to transfer data between disk and main memory.

7.2.4 Data Recording Methods
- Constant Linear Velocity (CLV) — bit density per track is uniform. Outer tracks hold more sectors; the drive increases rotation speed as the head moves inward. Used in CD-ROM and DVD-ROM drives.
- Constant Angular Velocity (CAV) — the number of bits per track is uniform; bit density increases toward inner tracks. Disk rotation speed stays constant. Used in hard disks and floppy disks.`,
  },
  {
    id: "7-3-disk-scheduling",
    title: "7.3 Disk Scheduling",
    content: `Since most jobs heavily depend on disk access, fast disk service is critical. The OS improves average disk service time by scheduling disk access requests. When a drive and controller are free, a request is serviced immediately; additional requests are queued and handled by a scheduling algorithm.

FCFS — requests are serviced in arrival order regardless of head position. Simple but inefficient under heavy load due to wild head swinging.

SSTF (Shortest Seek Time First) — selects the request closest to the current head position, minimizing individual seek distances. Substantially better than FCFS but not optimal, and can cause starvation for requests far from the head.

SCAN (Elevator Algorithm) — the head moves from one end of the disk to the other, servicing requests along the way, then reverses direction and repeats.

C-SCAN (Circular SCAN) — like SCAN, but upon reaching the far end the head immediately returns to the beginning without servicing requests on the return trip. Provides more uniform wait times across all disk positions.

LOOK — an improvement on SCAN where the head only travels as far as the last request in the current direction, then reverses, avoiding unnecessary travel to disk edges.

C-LOOK — the C-SCAN equivalent of LOOK. After the last request in one direction, the head jumps directly to the lowest-numbered pending request and resumes without servicing on the return.`,
  },
  {
    id: "7-4-selecting-a-disk-scheduling-algorithm",
    title: "7.4 Selecting a Disk Scheduling Algorithm",
    content: `SCAN and C-SCAN are best suited for systems under heavy disk load, as they provide more uniform service across all requests.

When the queue rarely has more than one outstanding request, all algorithms perform essentially the same. In such cases, FCFS is preferred for its simplicity.`,
  },
];

export default function Module7() {
  return null;
}
