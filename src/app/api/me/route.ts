import { forwardToApi } from "@/lib/api/proxy";

export const GET = (req: Request) => forwardToApi(req, "/v1/me");