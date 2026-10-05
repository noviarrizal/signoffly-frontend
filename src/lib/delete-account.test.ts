import { describe, expect, it } from "vitest";
import { confirmationMatches, DELETE_PHRASE } from "@/lib/delete-account";

describe("confirmationMatches", () => {
  it("accepts the phrase, ignoring case and surrounding spaces", () => {
    for (const ok of [DELETE_PHRASE, "Delete My Account", "  delete my account  "]) expect(confirmationMatches(ok)).toBe(true);
  });
  it("accepts nothing else", () => {
    for (const bad of ["", "delete", "delete my accounts", "yes", "delete  my account", null, undefined, 1, true, ["delete my account"]]) expect(confirmationMatches(bad)).toBe(false);
  });
  it("is the same phrase the API checks", () => {
    expect(DELETE_PHRASE).toBe("delete my account"); // backend: httpapi.DeleteConfirmation
  });
});