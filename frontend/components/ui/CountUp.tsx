"use client";

import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Count-up number animation for KPI cards.
export function CountUp({
  value,
  duration = 1.2,
  format,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);

  useEffect(() => {
    const controls = animate(ref.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    ref.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <>{format ? format(display) : Math.round(display).toLocaleString()}</>;
}
