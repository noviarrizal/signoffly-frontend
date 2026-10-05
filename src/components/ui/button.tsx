import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "ghost";
type Size = "md" | "sm";

export function buttonClass({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl font-medium transition-[background-color,color,transform] duration-200 active:translate-y-px active:scale-[.98] disabled:pointer-events-none disabled:opacity-60";
  const sizes = size === "sm" ? "px-[.9rem] py-[.55rem] text-[.88rem]" : "px-5 py-3 text-[.95rem]";
  const variants =
    variant === "primary"
      ? "bg-ink text-bg hover:bg-accent hover:text-accent-ink"
      : "border border-line bg-transparent text-ink hover:bg-surface-2";
  return `${base} ${sizes} ${variants}`;
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className = "", ...rest }: Props) {
  return <button className={`${buttonClass({ variant, size })} ${className}`} {...rest} />;
}

export function ButtonLink({ variant, size, className = "", ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={`${buttonClass({ variant, size })} ${className}`} {...rest} />;
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-[spin_2.4s_linear_infinite] ${className}`}
    />
  );
}