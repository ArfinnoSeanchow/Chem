const MAX_EQUATION_LENGTH = 1000;
const MAX_BODY_BYTES = 32_000;
const DEFAULT_ORIGIN = "*";

export function json(res: any, status: number, payload: unknown, extraHeaders: Record<string,string> = {}) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status >= 400 ? "no-store" : "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value);
  return res.json(payload);
}

export function setCors(req: any, res: any) {
  const configured = (globalThis as any).process?.env?.CHEMLY_API_ORIGIN?.trim();
  const requestOrigin = req?.headers?.origin;
  const origin = configured || (requestOrigin ? requestOrigin : DEFAULT_ORIGIN);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Chemly-Client, X-Request-ID");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function requestId(req: any) {
  const supplied = String(req?.headers?.["x-request-id"] || "").trim();
  if (/^[A-Za-z0-9._:-]{8,80}$/.test(supplied)) return supplied;
  return globalThis.crypto?.randomUUID?.() ?? `chemly-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function normalizedEquation(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateEquation(value: unknown) {
  const equation = normalizedEquation(value);
  if (!equation) throw new ApiError(400, "EQUATION_REQUIRED", "Equation is required.");
  if (equation.length > MAX_EQUATION_LENGTH) {
    throw new ApiError(413, "EQUATION_TOO_LONG", `Equation exceeds ${MAX_EQUATION_LENGTH} characters.`);
  }
  if (!/->|→|⟶|=>|=/.test(equation)) {
    throw new ApiError(400, "INVALID_EQUATION", "Use an equation arrow such as ->.");
  }
  return equation;
}

export function validateMedium(value: unknown) {
  const medium = String(value ?? "acidic").trim().toLowerCase();
  if (!["acidic", "basic", "neutral"].includes(medium)) {
    throw new ApiError(400, "INVALID_MEDIUM", "medium must be acidic, basic, or neutral.");
  }
  return medium as "acidic" | "basic" | "neutral";
}

export function bodySizeGuard(req: any) {
  const length = Number(req?.headers?.["content-length"] || 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    throw new ApiError(413, "BODY_TOO_LARGE", "Request body is too large.");
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function fail(res: any, error: unknown, id: string) {
  const e = error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR", "Unable to process the request.");
  if (!(error instanceof ApiError)) console.error(`[${id}]`, error);
  return json(res, e.status, {
    success: false,
    error: { code: e.code, message: e.message },
    requestId: id,
  });
}

export function methodGuard(req: any, res: any, allowed: string[]) {
  const method = String(req?.method || "GET").toUpperCase();
  if (method === "OPTIONS") {
    res.status(204).end();
    return false;
  }
  if (!allowed.includes(method)) {
    res.setHeader("Allow", allowed.join(", "));
    json(res, 405, { success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } });
    return false;
  }
  return true;
}
