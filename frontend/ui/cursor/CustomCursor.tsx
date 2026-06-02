"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(true);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 22, stiffness: 250 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // disable on touch devices
    const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    if (isTouch) {
      setEnabled(false);
      return;
    }

    const interactiveSelector = `a, button, [role=button], input, textarea, select, label, .glass-card, .group, .cta, .hover\\:shadow-lg, .feature-card, .topic-card, .tutorial-card`;

    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };

    const onDown = () => {
      setActive(true);
    };
    const onUp = () => {
      setActive(false);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      // show native cursor for form elements
      if (target.matches("input, textarea, select, [contenteditable], svg, path")) {
        setVisible(false);
        return;
      }

      if (target.closest && (target as Element).closest(interactiveSelector)) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    const onOut = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      setHovering(false);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              className="custom-cursor ring pointer-events-none fixed top-0 left-0 z-[9999]"
              style={{ x, y }}
              animate={{ scale: hovering ? 1.22 : active ? 0.92 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              aria-hidden
            />

            <motion.div
              className="custom-cursor dot pointer-events-none fixed top-0 left-0 z-[9999]"
              style={{ x, y }}
              animate={{ scale: hovering ? 1.18 : active ? 0.92 : 1 }}
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              aria-hidden
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
