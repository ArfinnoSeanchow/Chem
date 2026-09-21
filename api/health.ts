import { json, methodGuard, requestId, setCors } from "./_lib/http";

export default function handler(req: any, res: any) {
  setCors(req, res);
  if (!methodGuard(req, res, ["GET"])) return;

  const id = requestId(req);
  return json(res, 200, {
    success: true,
    service: "chemly-api",
    status: "ok",
    version: "1",
    engine: "exact-redox",
    timestamp: new Date().toISOString(),
    requestId: id,
  });
}
