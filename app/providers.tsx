"use client";

import { ThemeProvider } from "next-themes";
import React from "react";
import CustomCursor from "../frontend/ui/cursor/CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange={false}
      forcedTheme={undefined}
    >
      <>
        <CustomCursor />
        {children}
      </>
    </ThemeProvider>
  );
}