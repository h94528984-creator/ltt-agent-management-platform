import { Request, Response, NextFunction } from "express";
import { verifyToken, getTokenIssuedAt } from "../lib/auth";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
  userName?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const issuedAt = getTokenIssuedAt(token);
  const [user] = await db.select({
    id: usersTable.id,
    isActive: usersTable.isActive,
    role: usersTable.role,
    fullName: usersTable.fullName,
    passwordChangedAt: usersTable.passwordChangedAt,
  }).from(usersTable).where(eq(usersTable.id, userId));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "User not found or inactive" });
    return;
  }
  if (issuedAt != null && user.passwordChangedAt && issuedAt < user.passwordChangedAt.getTime()) {
    res.status(401).json({ error: "Session expired (password changed)" });
    return;
  }
  req.userId = userId;
  req.userRole = user.role;
  req.userName = user.fullName;
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
