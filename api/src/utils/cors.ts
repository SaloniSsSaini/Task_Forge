import { env } from "../config/env.js";

export function isAllowedWebOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin === env.WEB_ORIGIN) return true;
  if (env.NODE_ENV === "development") {
    try {
      const u = new URL(origin);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function socketCorsOrigin(origin: string | undefined, callback: (err: Error | null, ok: boolean) => void): void {
  callback(null, isAllowedWebOrigin(origin));
}
