import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  userId?: number;
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
  const [user] = await db.select({ id: usersTable.id, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "User not found or inactive" });
    return;
  }
  req.userId = userId;
  next();
}
