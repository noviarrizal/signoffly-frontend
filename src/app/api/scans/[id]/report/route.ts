import { forwardToApi } from "@/lib/api/proxy";
import { errorBody } from "@/lib/api/errors";
import { isUuid } from "@/lib/validation";

export async function GET(req: Request, ctx: RouteContext<"/api/scans/[id]/report">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return Response.json(errorBody("scan_not_found", "We could not find that scan."), { status: 404 });
  return forwardToApi(req, `/v1/scans/${id}/report`);
}