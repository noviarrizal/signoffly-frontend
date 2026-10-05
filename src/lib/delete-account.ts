/** What the person must type, and what the API checks again. */
export const DELETE_PHRASE = "delete my account";

export function confirmationMatches(input: unknown): boolean {
  return typeof input === "string" && input.trim().toLowerCase() === DELETE_PHRASE;
}