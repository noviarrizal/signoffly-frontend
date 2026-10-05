import "server-only";
import { internalFetch } from "@/lib/api/server";

export interface UpsertInput {
  provider: string;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
}

/** Finds or creates the user in the Go API and returns its id. */
export async function syncUser(input: UpsertInput): Promise<string> {
  const res = await internalFetch<{ user_id: string }>("/internal/users/upsert", {
    method: "POST",
    body: {
      provider: input.provider,
      provider_account_id: input.providerAccountId,
      email: input.email,
      email_verified: input.emailVerified,
      name: input.name ?? "",
    },
  });
  return res.user_id;
}