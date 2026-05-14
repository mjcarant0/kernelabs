import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kernelabs - Interactive OS Learning Platform",
  description:
    "An interactive Operating System learning platform with CPU scheduling, memory management, virtual memory, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning on body silences false positives from
          browser extensions (e.g. Grammarly) that inject data-* attributes
          onto the body tag before React hydrates. */}
      <body
        className="min-h-full flex flex-col transition-colors duration-300"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}