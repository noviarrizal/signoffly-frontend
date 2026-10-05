"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Content arrives in reading order as it scrolls into view (design guide, section 6).
 * Only opacity and transform move. `delay` is in milliseconds.
 *
 * The server and the browser always start from the same hidden state, so there is no hydration
 * mismatch. Reduced motion does not skip the state, it makes the change instant. Without
 * JavaScript the layout adds a <noscript> rule that shows everything (see [data-reveal] there).
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -6% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}