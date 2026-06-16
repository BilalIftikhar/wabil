"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Custom dot + ring cursor; ring scales up over interactive elements.
export function AnimatedCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 28 });
  const ringY = useSpring(y, { stiffness: 300, damping: 28 });
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setEnabled(true);
      document.body.classList.add("custom-cursor-active");
    }
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setHovering(!!el.closest("a, button, [role=button], input, select"));
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        style={{ translateX: x, translateY: y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-1 -mt-1 h-2 w-2 rounded-full bg-rosegold"
      />
      <motion.div
        style={{ translateX: ringX, translateY: ringY }}
        animate={{ scale: hovering ? 1.8 : 1, opacity: hovering ? 0.9 : 0.5 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-4 -mt-4 h-8 w-8 rounded-full border border-rosegold"
      />
    </>
  );
}
