import { goApiUrl } from "@/lib/env";
import { errorBody } from "@/lib/api/errors";

/** Public: what can be bought. No sign-in needed. */
export async function GET() {
  try {
    const res = await fetch(`${goApiUrl()}/v1/pricing`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {
    return Response.json(errorBody("api_unreachable", "We could not reach the scanning service. Try again in a moment."), { status: 502 });
  }
}