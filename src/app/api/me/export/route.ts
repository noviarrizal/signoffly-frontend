import { forwardToApi } from "@/lib/api/proxy";

/** Everything stored about the signed-in person, as a JSON file. */
export const GET = (req: Request) => forwardToApi(req, "/v1/me/export");