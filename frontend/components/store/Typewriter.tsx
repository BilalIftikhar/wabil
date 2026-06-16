"use client";

import { useEffect, useState } from "react";

// Cycling typewriter for the hero headline.
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    const done = sub === word;
    const empty = sub === "";

    const timeout = setTimeout(
      () => {
        if (!deleting && done) {
          setTimeout(() => setDeleting(true), 1400);
        } else if (deleting && empty) {
          setDeleting(false);
          setIndex((i) => i + 1);
        } else {
          setSub((s) => (deleting ? s.slice(0, -1) : word.slice(0, s.length + 1)));
        }
      },
      deleting ? 55 : 100,
    );

    return () => clearTimeout(timeout);
  }, [sub, deleting, index, words]);

  return (
    <span className={className}>
      {sub}
      <span className="ml-0.5 animate-pulse text-rosegold">|</span>
    </span>
  );
}
