import { forwardToApi } from "@/lib/api/proxy";

export const GET = (req: Request) => forwardToApi(req, "/v1/orders");
export const POST = (req: Request) => forwardToApi(req, "/v1/orders");