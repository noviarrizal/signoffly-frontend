import { forwardToApi } from "@/lib/api/proxy";

export const POST = (req: Request) => forwardToApi(req, "/v1/scans");

/** History. Only the two parameters the API understands are forwarded. */
export const GET = (req: Request) => {
  const src = new URL(req.url).searchParams;
  const out = new URLSearchParams();
  for (const k of ["limit", "before"]) {
    const v = src.get(k);
    if (v) out.set(k, v);
  }
  const qs = out.toString();
  return forwardToApi(req, "/v1/scans" + (qs ? `?${qs}` : ""));
};