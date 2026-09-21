type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function getIp(req: any) {
  const forwarded = String(req?.headers?.["x-forwarded-for"] || "");
  return forwarded.split(",")[0].trim() || String(req?.socket?.remoteAddress || "unknown");
}

export function rateLimit(req: any) {
  const ip = getIp(req);
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - bucket.count),
    resetAt: bucket.resetAt,
  };
}
