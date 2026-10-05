"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { userSend } from "@/lib/api/user";
import { confirmationMatches, DELETE_PHRASE } from "@/lib/delete-account";

/**
 * Deletes the signed-in person's account and everything tied to it, then signs them out.
 * The phrase is checked here and again by the API, so a stray request cannot delete anything.
 */
export async function deleteAccount(form: FormData): Promise<void> {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/signin");

  if (!confirmationMatches(form.get("confirm"))) redirect("/account/delete?error=confirm");

  try {
    await userSend(userId, "/v1/me", { method: "DELETE", body: { confirm: DELETE_PHRASE } });
  } catch {
    redirect("/account/delete?error=failed");
  }
  await signOut({ redirectTo: "/?deleted=1" });
}