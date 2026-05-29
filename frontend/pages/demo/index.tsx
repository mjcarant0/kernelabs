"use client";

import CpuScheduling from "./CpuScheduling";
import MemoryManagement from "./MemoryManagement";
import VirtualMemory from "./VirtualMemory";
import Deadlock from "./Deadlock";
import Link from "next/link";

// Demo router: map slug to page
const pages: Record<string, React.ComponentType> = {
  "cpu-scheduling": CpuScheduling,
  "memory-management": MemoryManagement,
  "virtual-memory": VirtualMemory,
  "deadlock": Deadlock,
};

interface Props {
  slug: string;
}

export default function DemoIndex({ slug }: Props) {
  const Page = pages[slug];

  // show not found if page missing
  if (!Page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Demo not found.</p>
          <Link href="/#demo" className="text-cyan-600 dark:text-cyan-400 underline">
            ← Back to Demos
          </Link>
        </div>
      </div>
    );
  }

  // render page
  return <Page />;
}
