import type { ReactNode } from "react";

/** Content width from the design guide: 1240px, 24px gutters, 16px under 640px. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[min(1240px,100%-32px)] sm:w-[min(1240px,100%-48px)] ${className}`}>{children}</div>;
}