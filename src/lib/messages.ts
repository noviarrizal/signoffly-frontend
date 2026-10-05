import en from "@/messages/en.json";

export type MessageKey = keyof typeof en;

/**
 * Looks up UI copy. All strings live in src/messages so a translation is a data change.
 * "{name}" placeholders are filled from `vars`.
 */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let s: string = en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}