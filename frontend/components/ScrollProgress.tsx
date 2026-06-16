"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[9998] h-[3px] w-full origin-left bg-gradient-to-r from-rosegold via-blush to-rosegold"
    />
  );
}
