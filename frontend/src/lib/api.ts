const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchHealth(): Promise<import("@/types/health").HealthResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/health`);
  if (!res.ok) throw new Error("Backend unhealthy");
  return res.json();
}

export async function fetchHealthLive(): Promise<import("@/types/health").HealthResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/health/live`);
  if (!res.ok) throw new Error("Backend not alive");
  return res.json();
}
