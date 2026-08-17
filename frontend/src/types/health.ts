export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  checks: Record<string, string>;
  extra?: Record<string, string>;
}
