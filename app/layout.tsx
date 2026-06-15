import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PageTransition from "../frontend/ui/loading/PageTransition";

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
      
      <body
        className="min-h-full flex flex-col transition-colors duration-300"
        suppressHydrationWarning
      >
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
