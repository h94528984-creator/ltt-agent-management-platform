import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "ltt-platform-secret-2024";

export function hashPassword(password: string): string {
  return createHmac("sha256", SECRET).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

export function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, ts, sig] = parts;
    const payload = `${userId}:${ts}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}

export function getTokenIssuedAt(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    return parseInt(parts[1], 10);
  } catch {
    return null;
  }
}
