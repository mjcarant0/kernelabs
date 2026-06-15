"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Initial mount — always show loading
      const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
      const hideTimer = setTimeout(() => setShowLoader(false), 1900);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }

    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    setShowLoader(true);
    setFadeOut(false);

    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const hideTimer = setTimeout(() => setShowLoader(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (showLoader) {
    return <LoadingScreen fadeOut={fadeOut} />;
  }

  return <>{children}</>;
}
