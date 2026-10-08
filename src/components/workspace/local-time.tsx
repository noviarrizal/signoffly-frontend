"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const FORMATS = {
  date: { month: "short", day: "numeric" },
  time: { hour: "numeric", minute: "2-digit" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/** A time in the visitor's own time zone. The server cannot know it, so the server render is empty and the browser fills it in. */
export function LocalTime({ iso, format }: { iso: string; format: keyof typeof FORMATS }) {
  const text = useSyncExternalStore(
    subscribe,
    () => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, FORMATS[format]);
    },
    () => "",
  );
  return <time dateTime={iso}>{text}</time>;
}
