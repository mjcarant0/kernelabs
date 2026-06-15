"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const x = useSpring(mouseX, { damping: 22, stiffness: 250 });
  const y = useSpring(mouseY, { damping: 22, stiffness: 250 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouch =
      matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    if (isTouch) {
      setEnabled(false);
      return;
    }

    document.body.style.cursor = "none";

    const interactiveSelector =
      "a, button, [role=button], input, textarea, select, label, .glass-card, .group, .cta, .feature-card, .topic-card, .tutorial-card";

    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onDown = () => setActive(true);
    const onUp = () => setActive(false);

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest ? target.closest(interactiveSelector) : null;
      setHovering(!!el);
    };

    const onOut = () => setHovering(false);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      document.body.style.cursor = "";
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
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x, y }}
        aria-hidden
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 28,
            height: 28,
            marginLeft: -14,
            marginTop: -14,
            border: "1px solid rgba(6,182,212,0.18)",
            background: "rgba(6,182,212,0.02)",
            boxShadow:
              "0 0 20px rgba(6,182,212,0.06), 0 0 40px rgba(3,116,206,0.04)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
          animate={{
            scale: hovering ? 1.22 : active ? 0.92 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x, y }}
        aria-hidden
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            background:
              "linear-gradient(180deg, rgba(6,182,212,0.95), rgba(3,116,206,0.9))",
            boxShadow:
              "0 0 10px rgba(6,182,212,0.12), 0 0 28px rgba(6,182,212,0.06)",
          }}
          animate={{
            scale: hovering ? 1.18 : active ? 0.92 : 1,
          }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </motion.div>
    </>
  );
}
